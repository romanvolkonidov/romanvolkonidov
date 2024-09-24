import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const TablePage = () => {
  const [view, setView] = useState('completed'); // 'completed', 'homework', 'future'
  const [library, setLibrary] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedHomework, setSelectedHomework] = useState('');
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchLibrary = async () => {
      const querySnapshot = await getDocs(collection(db, 'library'));
      const libraryData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLibrary(libraryData);
    };

    fetchLibrary();
  }, []);

  const handleAddData = () => {
    const newData = {
      date: new Date().toISOString().split('T')[0],
      course: library.find(course => course.id === selectedCourse)?.name || '',
      chapter: library.find(course => course.id === selectedCourse)?.chapters.find(chapter => chapter.id === selectedChapter)?.name || '',
      lesson: library.find(course => course.id === selectedCourse)?.chapters.find(chapter => chapter.id === selectedChapter)?.lessons.find(lesson => lesson.id === selectedLesson)?.name || '',
      progress: view === 'completed' ? '0%' : '',
      homework: view === 'homework' ? library.find(course => course.id === selectedCourse)?.chapters.find(chapter => chapter.id === selectedChapter)?.lessons.find(lesson => lesson.id === selectedLesson)?.homeworks.find(homework => homework.id === selectedHomework)?.name || '' : '',
      submit: view === 'homework' ? 'Submit' : '',
      results: view === 'homework' ? 'Pending' : '',
    };

    setTableData([...tableData, newData]);
  };

  const renderDropdowns = () => (
    <div className="mb-4 flex flex-wrap gap-2">
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Выберите курс</option>
        {library.map(course => (
          <option key={course.id} value={course.id}>{course.name}</option>
        ))}
      </select>

      <select
        value={selectedChapter}
        onChange={(e) => setSelectedChapter(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Выберите тему</option>
        {library
          .find(course => course.id === selectedCourse)?.chapters
          ?.map(chapter => (
            <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
          ))}
      </select>

      <select
        value={selectedLesson}
        onChange={(e) => setSelectedLesson(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Выберите урок</option>
        {library
          .find(course => course.id === selectedCourse)?.chapters
          ?.find(chapter => chapter.id === selectedChapter)?.lessons
          ?.map(lesson => (
            <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
          ))}
      </select>

      {view === 'homework' && (
        <select
          value={selectedHomework}
          onChange={(e) => setSelectedHomework(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Выберите домашнюю работу</option>
          {library
            .find(course => course.id === selectedCourse)?.chapters
            ?.find(chapter => chapter.id === selectedChapter)?.lessons
            ?.find(lesson => lesson.id === selectedLesson)?.homeworks
            ?.map(homework => (
              <option key={homework.id} value={homework.id}>{homework.name}</option>
            ))}
        </select>
      )}
    </div>
  );

  const renderTable = () => {
    let headers;

    switch (view) {
      case 'completed':
        headers = ['Дата', 'Курс', 'Тема', 'Урок', 'Прогресс'];
        break;
      case 'homework':
        headers = ['Дата', 'Домашняя работа', 'Сдать Домашнюю работу', 'Результаты'];
        break;
      case 'future':
        headers = ['Курс', 'Тема', 'Урок'];
        break;
      default:
        headers = [];
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              {headers.map((header, index) => (
                <th key={index} className="p-2 text-left border">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData
              .filter(row => {
                if (view === 'completed') return row.progress !== '';
                if (view === 'homework') return row.homework !== '';
                if (view === 'future') return row.progress === '' && row.homework === '';
                return false;
              })
              .map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="p-2 border">
                      {row[header.toLowerCase().replace(/ /g, '')]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Таблица студента</h1>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setView('completed')}
          className={`px-4 py-2 rounded ${view === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Завершенные уроки
        </button>
        <button
          onClick={() => setView('homework')}
          className={`px-4 py-2 rounded ${view === 'homework' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Домашние задания
        </button>
        <button
          onClick={() => setView('future')}
          className={`px-4 py-2 rounded ${view === 'future' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Будущие уроки
        </button>
      </div>

      {renderDropdowns()}
      <button
        onClick={handleAddData}
        className="px-4 py-2 rounded bg-green-500 text-white mb-4"
      >
        Добавить данные
      </button>
      {renderTable()}
    </div>
  );
};

export default TablePage;