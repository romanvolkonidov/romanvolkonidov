import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const TablePage = () => {
  const [view, setView] = useState('completed'); // 'completed', 'homework', 'future'
  const [library, setLibrary] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedHomework, setSelectedHomework] = useState('');
  const [progress, setProgress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  useEffect(() => {
    const fetchLibraryAndTableData = async () => {
      try {
        setLoading(true);
        const librarySnapshot = await getDocs(collection(db, 'library'));
        const tableDataSnapshot = await getDocs(collection(db, 'tableData'));

        const libraryData = librarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const tableData = tableDataSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setLibrary(libraryData);
        setTableData(tableData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryAndTableData();
  }, []);

  const handleAddData = async () => {
    const selectedCourseData = library.find(course => course.id === selectedCourse);
    if (!selectedCourseData) return alert("Please select a valid course.");
    
    const selectedChapterData = selectedCourseData.chapters?.find(chapter => chapter.id === selectedChapter);
    if (!selectedChapterData) return alert("Please select a valid chapter.");
    
    const selectedLessonData = selectedChapterData.lessons?.find(lesson => lesson.id === selectedLesson);
    if (!selectedLessonData) return alert("Please select a valid lesson.");
    
    const selectedHomeworkData = selectedLessonData?.homeworks?.find(homework => homework.id === selectedHomework);
    
    const newData = {
      date,
      course: selectedCourseData.name || '',
      chapter: selectedChapterData.name || '',
      lesson: selectedLessonData.name || '',
      progress: view === 'completed' ? progress : '',
      homework: view === 'homework' ? selectedHomeworkData?.name || '' : '',
      submit: view === 'homework' ? 'Submit' : '',
      results: view === 'homework' ? 'Pending' : '',
    };

    try {
      setIsSubmitting(true);
      const docRef = await addDoc(collection(db, 'tableData'), newData);
      setTableData([...tableData, { id: docRef.id, ...newData }]);
    } catch (error) {
      console.error("Error adding document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRow = async (id) => {
    const docRef = doc(db, 'tableData', id);
    try {
      await deleteDoc(docRef);
      setTableData(tableData.filter(row => row.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
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
        headers = ['Дата', 'Курс', 'Тема', 'Урок', 'Прогресс', 'Действия'];
        break;
      case 'homework':
        headers = ['Дата', 'Домашняя работа', 'Сдать Домашнюю работу', 'Результаты', 'Действия'];
        break;
      case 'future':
        headers = ['Курс', 'Тема', 'Урок', 'Действия'];
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
                <tr key={row.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="p-2 border">
                      {header === 'Действия' ? (
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="px-2 py-1 rounded bg-red-500 text-white"
                        >
                          Удалить
                        </button>
                      ) : header === 'Дата' ? (
                        row.date
                      ) : header === 'Курс' ? (
                        row.course
                      ) : header === 'Тема' ? (
                        row.chapter
                      ) : header === 'Урок' ? (
                        row.lesson
                      ) : header === 'Прогресс' ? (
                        <div className="w-full bg-gray-200 rounded">
                          <div
                            className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded"
                            style={{ width: `${row.progress}%` }}
                          >
                            {row.progress}%
                          </div>
                        </div>
                      ) : header === 'Домашняя работа' ? (
                        row.homework
                      ) : header === 'Сдать Домашнюю работу' ? (
                        row.submit
                      ) : header === 'Результаты' ? (
                        row.results
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };
  

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Таблица студента</h1>
      
      <div className="mb-4">
        <button onClick={() => setView('completed')} className="p-2 border rounded">Completed</button>
        <button onClick={() => setView('homework')} className="p-2 border rounded ml-2">Homework</button>
        <button onClick={() => setView('future')} className="p-2 border rounded ml-2">Future</button>
      </div>

      {renderDropdowns()}

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          placeholder="Прогресс (%)"
          className="p-2 border rounded"
        />
      </div>

      <button
        onClick={handleAddData}
        disabled={isSubmitting}
        className="p-2 bg-blue-500 text-white rounded"
      >
        {isSubmitting ? 'Submitting...' : 'Add Data'}
      </button>

      {renderTable()}
    </div>
  );
};

export default TablePage;