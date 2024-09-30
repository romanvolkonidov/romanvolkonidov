import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../firebase';
import Tooltip from '@/components/ui/Tooltip';
import { X } from 'lucide-react';
import '../styles/TablePage.css';
import FileViewerButton from '@/components/FileViewerButton';


const FileViewer = ({ file, onClose }) => {
  const isImage = file.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          <X size={24} />
        </button>
        {isImage ? (
          <img src={file} alt="Opened file" className="max-w-full max-h-[80vh] object-contain" />
        ) : (
          <iframe src={file} title="Opened file" className="w-full h-[80vh]" />
        )}
      </div>
    </div>
  );
};

const TablePage = ({ studentId, readOnly = false }) => {
  const [view, setView] = useState('completed');
  const [library, setLibrary] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedHomework, setSelectedHomework] = useState('');
  const [stoppedAt, setStoppedAt] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [viewerFile, setViewerFile] = useState(null);

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
      stoppedAt: view === 'completed' ? stoppedAt : '',
      homework: view === 'homework' ? selectedHomeworkData?.text || '' : '',
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

  const openFileViewer = (fileURL) => {
    setViewerFile(fileURL);
  };

  const closeFileViewer = () => {
    setViewerFile(null);
  };

  const renderDropdowns = () => {
    const selectedCourseData = library.find(course => course.id === selectedCourse);
    const selectedChapterData = selectedCourseData?.chapters?.find(chapter => chapter.id === selectedChapter);
    const selectedLessonData = selectedChapterData?.lessons?.find(lesson => lesson.id === selectedLesson);
    const homeworks = selectedLessonData?.homeworks || [];

    return (
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="p-2 border rounded"
          disabled={readOnly}
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
          disabled={readOnly}
        >
          <option value="">Выберите тему</option>
          {selectedCourseData?.chapters?.map(chapter => (
            <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
          ))}
        </select>

        <select
          value={selectedLesson}
          onChange={(e) => setSelectedLesson(e.target.value)}
          className="p-2 border rounded"
          disabled={readOnly}
        >
          <option value="">Выберите урок</option>
          {selectedChapterData?.lessons?.map(lesson => (
            <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
          ))}
        </select>

        {view === 'homework' && (
          <select
            value={selectedHomework}
            onChange={(e) => setSelectedHomework(e.target.value)}
            className="p-2 border rounded"
            disabled={readOnly}
          >
            <option value="">Выберите домашнюю работу</option>
            {homeworks.map(homework => (
              <option key={homework.id} value={homework.id}>{homework.text}</option>
            ))}
          </select>
        )}
      </div>
    );
  };

  const renderFileButton = (fileURL, index, field, row) => (
    <div key={index} className="flex items-center mb-2">
      <button
        onClick={() => openFileViewer(fileURL)}
        className="px-2 py-1 rounded bg-black text-white mr-2"
      >
        {`File ${index + 1}`}
      </button>
      {!readOnly && (
        <button
          onClick={() => handleFileDelete(row.id, fileURL, field)}
          className="px-2 py-1 rounded bg-red-500 text-white"
        >
          ✕
        </button>
      )}
    </div>
  );

  const renderTable = () => {
    let headers;
  
    switch (view) {
      case 'completed':
        headers = ['Дата', 'Курс', 'Тема', 'Урок', 'Остановились на'];
        if (!readOnly) headers.push('Действия');
        break;
      case 'homework':
        headers = ['Дата', 'Домашняя работа', 'Сдать Домашнюю работу', 'Проверенная домашняя работа', 'Результаты'];
        if (!readOnly) headers.push('Действия');
        break;
      case 'future':
        headers = ['Курс', 'Тема', 'Урок'];
        if (!readOnly) headers.push('Действия');
        break;
      default:
        headers = [];
    }
  
    const sortedTableData = [...tableData].sort((a, b) => new Date(b.date) - new Date(a.date));
  
    return (
      <div className="table-container shadow-md sm:rounded-lg overflow-x-auto">
        <table className="fixed-table w-full text-sm text-left text-black">
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
                if (view === 'completed') return row.stoppedAt !== '';
                if (view === 'homework') return row.homework !== '';
                if (view === 'future') return row.stoppedAt === '' && row.homework === '';
                return false;
              })
              .map((row, rowIndex) => (
                <tr key={row.id} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="p-4">
                      {header === 'Действия' ? (
                        !readOnly && (
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="px-2 py-1 rounded bg-black text-white"
                          >
                            Удалить
                          </button>
                        )
                      ) : header === 'Дата' ? (
                        row.date
                      ) : header === 'Курс' ? (
                        <Tooltip content={row.course?.description || "Нет описания"}>
                          <span
                            className="cursor-pointer text-black"
                            onClick={() => toggleTooltip(`course-${row.id}`)}
                          >
                            {row.course?.name}
                          </span>
                        </Tooltip>
                      ) : header === 'Тема' ? (
                        <Tooltip content={row.chapter?.description || "Нет описания"}>
                          <span
                            className="cursor-pointer text-black"
                            onClick={() => toggleTooltip(`chapter-${row.id}`)}
                          >
                            {row.chapter?.name}
                          </span>
                        </Tooltip>
                      ) : header === 'Урок' ? (
                        <Tooltip content={row.lesson?.description || "Нет описания"}>
                          <span
                            className="cursor-pointer text-black"
                            onClick={() => toggleTooltip(`lesson-${row.id}`)}>
                            {row.lesson?.name}
                          </span>
                        </Tooltip>
                      ) : header === 'Остановились на' ? (
                        row.stoppedAt
                      ) : header === 'Домашняя работа' ? (
                        <>
                          <div>{row.homework}</div>
                          {row.homeworkFiles && row.homeworkFiles.map((fileURL, index) => 
                            renderFileButton(fileURL, index, 'homeworkFiles', row)
                          )}
                        </>
                      ) : header === 'Сдать Домашнюю работу' ? (
                        <>
                          {!readOnly && (
                            <label className="custom-file-upload">
                              <input
                                type="file"
                                multiple
                                onChange={(e) => handleFileUpload(row.id, Array.from(e.target.files), 'submit')}
                              />
                              Browse
                            </label>
                          )}
                          {Array.isArray(row.submit) && row.submit.map((fileURL, index) => 
                            renderFileButton(fileURL, index, 'submit', row)
                          )}
                        </>
                      ) : header === 'Проверенная домашняя работа' ? (
                        <>
                          {Array.isArray(row.checkedHomework) && row.checkedHomework.map((fileURL, index) => 
                            renderFileButton(fileURL, index, 'checkedHomework', row)
                          )}
                        </>
                      ) : header === 'Результаты' ? (
                        <>
                          {!readOnly && (
                            <input
                              type="number"
                              value={row.results.percentage}
                              onChange={(e) => handlePercentageChange(row.id, e.target.value)}
                              placeholder="Результаты (%)"
                              className="p-2 border rounded text-black"
                            />
                          )}
                          <div className="w-full bg-gray-200 rounded mt-2">
                            <Tooltip content={`${row.results.percentage}%`}>
                              <div
                                className="progress-bar text-xs font-medium text-green-100 text-center p-0.5 leading-none rounded"
                                style={{ width: `${row.results.percentage}%` }}
                              ></div>
                            </Tooltip>
                          </div>
                          {row.results.files && row.results.files.map((fileURL, index) => 
                            renderFileButton(fileURL, index, 'results.files', row)
                          )}
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
    <div className="full-height-container buttons">
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4"></h1>
        
        <div className="flex justify-center mb-4">
          <button onClick={() => setView('completed')} className="p-2 border rounded ml-2 bg-black text-white">Пройденные уроки</button>
          <button onClick={() => setView('homework')} className="p-2 border rounded ml-2 bg-black text-white">Домашние задания</button>
          <button onClick={() => setView('future')} className="p-2 border rounded ml-2 bg-black text-white">Запланированные уроки</button>
        </div>

        {!readOnly && (
          <>
            {renderDropdowns()}
            <div className="mb-4 flex flex-wrap gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border rounded text-black"
              />
              {view === 'completed' && (
                <textarea
                  value={stoppedAt}
                  onChange={(e) => setStoppedAt(e.target.value)}
                  placeholder="Остановились на"
                  className="p-2 border rounded text-black"
                />
              )}
              <button
                onClick={handleAddData}
                className="p-2 border rounded bg-green-500 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </>
        )}

        <div className="table-wrapper">
          {renderTable()}
        </div>
      </div>
      {viewerFile && <FileViewer file={viewerFile} onClose={closeFileViewer} />}
    </div>
  );
};

export default TablePage;