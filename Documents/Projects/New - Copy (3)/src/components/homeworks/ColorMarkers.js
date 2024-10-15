const ColorMarkers = [
  {
    "id": 2,
    "type": "multipleChoice",
    "question": "Какое значение в шестнадцатеричном формате соответствует чистому красному цвету?",
    "options": [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFFFF"
    ],
    "correctAnswer": "#FF0000",
    "explanation": "#FF0000 представляет максимальное значение для красного (FF) и нулевые значения для зеленого (00) и синего (00) компонентов."
  },
  {
    "id": 3,
    "type": "multipleChoice",
    "question": "Как записать полупрозрачный синий цвет в формате RGBA?",
    "options": [
      "rgba(255, 0, 0, 0.5)",
      "rgba(0, 255, 0, 0.5)",
      "rgba(0, 0, 255, 0.5)",
      "rgba(255, 255, 255, 0.5)"
    ],
    "correctAnswer": "rgba(0, 0, 255, 0.5)",
    "explanation": "RGBA позволяет задать цвет и прозрачность. Здесь (0, 0, 255) - это синий цвет, а 0.5 - это 50% непрозрачности."
  },
  {
    "id": 4,
    "type": "multipleChoice",
    "question": "Какой цвет получится при смешении красного и зеленого в равных пропорциях?",
    "options": [
      "Оранжевый",
      "Фиолетовый",
      "Коричневый",
      "Желтый"
    ],
    "correctAnswer": "Желтый",
    "explanation": "В аддитивной цветовой модели RGB смешение красного и зеленого в равных пропорциях дает желтый цвет."
  },
  {
    "id": 5,
    "type": "multipleChoice",
    "question": "Как создать линейный градиент от красного к синему?",
    "options": [
      "gradient(red, blue)",
      "linear(red, blue)",
      "linear-gradient(to right, red, blue)",
      "color-mix(red, blue)"
    ],
    "correctAnswer": "linear-gradient(to right, red, blue)",
    "explanation": "Функция linear-gradient() создает изображение с плавным переходом между цветами. 'to right' указывает направление градиента."
  },
  {
    "id": 6,
    "type": "multipleChoice",
    "question": "Какое свойство CSS используется для изменения цвета текста?",
    "options": [
      "text-color",
      "font-color",
      "color",
      "text-style"
    ],
    "correctAnswer": "color",
    "explanation": "Свойство color в CSS используется для задания цвета текста элемента."
  },
  {
    "id": 7,
    "type": "multipleChoice",
    "question": "Как задать цвет фона элемента?",
    "options": [
      "bg-color",
      "background-color",
      "fill-color",
      "element-color"
    ],
    "correctAnswer": "background-color",
    "explanation": "Свойство background-color используется для задания цвета фона элемента в CSS."
  },
  {
    "id": 8,
    "type": "multipleChoice",
    "question": "Какой цветовой формат позволяет указать оттенок, насыщенность и яркость?",
    "options": [
      "RGB",
      "HEX",
      "CMYK",
      "HSL"
    ],
    "correctAnswer": "HSL",
    "explanation": "HSL (Hue, Saturation, Lightness) позволяет задать цвет, указав его оттенок, насыщенность и яркость."
  },
  {
    "id": 10,
    "type": "multipleChoice",
    "question": "Какое значение прозрачности в формате RGBA соответствует полностью непрозрачному цвету?",
    "options": [
      "1",
      "0",
      "100",
      "255"
    ],
    "correctAnswer": "1",
    "explanation": "В формате RGBA значение альфа-канала (прозрачности) варьируется от 0 (полностью прозрачный) до 1 (полностью непрозрачный)."
  },
  {
    "id": 11,
    "type": "multipleChoice",
    "question": "Как задать цвет границы элемента?",
    "options": [
      "outline-color",
      "stroke-color",
      "edge-color",
      "border-color"
    ],
    "correctAnswer": "border-color",
    "explanation": "Свойство border-color используется для задания цвета границы элемента в CSS."
  },
  {
    "id": 12,
    "type": "multipleChoice",
    "question": "Какой цвет получится при смешении синего и желтого?",
    "options": [
      "Зеленый",
      "Оранжевый",
      "Фиолетовый",
      "Коричневый"
    ],
    "correctAnswer": "Зеленый",
    "explanation": "В субтрактивной цветовой модели (как при смешивании красок) синий и желтый дают зеленый цвет."
  },
  {
    "id": 14,
    "type": "multipleChoice",
    "question": "Какое свойство CSS используется для создания тени вокруг элемента?",
    "options": [
      "element-shadow",
      "outer-shadow",
      "drop-shadow",
      "box-shadow"
    ],
    "correctAnswer": "box-shadow",
    "explanation": "Свойство box-shadow используется для добавления тени вокруг элемента в CSS."
  },
  {
    "id": 15,
    "type": "multipleChoice",
    "question": "Как задать цвет для посещенной ссылки?",
    "options": [
      "a:visited { color: purple; }",
      "a.visited { color: purple; }",
      "a:link { color: purple; }",
      "a:hover { color: purple; }"
    ],
    "correctAnswer": "a:visited { color: purple; }",
    "explanation": "Псевдокласс :visited используется для стилизации посещенных ссылок."
  },
  {
    "id": 16,
    "type": "multipleChoice",
    "question": "Какой цветовой формат занимает наименьшее количество символов?",
    "options": [
      "RGB",
      "HSL",
      "HEX",
      "Именованные цвета"
    ],
    "correctAnswer": "HEX",
    "explanation": "Шестнадцатеричный (HEX) формат цвета часто является самым компактным, например, #FFF для белого цвета."
  },
  {
    "id": 18,
    "type": "multipleChoice",
    "question": "Какое значение в HSL соответствует чистому зеленому цвету?",
    "options": [
      "hsl(0, 100%, 50%)",
      "hsl(240, 100%, 50%)",
      "hsl(60, 100%, 50%)",
      "hsl(120, 100%, 50%)"
    ],
    "correctAnswer": "hsl(120, 100%, 50%)",
    "explanation": "В HSL, 120 градусов соответствует зеленому оттенку, 100% насыщенности дает чистый цвет, а 50% яркости - полную яркость."
  }
];

export default ColorMarkers;