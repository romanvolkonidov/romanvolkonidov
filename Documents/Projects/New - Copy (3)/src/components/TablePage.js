import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../firebase';
import Tooltip from '@/components/ui/Tooltip';
import { X } from 'lucide-react';
import '../styles/TablePage.css';
import toast, { Toaster } from 'react-hot-toast';
import { Upload } from 'lucide-react';
//import ReviewWh from './homeworks/ReviewWh';
import Homework from './homeworks/Homework';

import { Button } from '@/components/ui/Button';
import { Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import ReviewWhQ from './homeworks/ReviewWhQ';
console.log("ReviewWhQ questions:", ReviewWhQ);
import SimplePresent from './homeworks/SimplePresent';
import HowLong from './homeworks/HowLong';
import ColorMarkers from './homeworks/ColorMarkers';


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
  const [activeHomework, setActiveHomework] = useState(null);
  const [sortedLibrary, setSortedLibrary] = useState([]);
  const [editPercentage, setEditPercentage] = useState("");

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
  const [error, setError] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [editingRow, setEditingRow] = useState(null);

  const handleEditResult = (row) => {
    setEditingRow(row);
    setEditPercentage(row.results?.percentage?.toString() || "");
  };

  const handleSaveResult = async () => {
    try {
      const numericPercentage = parseFloat(editPercentage);
      if (isNaN(numericPercentage) || numericPercentage < 0 || numericPercentage > 100) {
        throw new Error("Invalid percentage. Please enter a number between 0 and 100.");
      }

      const docRef = doc(db, 'tableData', editingRow.id);
      await updateDoc(docRef, { 'results.percentage': numericPercentage });
      
      setTableData(prevData => prevData.map(row => 
        row.id === editingRow.id ? { ...row, results: { ...row.results, percentage: numericPercentage } } : row
      ));
      
      setEditingRow(null);
      toast.success('Result updated successfully');
    } catch (error) {
      console.error("Error updating result:", error);
      toast.error(error.message);
    }
  };

  const homeworkQuestions = {
    ReviewWhQ: ReviewWhQ,
    SimplePresent: SimplePresent,
    HowLong: HowLong,
    ColorMarkers: ColorMarkers,
    // Add other homework types and their corresponding question sets here
  };
  const handleLaunchHomework = (row) => {
    console.log("Launching homework:", row);
    if (!row.homework) {
      console.error("Homework is undefined:", row);
      toast.error("Unable to launch homework: Missing homework data");
      return;
    }
    
    const homeworkType = (row.homework.type || row.homework.component || '').toLowerCase();
    console.log("Homework type:", homeworkType);
    console.log("Available homework types:", Object.keys(homeworkQuestions));
    
    if (!homeworkType) {
      console.error("Homework type and component are undefined:", row.homework);
      toast.error("Unable to launch homework: Missing type information");
      return;
    }
    
    // Check if the homework has already been completed
    if (row.results && row.results.percentage !== null && row.results.percentage !== '') {
      toast.error("Эта домашняя работа уже выполнена. Вы можете попросить новую");
      return;
    }
    
    // Get the questions for this homework type
    const questions = Object.entries(homeworkQuestions).find(([key, value]) => 
      key.toLowerCase() === homeworkType
    )?.[1];
  
    if (!questions) {
      console.error(`No questions found for homework type: ${homeworkType}`);
      console.log("Available types:", Object.keys(homeworkQuestions).map(key => key.toLowerCase()));
      toast.error("Unable to launch homework: Questions not found");
      return;
    }
  
    setActiveHomework({
      ...row,
      questions,
    });
  };

  const handleCloseHomework = () => {
    setActiveHomework(null);
  };

  const handleHomeworkComplete = async (score) => {
    console.log("Домашняя работа выполнена с результатом:", score);
    if (!activeHomework) {
      console.error("No active homework when completing");
      return;
    }
  
    try {
      const numericScore = Number(score);
      if (isNaN(numericScore)) {
        throw new Error("Invalid score value");
      }
  
      // Update the score in the database
      const docRef = doc(db, 'tableData', activeHomework.id);
      await updateDoc(docRef, { 'results.percentage': numericScore });
      console.log("Updated score in database for document:", activeHomework.id);
      
      // Update the local state
      setTableData(prevData => prevData.map(row => 
        row.id === activeHomework.id 
          ? { ...row, results: { ...row.results, percentage: numericScore } } 
          : row
      ));
      
      toast.success('Домашняя работа выполнена');
    } catch (error) {
      console.error("Error updating homework score:", error);
      toast.error('Failed to update homework score');
    }
  };

  useEffect(() => {
    const fetchLibraryAndTableData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching library data...");
        const librarySnapshot = await getDocs(collection(db, 'library'));
        const libraryData = librarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const sortedLibraryData = libraryData.sort((a, b) => (a.ordinal || 0) - (b.ordinal || 0));
setSortedLibrary(sortedLibraryData);
        // Sort chapters within each course based on their ordinal
        libraryData.forEach(course => {
          course.chapters.sort((a, b) => (a.ordinal || 0) - (b.ordinal || 0));
        });
        
        console.log("Library data fetched successfully:", libraryData);

        console.log("Fetching table data...");
        const tableDataSnapshot = await getDocs(collection(db, 'tableData'));
        console.log("Table data fetched successfully");

        const tableData = tableDataSnapshot.docs.map(doc => {
          const data = doc.data();
          const course = libraryData.find(course => course.id === data.courseId);
          const chapter = course?.chapters.find(chapter => chapter.id === data.chapterId);
          const lesson = chapter?.lessons.find(lesson => lesson.id === data.lessonId);
          const homework = lesson?.homeworks.find(homework => homework.id === data.homeworkId);
          
          const processedHomework = homework ? {
            ...homework,
            type: homework.type || homework.component || '', // Prioritize type, fallback to component
            component: homework.component || homework.type || '', // Ensure component is included, fallback to type
          } : null;
        
          return {
            id: doc.id,
            ...data,
            course,
            chapter,
            lesson,
            homework: processedHomework,
            results: data.results || { percentage: null }
          };
        });
        
        console.log("Processed table data:", tableData);
        const filteredData = tableData.filter(data => data.studentId === studentId);
        console.log("Filtered table data:", filteredData);
        
        setLibrary(libraryData);
        setTableData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
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
    const url = await getDownloadURL(storageRef);
    toast.success(`File ${file.name} uploaded successfully`);
    return url;
  };

  const deleteFile = async (fileURL) => {
    const storageRef = ref(storage, fileURL);
    await deleteObject(storageRef);
    toast.success("File deleted successfully");
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
      course: selectedCourseData,
      chapter: selectedChapterData,
      lesson: selectedLessonData,
      type: view,
      stoppedAt: view === 'completed' ? stoppedAt : '',
      homework: view === 'homework' ? {
        text: selectedHomeworkData?.text || '',
        component: selectedHomeworkData?.component || ''
      } : '',
      homeworkId: view === 'homework' ? selectedHomeworkData?.id : '',
      homeworkFiles: view === 'homework' ? selectedHomeworkData?.fileURLs || [] : [],
      submit: [],
      results: { percentage: '', files: [] },
      checkedHomework: [],
      timestamp: serverTimestamp() // Add this line to include a server timestamp
    };

    try {
      setIsSubmitting(true);
      const docRef = await addDoc(collection(db, 'tableData'), newData);
      // Fetch the document to get the server timestamp
      const docSnap = await getDoc(docRef);
      const addedData = { id: docRef.id, ...docSnap.data() };
      setTableData([addedData, ...tableData]);
      toast.success("Data added successfully");
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Failed to add data");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDeleteRow = async (id) => {
    const docRef = doc(db, 'tableData', id);
    try {
      await deleteDoc(docRef);
      setTableData(tableData.filter(row => row.id !== id));
      toast.success("Row deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete row");
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
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to upload files");
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
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
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
      toast.success("Percentage updated successfully");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update percentage");
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
          {sortedLibrary.map(course => (
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

const renderFileButton = (fileURL, index, field, row) => {
  if (!fileURL) {
    return null;
  }
  return (
    <div key={index} className="flex items-center space-x-1 mb-1">
      <button
        onClick={() => window.open(fileURL, '_blank', 'noopener,noreferrer')}
        className="px-1 py-0.5 rounded bg-black text-white hover:bg-gray-800 transition-colors duration-300 text-xs"
        title="Open file"
      >
        ↗
      </button>
      {(field === 'submit' || (!readOnly && field === 'checkedHomework')) && (
        <button
          onClick={() => handleFileDelete(row.id, fileURL, field)}
          className="px-1 py-0.5 rounded bg-black text-white hover:bg-gray-800 transition-colors duration-300 text-xs"
          title="Delete file"
        >
          ✕
        </button>
      )}
    </div>
  );
};

const renderHomeworkText = (text, files) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <Button
              key={index}
              onClick={() => window.open(part, '_blank')}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
            >
              Онлайн
            </Button>
          );
        }
        return part;
      })}
      {files && files.map((file, index) => (
        <Button
          key={`file-${index}`}
          onClick={() => window.open(file, '_blank')}
          className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded"
        >
          File {index + 1}
        </Button>
      ))}
    </>
  );
};

  const renderTableCell = (header, row) => {
    switch (header) {
      case 'Дата':
        return row.date;
      case 'Курс':
        return (
          <Tooltip content={row.course?.description || "Нет описания"}>
            <span className="cursor-pointer text-black" onClick={() => toggleTooltip(`course-${row.id}`)}>
              {row.course?.name}
            </span>
          </Tooltip>
        );
      case 'Тема':
        return (
          <Tooltip content={row.chapter?.description || "Нет описания"}>
            <span className="cursor-pointer text-black" onClick={() => toggleTooltip(`chapter-${row.id}`)}>
              {row.chapter?.name}
            </span>
          </Tooltip>
        );
      case 'Урок':
        return (
          <Tooltip content={row.lesson?.description || "Нет описания"}>
            <span className="cursor-pointer text-black" onClick={() => toggleTooltip(`lesson-${row.id}`)}>
              {row.lesson?.name}
            </span>
          </Tooltip>
        );
      case 'Остановились на':
        return row.stoppedAt;
       case 'Домашняя работа':
  const homeworkType = (row.homework?.type || row.homework?.component || '').toLowerCase();
  const hasQuestions = Object.keys(homeworkQuestions).some(key => key.toLowerCase() === homeworkType);
  
  return (
    <>
      <div>{renderHomeworkText(row.homework?.text || 'No homework assigned', row.homeworkFiles)}</div>
      {row.homework && hasQuestions && !row.results?.percentage && (
        <Button onClick={() => handleLaunchHomework(row)} className="mt-2">
          Начать
        </Button>
      )}
    </>
  );
          case 'Результаты':
        const percentage = row.results?.percentage;
        const numericPercentage = Number(percentage);
        const isCustomHomework = row.homework && !row.homework.component;

        return (
          <div className="flex items-center space-x-2">
            <div className="flex-grow">
              <div className="w-full bg-gray-200 rounded">
                <Tooltip content={`${isNaN(numericPercentage) ? 0 : numericPercentage.toFixed(2)}%`}>
                  <div
                    className="progress-bar text-xs font-medium text-white text-center p-0.5 leading-none rounded"
                    style={{ 
                      width: `${isNaN(numericPercentage) ? 0 : numericPercentage}%`,
                      backgroundColor: numericPercentage > 80 ? 'green' : numericPercentage > 60 ? 'yellow' : 'red'
                    }}
                  />
                </Tooltip>
              </div>
            </div>
            {!readOnly && isCustomHomework && (
              <Button 
                onClick={() => handleEditResult(row)} 
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      case 'Действия':
        return !readOnly && (
          <button
          onClick={() => handleDeleteRow(row.id)}
          className="px-2 py-1 rounded bg-black text-white hover:bg-gray-800 transition-colors duration-300"
        >
          Удалить
        </button>
        );
      default:
        return null;
    }
  };

  const renderTable = () => {
    let headers;
  
    switch (view) {
      case 'completed':
        headers = ['Дата', 'Курс', 'Тема', 'Урок', 'Остановились на'];
        if (!readOnly) headers.push('Действия');
        break;
      case 'homework':
        headers = ['Дата', 'Курс', 'Тема', 'Урок', 'Домашняя работа', 'Результаты'];
        if (!readOnly) headers.push('Действия');
        break;
      case 'future':
        headers = ['Дата', 'Курс', 'Тема', 'Урок'];
        if (!readOnly) headers.push('Действия');
        break;
      default:
        headers = [];
    }
  
    const sortedTableData = [...tableData]
      .filter(row => row.type === view)
      .sort((a, b) => {
        // Sort by timestamp in descending order (most recent first)
        const timeA = a.timestamp?.toDate?.() || new Date(0);
        const timeB = b.timestamp?.toDate?.() || new Date(0);
        return timeB - timeA;
      });
  
    return (
      <div className="table-container shadow-md sm:rounded-lg overflow-x-auto">
        <table className="fixed-table w-full text-sm text-left text-black">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="p-4" style={{
                  minWidth: header === 'Дата' ? '100px' :
                            header === 'Курс' || header === 'Тема' || header === 'Урок' ? '150px' :
                            header === 'Домашняя работа' || header === 'Сдать Домашнюю работу' || header === 'Проверенная домашняя работа' ? '200px' :
                            'auto'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTableData.map((row, rowIndex) => (
              <tr key={row.id} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="p-4" style={{
                    minWidth: header === 'Дата' ? '100px' :
                              header === 'Курс' || header === 'Тема' || header === 'Урок' ? '150px' :
                              header === 'Домашняя работа' || header === 'Сдать Домашнюю работу' || header === 'Проверенная домашняя работа' ? '200px' :
                              'auto'
                  }}>
                    {renderTableCell(header, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

    
    if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>;

  return (
    <div className="full-height-container buttons bg-gray-100">
      <Toaster position="top-right" />
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Таблица ученика</h1>
        
        <div className="flex justify-center mb-6 space-x-4">
        <button onClick={() => setView('completed')} className={`p-2 rounded-full transition-colors duration-300 ${view === 'completed' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>Пройденные уроки</button>
<button onClick={() => setView('homework')} className={`p-2 rounded-full transition-colors duration-300 ${view === 'homework' ? 'bg-black text-black' : 'bg-black-200 text-black'}`}>Домашние задания</button>
<button onClick={() => setView('future')} className={`p-2 rounded-full transition-colors duration-300 ${view === 'future' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>Запланированные уроки</button>
        </div>
  
        {!readOnly && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            {renderDropdowns()}
            <div className="mt-4 flex flex-wrap gap-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border rounded text-black flex-grow"
              />
              {view === 'completed' && (
                <textarea
                  value={stoppedAt}
                  onChange={(e) => setStoppedAt(e.target.value)}
                  placeholder="Остановились на"
                  className="p-2 border rounded text-black flex-grow"
                />
              )}
             <button
  onClick={handleAddData}
  className="p-2 rounded bg-black text-white hover:bg-gray-800 transition-colors duration-300 flex-grow sm:flex-grow-0"
  disabled={isSubmitting}
>
  {isSubmitting ? 'Добавление...' : 'Добавить'}
</button>
            </div>
          </div>
        )}
  
        <div className="table-wrapper bg-white rounded-lg shadow-md">
          {renderTable()}
        </div>
      </div>
      {viewerFile && <FileViewer file={viewerFile} onClose={closeFileViewer} />}
      {activeHomework && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto relative">
        <button
          onClick={() => setActiveHomework(null)}
          className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          <X size={24} />
        </button>
        <Homework
          studentId={studentId}
          homeworkData={activeHomework.homework}
          questions={activeHomework.questions}
          onClose={() => setActiveHomework(null)}
          onComplete={handleHomeworkComplete}
        />
      </div>
    </div>
      )}
 <Dialog open={!!editingRow} onOpenChange={() => setEditingRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={editPercentage}
              onChange={(e) => setEditPercentage(e.target.value)}
              placeholder="Enter percentage"
              min="0"
              max="100"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setEditingRow(null)} variant="outline">Cancel</Button>
            <Button onClick={handleSaveResult}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TablePage;


