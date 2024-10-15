import React, { useState, useEffect } from 'react';
import Alert, {AlertDescription } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { Check, X } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SimplePresent = ({ studentId }) => {
  const [answers, setAnswers] = useState({
    fillBlanks: [[''], [''], ['', ''], ['']],
    makeNegative: [[''], [''], [''], ['']],
    createQuestions: [[''], [''], [''], ['']],
    correctErrors: [[''], [''], [''], ['']]
  });
  const initialAnswers = {
    fillBlanks: [[''], [''], ['', ''], ['']],
    makeNegative: [[''], [''], [''], ['']],
    createQuestions: [[''], [''], [''], ['']],
    correctErrors: [[''], [''], [''], ['']]
  };
  const [score, setScore] = useState(null);
  const [currentSection, setCurrentSection] = useState('fillBlanks');
  const [showFeedback, setShowFeedback] = useState(false);


  const questions = {
    fillBlanks: [
      'My sister _____ (study) every evening.',
      'They _____ (not/eat) meat.',
      '_____ you _____ (drink) coffee in the morning?',
      'The sun _____ (rise) in the east.'
    ],
    makeNegative: [
      'I play tennis on weekends.',
      'She knows the answer.',
      'We go to the beach in summer.',
      'The stores open at 9 AM.'
    ],
    createQuestions: [
      '(where / you / live)',
      '(what time / the movie / start)',
      '(how often / he / exercise)',
      '(why / they / not / like / vegetables)'
    ],
    correctErrors: [
      'John don\'t like spicy food.',
      'Does they work on Saturdays?',
      'The children plays in the park every day.',
      'I doesn\'t understand this lesson.'
    ]
  };

  const correctAnswers = {
    fillBlanks: [['studies'], ['don\'t eat'], ['Do', 'drink'], ['rises']],
    makeNegative: [
      'I don\'t play tennis on weekends.',
      'She doesn\'t know the answer.',
      'We don\'t go to the beach in summer.',
      'The stores don\'t open at 9 AM.'
    ],
    createQuestions: [
      'Where do you live?',
      'What time does the movie start?',
      'How often does he exercise?',
      'Why don\'t they like vegetables?'
    ],
    correctErrors: [
      'John doesn\'t like spicy food.',
      'Do they work on Saturdays?',
      'The children play in the park every day.',
      'I don\'t understand this lesson.'
    ]
  };

  const explanations = {
    fillBlanks: [
      'We use "-s" or "-es" for third-person singular (he/she/it) in simple present.',
      'For negatives, we use "don\'t" (or "doesn\'t" for he/she/it) before the main verb.',
      'Questions start with "Do" (or "Does" for he/she/it) followed by the subject and main verb.',
      'The sun is treated as third-person singular (it), so we add "-s" to the verb.'
    ],
    makeNegative: [
      'To make a negative, use "don\'t" before the main verb.',
      'For third-person singular (she), use "doesn\'t" before the main verb.',
      'Use "don\'t" for plural subjects (we) in negative sentences.',
      'For plural subjects (stores), use "don\'t" to make the sentence negative.'
    ],
    createQuestions: [
      'Start with the question word, then use "do" and the subject before the main verb.',
      'Use "does" for third-person singular subjects (the movie) in questions.',
      'For "how often" questions with he/she/it, use "does" before the subject.',
      'In negative questions, use "don\'t" or "doesn\'t" after the subject.'
    ],
    correctErrors: [
      'For third-person singular (John), use "doesn\'t" instead of "don\'t".',
      'Use "Do" instead of "Does" for plural subjects (they) in questions.',
      'For plural subjects (children), don\'t add "-s" to the verb in simple present.',
      'For first-person singular (I), use "don\'t" instead of "doesn\'t".'
    ]
  };

  const sectionTitles = {
    fillBlanks: 'Fill in the blanks',
    makeNegative: 'Make negative statements',
    createQuestions: 'Create questions',
    correctErrors: 'Correct the errors'
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      const studentDocRef = doc(db, 'students', studentId);
      const studentDoc = await getDoc(studentDocRef);
      
      if (studentDoc.exists()) {
        const data = studentDoc.data();
        if (data.answers) {
          // Ensure all answers are arrays
          const formattedAnswers = Object.keys(data.answers).reduce((acc, section) => {
            acc[section] = data.answers[section].map(answer => 
              Array.isArray(answer) ? answer : [answer]
            );
            return acc;
          }, {});
          setAnswers(formattedAnswers);
        }
        if (data.score !== undefined) {
          setScore(data.score);
          setShowFeedback(true);
        }
        if (data.currentSection) {
          setCurrentSection(data.currentSection);
        }
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleInputChange = (section, questionIndex, answerIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [section]: prev[section].map((question, qIndex) =>
        qIndex === questionIndex
          ? question.map((ans, aIndex) =>
              aIndex === answerIndex ? value : ans
            )
          : question
      )
    }));
  };

  const updateStudentData = async (data) => {
    const studentDocRef = doc(db, 'students', studentId);
    await updateDoc(studentDocRef, data);
  };

  const checkAnswers = async () => {
    let correct = 0;
    let total = 0;
  
    Object.keys(correctAnswers).forEach(section => {
      correctAnswers[section].forEach((correctAnswer, index) => {
        const userAnswer = answers[section][index];
        
        if (Array.isArray(correctAnswer)) {
          if (Array.isArray(userAnswer) && userAnswer.length === correctAnswer.length) {
            if (correctAnswer.every((a, i) => 
              (userAnswer[i]?.toLowerCase().trim() || '') === a.toLowerCase()
            )) {
              correct++;
            }
          }
          total++;
        } else {
          const singleUserAnswer = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
          if ((singleUserAnswer?.toLowerCase().trim() || '') === correctAnswer.toLowerCase()) {
            correct++;
          }
          total++;
        }
      });
    });
  
    const newScore = (correct / total) * 100;
    setScore(newScore);
    setShowFeedback(true);
  
    await updateStudentData({ score: newScore, showFeedback: true });
  };

  const nextSection = async () => {
    const sections = Object.keys(questions);
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      const newSection = sections[currentIndex + 1];
      setCurrentSection(newSection);
      await updateStudentData({ currentSection: newSection });
    } else {
      await checkAnswers();
    }
  };

  const isCorrect = (section, index) => 
    Array.isArray(correctAnswers[section][index])
      ? correctAnswers[section][index].every((answer, i) => 
          answers[section][index][i].toLowerCase().trim() === answer.toLowerCase())
      : answers[section][index][0].toLowerCase().trim() === correctAnswers[section][index].toLowerCase();

      const retakeQuiz = async () => {
        setAnswers(initialAnswers);
        setScore(null);
        setCurrentSection('fillBlanks');
        setShowFeedback(false);}

      const renderInputFields = (section, questionIndex) => {
        return answers[section][questionIndex].map((value, answerIndex) => (
          <input
            key={answerIndex}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(section, questionIndex, answerIndex, e.target.value)}
            className={`border rounded px-3 py-2 ${answers[section][questionIndex].length > 1 ? 'w-1/2 mr-2' : 'w-full'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder={answers[section][questionIndex].length > 1 ? `Answer ${answerIndex + 1}` : "Type your answer here"}
          />
        ));
      };
    
      return (
        <div className="p-4 max-w-2xl mx-auto bg-gray-100 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Simple Present Tense Quiz</h1>
    
          {!showFeedback ? (
        <>
          <Progress value={(Object.keys(questions).indexOf(currentSection) + 1) / Object.keys(questions).length * 100} className="mb-4" />
          
          <h2 className="text-2xl font-semibold mb-4">{sectionTitles[currentSection]}</h2>
          
          {questions[currentSection].map((question, index) => (
            <div key={index} className="mb-4 bg-white p-4 rounded-md shadow">
              <p className="mb-2">{question}</p>
              <div className="flex flex-wrap">
                {renderInputFields(currentSection, index)}
              </div>
            </div>
          ))}

          <button
            onClick={nextSection}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300 w-full"
          >
            {currentSection === Object.keys(questions)[Object.keys(questions).length - 1] ? 'Finish Quiz' : 'Next Section'}
          </button>
        </>
       ) : (
        <div>
          <Alert className="mb-4">
            <AlertDescription>
              Your score: {score.toFixed(2)}%
            </AlertDescription>
          </Alert>

          {Object.keys(questions).map((section) => (
            <div key={section} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{sectionTitles[section]}</h2>
              {questions[section].map((question, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-center mb-2">
                    <p className="mr-2">{question}</p>
                    <div className="flex">
                      {(answers[section][index] || []).map((ans, i) => (
                        <input
                          key={i}
                          type="text"
                          value={ans}
                          readOnly
                          className={`border rounded px-2 py-1 ${answers[section][index].length > 1 ? 'w-1/2 mr-2' : 'w-full'} ${isCorrect(section, index) ? 'bg-green-100' : 'bg-red-100'}`}
                        />
                      ))}
                    </div>
                    {isCorrect(section, index) ? (
                      <Check className="text-green-500 ml-2" />
                    ) : (
                      <X className="text-red-500 ml-2" />
                    )}
                  </div>
                  {!isCorrect(section, index) && (
                    <div className="text-sm text-red-600 mt-1">
                      <p><strong>Correct answer:</strong> {Array.isArray(correctAnswers[section][index]) ? correctAnswers[section][index].join(', ') : correctAnswers[section][index]}</p>
                      <p><strong>Explanation:</strong> {explanations[section][index]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={retakeQuiz}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300 w-full mt-4"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default SimplePresent;