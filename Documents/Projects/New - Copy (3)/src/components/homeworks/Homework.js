import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Alert, { AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import confetti from 'canvas-confetti';
import { 
  MultipleChoice, 
  FillInTheBlank, 
  TrueFalse, 
  Ordering, 
  Matching, 
  ImageQuestion, 
  Dropdown, 
  AudioQuestion, 
  SentenceCompletion, 
  ErrorCorrection,
  VideoQuestion,
  MediaContent
} from './QuestionTypes';

const Homework = ({ studentId, homeworkData, questions, onClose, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(questions.length).fill(''));
  const [score, setScore] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState({});
  const [showExplanation, setShowExplanation] = useState({});

  const quizName = useMemo(() => {
    if (questions.length > 0 && questions[0].category) {
      return questions[0].category;
    }
    return 'Домашняя работа';
  }, [questions]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const studentDocRef = doc(db, 'students', studentId);
        const studentDoc = await getDoc(studentDocRef);

        if (studentDoc.exists()) {
          const data = studentDoc.data();
          if (data.answers && Array.isArray(data.answers)) {
            setAnswers(data.answers.map(answer => 
              typeof answer === 'string' ? answer : JSON.stringify(answer)
            ));
          }
          if (data.score !== undefined) {
            setScore(data.score);
            setShowFeedback(true);
          }
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleInputChange = (value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = value;
      return newAnswers;
    });
  };

 const renderQuestion = (question, index) => {
  const value = answers[index];
  const handleChange = (newValue) => handleInputChange(newValue, index);

  const commonProps = {
    question: question.question,
    onChange: handleChange,
    value: value,
    pictureUrl: question.pictureUrl,
    audioUrl: question.audioUrl,
    videoUrl: question.videoUrl,
    className: "text-black text-sm"
  };

  switch (question.type) {
    case 'multipleChoice':
      return <MultipleChoice {...commonProps} options={question.options} />;
    case 'fillInTheBlank':
      return <FillInTheBlank {...commonProps} />;
    case 'trueFalse':
      return <TrueFalse {...commonProps} />;
    case 'ordering':
      return <Ordering {...commonProps} words={question.words} />;
    case 'matching':
      return <Matching {...commonProps} pairs={question.pairs} />;
    case 'imageQuestion':
      return <ImageQuestion {...commonProps} />;
    case 'dropdown':
      return <Dropdown {...commonProps} options={question.options} />;
    case 'audioQuestion':
      return <AudioQuestion {...commonProps} />;
    case 'sentenceCompletion':
      return <SentenceCompletion {...commonProps} options={question.options} />;
    case 'errorCorrection':
      return <ErrorCorrection {...commonProps} />;
    case 'videoQuestion':
      return <VideoQuestion {...commonProps} />;
    default:
      return <MediaContent {...commonProps} />;
  }
};

  const checkAnswers = async () => {
    try {
      let correct = 0;
      questions.forEach((q, index) => {
        if (isCorrect(index)) {
          correct++;
        }
      });
  
      const newScore = Number(((correct / questions.length) * 100).toFixed(2));
      setScore(newScore);
      setShowFeedback(true);
      setIsSubmitted(true);
  
      const filteredAnswers = Object.fromEntries(
        Object.entries(answers).filter(([_, value]) => value !== undefined)
      );
  
      await updateDoc(doc(db, 'students', studentId), { 
        [`homeworkScores.${quizName}`]: newScore,
        answers: filteredAnswers
      });
  
      if (typeof onComplete === 'function') {
        onComplete(newScore, quizName);
      }
  
      if (newScore > 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error('Error in checkAnswers:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      checkAnswers();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isCorrect = (index) => {
    const question = questions[index];
    let userAnswer = answers[index];
  
    if (!question || userAnswer === undefined) return false;
  
    const normalizeAnswer = (answer) => {
      if (typeof answer === 'string') return answer.toLowerCase().trim();
      if (Array.isArray(answer)) return answer.map(a => normalizeAnswer(a));
      if (typeof answer === 'object' && answer !== null) {
        return Object.fromEntries(
          Object.entries(answer).map(([k, v]) => [normalizeAnswer(k), normalizeAnswer(v)])
        );
      }
      return answer;
    };
  
    userAnswer = normalizeAnswer(userAnswer);
    const correctAnswer = normalizeAnswer(question.correctAnswer);
  
    switch (question.type) {
      case 'multipleChoice':
      case 'fillInTheBlank':
      case 'trueFalse':
      case 'dropdown':
      case 'audioQuestion':
      case 'videoQuestion':
      case 'errorCorrection':
      case 'imageQuestion':
        return userAnswer === correctAnswer;
      case 'ordering':
        if (typeof userAnswer === 'string') {
          userAnswer = userAnswer.split(',').map(item => item.trim().toLowerCase());
        }
        if (typeof correctAnswer === 'string') {
          correctAnswer = correctAnswer.split(',').map(item => item.trim().toLowerCase());
        }
        return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
      case 'matching':
        return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
      case 'sentenceCompletion':
        return Array.isArray(userAnswer) && Array.isArray(correctAnswer) &&
          userAnswer.length === correctAnswer.length &&
          userAnswer.every((ans, i) => ans === correctAnswer[i]);
      default:
        return false;
    }
  };

  const retakeQuiz = async () => {
    setAnswers(new Array(questions.length).fill(''));
    setScore(null);
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setShowFeedback(false);
    setShowHint({});
    setShowExplanation({});
    await updateDoc(doc(db, 'students', studentId), { answers: [], score: null });
  };

  const toggleHint = (index) => {
    setShowHint(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleExplanation = (index) => {
    setShowExplanation(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderAnswer = (answer) => {
    if (typeof answer === 'object' && answer !== null) {
      if (Array.isArray(answer)) {
        return answer.join(', ');
      } else {
        return Object.entries(answer).map(([key, value]) => `${key}: ${value}`).join(', ');
      }
    }
    return answer || 'No answer provided';
  };

  const CustomProgressBar = ({ value, max }) => {
    const percentage = (value / max) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-white rounded-xl shadow-lg flex flex-col">
      <Button
        onClick={onClose}
        className="bg-black hover:bg-gray-800 text-white px-4 py-2"
      >
        <X className="mr-2 h-4 w-4" />
        Close
      </Button>
      <div className="p-6 flex-grow overflow-y-auto pb-20">
        <h1 className="text-3xl font-bold mb-4 text-center text-black">{quizName}</h1>
  
        {!isSubmitted ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold text-black">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
            
            <CustomProgressBar 
              value={currentQuestionIndex + 1}
              max={questions.length}
            />
            
            <Card className="mb-4 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-black">
                  Question {currentQuestionIndex + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                {renderQuestion(questions[currentQuestionIndex], currentQuestionIndex)}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-6">
            <Alert variant={score > 70 ? "success" : "warning"}>
              <AlertTitle>Quiz Result</AlertTitle>
              <AlertDescription>
                Your score: {score !== null ? score.toFixed(2) : 'N/A'}%
                {score > 80 && (
                  <div className="mt-2">
                    <CheckCircle className="inline-block mr-2 h-5 w-5 text-yellow-500" />
                    Congratulations on your excellent performance!
                  </div>
                )}
              </AlertDescription>
            </Alert>
      
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-black mb-4">Detailed Review</h3>
              {questions.map((q, index) => (
                <Card key={index} className="mb-4 hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-black">Question {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-black">{q.question}</p>
                    <div className={`p-3 rounded-md ${isCorrect(index) ? 'bg-green-100' : 'bg-red-100'}`}>
                      <p className="font-semibold text-black">Your answer: {renderAnswer(answers[index])}</p>
                    </div>
                    {isCorrect(index) ? (
                      <div className="mt-2 flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span>Correct!</span>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <p className="text-red-600 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          Incorrect. The correct answer is: {renderAnswer(q.correctAnswer)}
                        </p>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-md">
                        <p className="text-blue-800">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-t border-gray-200">
        {!isSubmitted ? (
          <>
            <Button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2"
            >
              Previous
            </Button>
            <Button
              onClick={nextQuestion}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            onClick={retakeQuiz}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2"
          >
            Retake Quiz
          </Button>
        )}
      </div>
    </div>
  );
}

export default Homework;