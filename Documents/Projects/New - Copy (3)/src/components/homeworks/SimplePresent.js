const SimplePresent = [
  {
    id: 1,
    type: "trueFalse",
    question: "Is the following statement correct: 'I eat breakfast every morning.'",
    statement: "'I eat breakfast every morning.' is a correct simple present affirmative sentence.",
    correctAnswer: "true",
    explanation: "Это предложение правильно использует настоящее простое время для описания привычного действия."
  },
  {
    id: 2,
    type: "multipleChoice",
    question: "Which sentence is in the simple present negative form?",
    options: [
      "She likes vegetables.",
      "He doesn't drink coffee.",
      "We are eating pizza.",
      "They cook dinner."
    ],
    correctAnswer: "He doesn't drink coffee.",
    explanation: "Предложение 'He doesn't drink coffee.' находится в отрицательной форме настоящего простого времени, используя 'doesn't' перед основным глаголом."
  },
  {
    id: 3,
    type: "fillInTheBlank",
    question: "Tom ____ (not/like) spicy food.",
    correctAnswer: "doesn't like",
    explanation: "Для третьего лица единственного числа (he/she/it) в отрицательной форме настоящего простого времени мы используем 'doesn't' перед основным глаголом."
  },
  {
    id: 4,
    type: "matching",
    question: "Match the question words with their functions:",
    pairs: [
      { question: "I", function: "eats" },
      { question: "He", function: "eat" }     
    ],
    correctAnswer: {
      "I": "eat",
      "He": "eats"
      
    },
    explanation: "В настоящем простом времени только к глаголам в третьем лице единственного числа (he/she/it) добавляется окончание -s."
  },
  {
    id: 5,
    type: "ordering",
    question: "Put the words in the correct order to form a simple present affirmative sentence:",
    words: ["every", "dinner", "we", "cook", "evening"],
    correctAnswer: ["We", "cook", "dinner", "every", "evening"],
    explanation: "В утвердительных предложениях настоящего простого времени мы обычно используем структуру: подлежащее + глагол + дополнение + обстоятельство времени."
  },
  {
    id: 6,
    type: "errorCorrection",
    question: "Correct the error in this simple present sentence: 'She don't like chocolate.'",
    correctAnswer: "She doesn't like chocolate.",
    explanation: "Для третьего лица единственного числа (she) в отрицательной форме настоящего простого времени мы используем 'doesn't' вместо 'don't'."
  },
  {
    id: 7,
    type: "dropdown",
    question: "My sister ____ (like) salad for lunch.",
    options: ["like", "likes", "liking", "to like"],
    correctAnswer: "likes",
    explanation: "Для третьего лица единственного числа (he/she/it) в утвердительной форме настоящего простого времени мы добавляем окончание -s к глаголу."
  },
  {
    id: 8,
    type: "imageQuestion",
    question: "____ ____ with tomatoes and onions",
    imageUrl: "https://images.freeimages.com/images/large-previews/f3f/food-1171568.jpg",
    altText: "Food",
    correctAnswer: "Spinach salad",
    explanation: "Это изображение показывает салат из шпината с помидорами и луком, который называется 'Spinach salad'."
  },
  {
    id: 9,
    type: "audioQuestion",
    question: "Type what you hear",
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/tracking-budget-app.appspot.com/o/bucket%2FI%20like%20pasta%20with%20chocola%201.wav?alt=media&token=272e4f72-b3b5-4706-a118-029df3b7ebe8",
    correctAnswer: "I like pasta with chocolate sauce",
    explanation: "Да, именно с шоколадным"
  },
  {
    id: 10,
    type: "sentenceCompletion",
    question: "Complete the sentences: 'I ____ (like) fruit. I ____ (not/like) candy.'",
    options: ["like", "don't like"],
    correctAnswer: ["like", "don't like"],
    explanation: "Для 'I' в настоящем простом времени мы используем базовую форму глагола для утвердительных предложений и 'don't' + базовую форму для отрицательных."
  },
  {
    id: 11,
    type: "videoQuestion",
    question: "Watch the video from 0.51 to 0.57 and answer: He ____ ____",
    videoUrl: "https://youtu.be/lFzVJEksoDY?t=52",
    correctAnswer: "looks blue",
    explanation: "'He looks blue' - это идиома, означающая он выглядит грустным или он кажется подавленным. В английском языке цвет blue (синий) часто ассоциируется с грустью или меланхолией.Эта фраза используется, когда кто-то кажется расстроенным или в плохом настроении. Например 'Иван сегодня какой-то не такой. He looks blue. Может, что-то случилось?' Это разговорное выражение, и его не следует понимать буквально."
  }
];
export default SimplePresent;