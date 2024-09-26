import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../firebase';
import Tooltip from '@/components/ui/Tooltip'; // Import Tooltip component

const TablePage = ({ studentId }) => {
  const [view, setView] = useState('completed');
  const [library, setLibrary] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedHomework, setSelectedHomework] = useState('');
  const [progress, setProgress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null); // Add state for active tooltip

  useEffect(() => {
    const fetchLibraryAndTableData = async () => {
      try {
        setLoading(true);
        const librarySnapshot = await getDocs(collection(db, 'library'));
        const tableDataSnapshot = await getDocs(collection(db, 'tableData'));

        const libraryData = librarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const tableData = tableDataSnapshot.docs.map(doc => {
          const course = libraryData.find(course => course.id === doc.data().courseId);
          const chapter = course?.chapters.find(chapter => chapter.id === doc.data().chapterId);
          const lesson = chapter?.lessons.find(lesson => lesson.id === doc.data().lessonId);
          return {
            id: doc.id,
            ...doc.data(),
            course,
            chapter,
            lesson
          };
        });

        setLibrary(libraryData);
        setTableData(tableData.filter(data => data.studentId === studentId));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryAndTableData();
  }, [studentId]);

  const storage = getStorage();

  const uploadFile = async (file) => {
    const storageRef = ref(storage, `files/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const deleteFile = async (fileURL) => {
    const storageRef = ref(storage, fileURL);
    await deleteObject(storageRef);
  };

  const handleAddData = async () => {
    const selectedCourseData = library.find(course => course.id === selectedCourse);
    if (!selectedCourseData) return alert("Please select a valid course.");
    
    const selectedChapterData = selectedCourseData.chapters?.find(chapter => chapter.id === selectedChapter);
    if (!selectedChapterData) return alert("Please select a valid chapter.");
    
    const selectedLessonData = selectedChapterData.lessons?.find(lesson => lesson.id === selectedLesson);
    if (!selectedLessonData) return alert("Please select a valid lesson.");
    
    const selectedHomeworkData = selectedLessonData?.homeworks?.find(homework => homework.id === selectedHomework);
    
    const newData = {
      studentId,
      date,
      courseId: selectedCourseData.id,
      chapterId: selectedChapterData.id,
      lessonId: selectedLessonData.id,
      progress: view === 'completed' ? progress : '',
      homework: view === 'homework' ? selectedHomeworkData?.name || '' : '',
      homeworkFiles: view === 'homework' ? selectedHomeworkData?.fileURLs || [] : [],
      submit: view === 'homework' ? [] : '',
      results: view === 'homework' ? { percentage: '', files: [] } : { percentage: '', files: [] },
      checkedHomework: view === 'homework' ? [] : '',
    };

    try {
      setIsSubmitting(true);
      const docRef = await addDoc(collection(db, 'tableData'), newData);
      setTableData([...tableData, { id: docRef.id, ...newData, course: selectedCourseData, chapter: selectedChapterData, lesson: selectedLessonData }]);
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

  const handleFileUpload = async (id, files, field) => {
    const docRef = doc(db, 'tableData', id);
    const updatedRow = tableData.find(row => row.id === id);
  
    if (!Array.isArray(updatedRow[field])) {
      updatedRow[field] = [];
    }
  
    try {
      const fileURLs = await Promise.all(files.map(file => uploadFile(file)));
      updatedRow[field] = [...updatedRow[field], ...fileURLs];
  
      await updateDoc(docRef, { [field]: updatedRow[field] });
      setTableData(tableData.map(row => (row.id === id ? updatedRow : row)));
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleFileDelete = async (id, fileURL, field) => {
    const docRef = doc(db, 'tableData', id);
    const updatedRow = tableData.find(row => row.id === id);
  
    try {
      await deleteFile(fileURL);
      updatedRow[field] = updatedRow[field].filter(url => url !== fileURL);
  
      await updateDoc(docRef, { [field]: updatedRow[field] });
      setTableData(tableData.map(row => (row.id === id ? updatedRow : row)));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handlePercentageChange = async (id, percentage) => {
    const docRef = doc(db, 'tableData', id);
    const updatedRow = tableData.find(row => row.id === id);
  
    if (typeof updatedRow.results !== 'object') {
      updatedRow.results = { percentage: '', files: [] };
    }
  
    updatedRow.results.percentage = percentage;
  
    try {
      await updateDoc(docRef, { results: updatedRow.results });
      setTableData(tableData.map(row => (row.id === id ? updatedRow : row)));
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const toggleTooltip = (id) => {
    setActiveTooltip(activeTooltip === id ? null : id);
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
        headers = ['Дата', 'Домашняя работа', 'Сдать Домашнюю работу', 'Проверенная домашняя работа', 'Результаты', 'Действия'];
        break;
      case 'future':
        headers = ['Курс', 'Тема', 'Урок', 'Действия'];
        break;
      default:
        headers = [];
    }
  
    const sortedTableData = [...tableData].sort((a, b) => new Date(b.date) - new Date(a.date));
  
    return (
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="p-4">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTableData
              .filter(row => {
                if (view === 'completed') return row.progress !== '';
                if (view === 'homework') return row.homework !== '';
                if (view === 'future') return row.progress === '' && row.homework === '';
                return false;
              })
              .map((row, rowIndex) => (
                <tr key={row.id} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="p-4">
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
                        <Tooltip content={row.course?.description || "Нет описания"}>
                          <span
                            className="cursor-pointer text-blue-500"
                            onClick={() => toggleTooltip(`course-${row.id}`)}
                          >
                            {row.course?.name}
                          </span>
                        </Tooltip>
                      ) : header === 'Тема' ? (
                        <Tooltip content={row.chapter?.description || "Нет описания"}>
                          <span
                            className="cursor-pointer text-blue-500"
                            onClick={() => toggleTooltip(`chapter-${row.id}`)}
                          >
                            {row.chapter?.name}
                          </span>
                        </Tooltip>
                      ) : header === 'Урок' ? (
                        <Tooltip content={row.lesson?.description || "Нет описания"}>
                          <span
                            className="cursor-pointer text-blue-500"
                            onClick={() => toggleTooltip(`lesson-${row.id}`)}
                          >
                            {row.lesson?.name}
                          </span>
                        </Tooltip>
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
                        <>
                          <div>{row.homework}</div>
                          {row.homeworkFiles && row.homeworkFiles.map((fileURL, index) => (
                            <div key={index} className="flex items-center">
                              <a href={fileURL} download>
                                <button className="px-2 py-1 rounded bg-blue-500 text-white">
                                  {`File ${index + 1}`}
                                </button>
                              </a>
                            </div>
                          ))}
                        </>
                      ) : header === 'Сдать Домашнюю работу' ? (
                        <>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleFileUpload(row.id, Array.from(e.target.files), 'submit')}
                          />
                          {Array.isArray(row.submit) && row.submit.map((fileURL, index) => (
                            <div key={index} className="flex items-center">
                              <a href={fileURL} download>
                                <button className="px-2 py-1 rounded bg-blue-500 text-white">
                                  {`File ${index + 1}`}
                                </button>
                              </a>
                              <button
                                onClick={() => handleFileDelete(row.id, fileURL, 'submit')}
                                className="ml-2 px-2 py-1 rounded bg-red-500 text-white"
                              >                                ✕
                              </button>
                            </div>
                          ))}
                        </>
                      ) : header === 'Проверенная домашняя работа' ? (
                        <>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleFileUpload(row.id, Array.from(e.target.files), 'checkedHomework')}
                          />
                          {Array.isArray(row.checkedHomework) && row.checkedHomework.map((fileURL, index) => (
                            <div key={index} className="flex items-center">
                              <a href={fileURL} download>
                                <button className="px-2 py-1 rounded bg-blue-500 text-white">
                                  {`File ${index + 1}`}
                                </button>
                              </a>
                              <button
                                onClick={() => handleFileDelete(row.id, fileURL, 'checkedHomework')}
                                className="ml-2 px-2 py-1 rounded bg-red-500 text-white"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </>
                      ) : header === 'Результаты' ? (
                        <>
                          <input
                            type="number"
                            value={row.results.percentage}
                            onChange={(e) => handlePercentageChange(row.id, e.target.value)}
                            placeholder="Результаты (%)"
                            className="p-2 border rounded"
                          />
                          <div className="w-full bg-gray-200 rounded mt-2">
                            <div
                              className="bg-green-500 text-xs font-medium text-green-100 text-center p-0.5 leading-none rounded"
                              style={{ width: `${row.results.percentage}%` }}
                            >
                              {row.results.percentage}%
                            </div>
                          </div>
                          {row.results.files && row.results.files.map((fileURL, index) => (
                            <div key={index} className="flex items-center">
                              <a href={fileURL} download>
                                <button className="px-2 py-1 rounded bg-blue-500 text-white">
                                  {`File ${index + 1}`}
                                </button>
                              </a>
                              <button
                                onClick={() => handleFileDelete(row.id, fileURL, 'results.files')}
                                className="ml-2 px-2 py-1 rounded bg-red-500 text-white"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </>
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
        {view === 'completed' && (
          <input
            type="number"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            placeholder="Прогресс (%)"
            className="p-2 border rounded"
          />
        )}
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