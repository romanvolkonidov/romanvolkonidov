  const ReviewWhQ = [
    {
      id: 1,
      type: "multipleChoice",
      question: "Where does the sun rise?",
      options: ["In the east", "In the west", "In the north", "In the south"],
      correctAnswer: "In the east",
      explanation: "The sun always rises in the east due to the Earth's rotation from west to east."
    },
    {
      id: 2,
      type: "fillInTheBlank",
      question: "_____ is the capital of France?",
      correctAnswer: "What",
      explanation: "We use 'What' to ask about specific things or places, like the capital of a country."
    },
    {
      id: 3,
      type: "trueFalse",
      question: "Is the following statement correct: 'How old are you?'",
      statement: "'How old are you?' is a correct way to ask about someone's age.",
      correctAnswer: "true",
      explanation: "This is a standard and polite way to ask about someone's age in English."
    },
    {
      id: 4,
      type: "ordering",
      question: "Put the words in the correct order to form a question:",
      words: ["do", "live", "where", "you"],
      correctAnswer: ["Where", "do", "you", "live"],
      explanation: "In English questions, we usually start with the question word (Where), followed by the auxiliary verb (do), then the subject (you), and finally the main verb (live)."
    },
    {
      id: 5,
      type: "matching",
      question: "Match the question words with their functions:",
      pairs: [
        { question: "Where", function: "Reason" },
        { question: "When", function: "Place" },
        { question: "Why", function: "Time" },
        { question: "How", function: "Manner" }
      ],
      correctAnswer: {
        "Where": "Place",
        "When": "Time",
        "Why": "Reason",
        "How": "Manner"
      },
      explanation: "Each question word is used to ask about a specific type of information: Where for place, When for time, Why for reason, and How for manner."
    },
    {
      id: 6,
      type: "fillInTheBlank",
      question: "Complete the sentence: They are ______",
      pictureUrl: "https://firebasestorage.googleapis.com/v0/b/tracking-budget-app.appspot.com/o/bucket%2Ffriends.jpg?alt=media&token=86e65a2a-721f-427b-94c5-1ab2e14ce08a",
      altText: "A group of diverse young people smiling and embracing each other outdoors",
      correctAnswer: "friends",
      explanation: "Два ребенка которые держатся за руки, это friends."
    
    },
    {
      id: 7,
      type: "dropdown",
      question: "_____ do you usually have breakfast?",
      options: ["Where", "When", "Why", "Who"],
      correctAnswer: "When",
      explanation: "We use 'When' to ask about the time of an action or event, such as having breakfast."
    },
    {
      id: 8,
      type: "fillInTheBlank",
      question: "Listen to the audio and answer: _____ ____ are you away?",
      audioUrl: "https://firebasestorage.googleapis.com/v0/b/tracking-budget-app.appspot.com/o/bucket%2F8.wav?alt=media&token=08feed15-4807-4816-bfd4-da26f216b3c7",
      correctAnswer: "How long",
      explanation: "Правильный ответ 'How long', потому что это подходящая фраза для вопроса о продолжительности времени, в течение которого кто-то отсутствует. "
  },
    {
      id: 9,
      type: "sentenceCompletion",
      question: "Complete the sentence: '_____ is your favorite color?' '_____ favorite color is blue.'",
      options: ["What", "My"],
      correctAnswer: ["What", "My"],
      explanation: "We use 'What' to ask about someone's preference, and 'My' is used in the response to indicate personal possession."
    },
    {
      id: 10,
      type: "errorCorrection",
      question: "Correct the error in this question: 'Where you are going?'",
      correctAnswer: "Where are you going?",
      explanation: "In question formation, the auxiliary verb 'are' should come before the subject 'you'."
    },
    {
      id: 11,
      type: "videoQuestion",
      question: "___ ___ 80% of all Americans live east of this line?",
      videoUrl: "https://www.youtube.com/shorts/p5DfhG_DKSk",
      correctAnswer: "Why do",
      explanation: "Мы используем 'Why' для вопросов о причинах или мотивах. "
    },

  ];

  export default ReviewWhQ;
