const HowLong = [
  {
    "id": 1,
    "type": "multipleChoice",
    "question": "How often does the international food festival take place in your city?",
    "options": [
      "It takes place in every summer.",
      "It takes place on every summer.",
      "It takes place every summer.",
      "It takes place at every summer."
    ],
    "correctAnswer": "It takes place every summer.",
    "explanation": "Используйте 'every' непосредственно перед единицами времени для указания частоты, без предлога. 'In' и 'on' неправильны, так как не используются с 'every'. 'At' не подходит для обозначения периодичности."
  },
  {
    "id": 2,
    "type": "fillInTheBlank",
    "question": "The cherry blossom festival occurs _______ spring in Japan.",
    "options": [
      "at",
      "on",
      "for",
      "in"
    ],
    "correctAnswer": "in",
    "explanation": "Используйте 'in' перед названиями сезонов для указания времени событий. 'At' используется для точного времени, 'on' для дней, 'for' для длительности, но не для времени года."
  },
  {
    "id": 4,
    "type": "multipleChoice",
    "question": "The annual tech conference usually lasts _______.",
    "options": [
      "in three days",
      "on three days",
      "by three days",
      "for three days"
    ],
    "correctAnswer": "for three days",
    "explanation": "Используйте 'for' для указания продолжительности. 'In' обозначает время в будущем, 'on' используется для дней недели, 'by' означает 'к определенному времени', что не подходит в данном контексте."
  },
  {
    "id": 5,
    "type": "multipleChoice",
    "question": "How would you describe a musician's preparation for a major concert?",
    "options": [
      "Musicians typically prepare in months before a major concert.",
      "Musicians typically prepare for months before a major concert.",
      "Musicians typically prepare on months before a major concert.",
      "Musicians typically prepare by months before a major concert."
    ],
    "correctAnswer": "Musicians typically prepare for months before a major concert.",
    "explanation": "Используйте 'for' для указания продолжительности подготовки. 'In' неверно, так как не указывает на длительность. 'On' не используется с периодами времени. 'By' означает 'к определенному времени', что не подходит для описания процесса подготовки."
  },
  {
    "id": 6,
    "type": "dropdown",
    "question": "The Olympics take place _______ four years.",
    "options": [
      "at",
      "all",
      "every",
      "whole"
    ],
    "correctAnswer": "every",
    "explanation": "Используйте 'every' перед единицами времени для указания частоты. 'At' используется для точного времени, 'all' и 'whole' не подходят для выражения периодичности событий."
  },
  {
    "id": 7,
    "type": "multipleChoice",
    "question": "How long do art exhibitions usually run at major museums?",
    "options": [
      "Art exhibitions often run in several months.",
      "Art exhibitions often run on several months.",
      "Art exhibitions often run by several months.",
      "Art exhibitions often run for several months."
    ],
    "correctAnswer": "Art exhibitions often run for several months.",
    "explanation": "Используйте 'for' для указания продолжительности. 'In' обозначает время в будущем, 'on' используется для дней недели, 'by' означает 'к определенному времени', что не подходит для описания длительности выставки."
  },
  {
    "id": 10,
    "type": "fillInTheBlank",
    "question": "Parades often take place _______ national holidays.",
    "options": [
      "in",
      "at",
      "for",
      "on"
    ],
    "correctAnswer": "on",
    "explanation": "Используйте 'on' перед конкретными днями или датами. 'In' используется для более длительных периодов, 'at' для точного времени, 'for' для длительности, а не для дат."
  },
  {
    "id": 11,
    "type": "multipleChoice",
    "question": "How would you describe a typical summer vacation?",
    "options": [
      "Families usually go on vacation in several weeks in the summer.",
      "Families usually go on vacation on several weeks in the summer.",
      "Families usually go on vacation for several weeks in the summer.",
      "Families usually go on vacation by several weeks in the summer."
    ],
    "correctAnswer": "Families usually go on vacation for several weeks in the summer.",
    "explanation": "Используйте 'for' для указания продолжительности и 'in' перед сезонами. 'In several weeks' означает 'через несколько недель', 'on' не используется с периодами времени, 'by' означает 'к определенному времени', что не подходит для описания отпуска."
  },
  {
    "id": 12,
    "type": "dropdown",
    "question": "The best time to see wildlife in the national park is _______.",
    "options": [
      "on the early morning",
      "at the early morning",
      "by the early morning",
      "in the early morning"
    ],
    "correctAnswer": "in the early morning",
    "explanation": "Используйте 'in' перед временем суток для указания, когда что-то происходит. 'On' используется для дней, 'at' для точного времени, 'by' означает 'к определенному времени', что не подходит в данном контексте."
  },
  {
    "id": 16,
    "type": "dropdown",
    "question": "Most conference attendees arrive _______ the event.",
    "options": [
      "on the days before",
      "at the days before",
      "in the days before",
      "by the days before"
    ],
    "correctAnswer": "in the days before",
    "explanation": "Используйте 'in' для обозначения периода, предшествующего событию. 'On' используется для конкретных дней, 'at' для точного времени, 'by' означает 'к определенному времени', что не точно отражает смысл фразы."
  },
  {
    "id": 17,
    "type": "multipleChoice",
    "question": "Which statement correctly describes a typical work schedule?",
    "options": [
      "Most people work in eight hours a day, five days a week.",
      "Most people work on eight hours a day, five days a week.",
      "Most people work by eight hours a day, five days a week.",
      "Most people work for eight hours a day, five days a week."
    ],
    "correctAnswer": "Most people work for eight hours a day, five days a week.",
    "explanation": "Используйте 'for' для указания продолжительности и 'a' перед day и week. 'In' означает 'в течение', 'on' используется для дней недели, 'by' означает 'к определенному времени', что не подходит для описания рабочего графика."
  },
  {
    "id": 19,
    "type": "multipleChoice",
    "question": "How do professional athletes train for major competitions?",
    "options": [
      "Athletes typically train intensively in months before major competitions.",
      "Athletes typically train intensively on months before major competitions.",
      "Athletes typically train intensively by months before major competitions.",
      "Athletes typically train intensively for months before major competitions."
    ],
    "correctAnswer": "Athletes typically train intensively for months before major competitions.",
    "explanation": "Используйте 'for' для указания продолжительности подготовки. 'In' означает 'в течение', но не указывает на длительность, 'on' не используется с периодами времени, 'by' означает 'к определенному времени', что не подходит для описания процесса тренировок."
  },
  {
    "id": 20,
    "type": "multipleChoice",
    "question": "Many companies review their financial performance _______.",
    "options": [
      "in every quarter",
      "on every quarter",
      "at every quarter",
      "every quarter"
    ],
    "correctAnswer": "every quarter",
    "explanation": "Используйте 'every' без предлога для указания частоты. 'In', 'on', и 'at' не используются с 'every' в данном контексте, так как 'every' уже указывает на регулярность."
  }
]
export default HowLong;