import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, ChevronDown, ChevronRight, Trash2, X, Link } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast, { Toaster } from 'react-hot-toast';
import HomeworkManagement from './HomeworkManagement';


const Library = () => {
  const [showHomeworkTypeSelection, setShowHomeworkTypeSelection] = useState(false);
  const [showHomeworkManagement, setShowHomeworkManagement] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [library, setLibrary] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const sortByOrdinal = (items) => {
    return items.sort((a, b) => {
      if (a.ordinal === undefined && b.ordinal === undefined) return 0;
      if (a.ordinal === undefined) return 1;
      if (b.ordinal === undefined) return -1;
      return a.ordinal - b.ordinal;
    });
  };


  useEffect(() => {
    const fetchLibrary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, 'library'));
        const libraryData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedLibraryData = sortByOrdinal(libraryData);
        setLibrary(sortedLibraryData);
      } catch (error) {
        console.error("Error fetching library data:", error);
        setError("Failed to fetch library data. Please try again later.");
        toast.error("Failed to fetch library data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  const addCourse = async () => {
    const highestOrdinal = Math.max(0, ...library.map(course => course.ordinal || 0));
    const newCourse = { name: 'New Course', description: '', chapters: [], ordinal: highestOrdinal + 1 };
    try {
      const docRef = await addDoc(collection(db, 'library'), newCourse);
      setLibrary([...library, { id: docRef.id, ...newCourse }]);
      toast.success('Course added successfully');
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error('Failed to add course');
    }
  };
  const addChapter = async (courseId) => {
    try {
      const courseRef = doc(db, 'library', courseId);
      const courseDoc = await getDoc(courseRef);
      if (!courseDoc.exists()) {
        console.error('Course does not exist:', courseId);
        return;
      }
      const courseData = courseDoc.data();
      const newChapter = { id: Date.now().toString(), name: 'New Chapter', description: '', ordinal: (courseData.chapters?.length || 0) + 1, lessons: [] };
      const updatedChapters = [...(courseData.chapters || []), newChapter];
      await updateDoc(courseRef, { chapters: updatedChapters });
      setLibrary(library.map(course => course.id === courseId ? { ...course, chapters: updatedChapters } : course));
      toast.success('Chapter added successfully');
    } catch (error) {
      console.error("Error adding chapter:", error);
      toast.error('Failed to add chapter');
    }
  };

  const addLesson = async (courseId, chapterId) => {
    try {
      const courseRef = doc(db, 'library', courseId);
      const courseDoc = await getDoc(courseRef);
      if (!courseDoc.exists()) {
        console.error('Course does not exist:', courseId);
        return;
      }
      const courseData = courseDoc.data();
      const updatedChapters = courseData.chapters.map(chapter => {
        if (chapter.id === chapterId) {
          const newLesson = { id: Date.now().toString(), name: 'New Lesson', ordinal: (chapter.lessons?.length || 0) + 1, homeworks: [] };
          return { ...chapter, lessons: [...(chapter.lessons || []), newLesson] };
        }
        return chapter;
      });
      await updateDoc(courseRef, { chapters: updatedChapters });
      setLibrary(library.map(course => course.id === courseId ? { ...course, chapters: updatedChapters } : course));
      toast.success('Lesson added successfully');
    } catch (error) {
      console.error("Error adding lesson:", error);
      toast.error('Failed to add lesson');
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      if (typeof courseId !== 'string') {
        console.error('Invalid courseId:', courseId);
        return;
      }
      await deleteDoc(doc(db, 'library', courseId));
      setLibrary(library.filter(course => course.id !== courseId));
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error('Failed to delete course');
    }
  };

  const deleteChapter = async (courseId, chapterId) => {
    try {
      if (typeof courseId !== 'string' || typeof chapterId !== 'string') {
        console.error('Invalid courseId or chapterId:', courseId, chapterId);
        return;
      }
      const courseRef = doc(db, 'library', courseId);
      const courseDoc = await getDoc(courseRef);
      if (!courseDoc.exists()) {
        console.error('Course does not exist:', courseId);
        return;
      }
      const courseData = courseDoc.data();
      const updatedChapters = courseData.chapters.filter(chapter => chapter.id !== chapterId);
      await updateDoc(courseRef, { chapters: updatedChapters });
      setLibrary(library.map(course => course.id === courseId ? { ...course, chapters: updatedChapters } : course));
      toast.success('Chapter deleted successfully');
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error('Failed to delete chapter');
    }
  };

  const deleteLesson = async (courseId, chapterId, lessonId) => {
    try {
      if (typeof courseId !== 'string' || typeof chapterId !== 'string' || typeof lessonId !== 'string') {
        console.error('Invalid courseId, chapterId, or lessonId:', courseId, chapterId, lessonId);
        return;
      }
      const courseRef = doc(db, 'library', courseId);
      const courseDoc = await getDoc(courseRef);
      if (!courseDoc.exists()) {
        console.error('Course does not exist:', courseId);
        return;
      }
      const courseData = courseDoc.data();
      const updatedChapters = courseData.chapters.map(chapter => {
        if (chapter.id === chapterId) {
          const updatedLessons = chapter.lessons.filter(lesson => lesson.id !== lessonId);
          return { ...chapter, lessons: updatedLessons };
        }
        return chapter;
      });
      await updateDoc(courseRef, { chapters: updatedChapters });
      setLibrary(library.map(course => course.id === courseId ? { ...course, chapters: updatedChapters } : course));
      toast.success('Lesson deleted successfully');
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error('Failed to delete lesson');
    }
  };


  const deleteHomework = async (courseId, chapterId, lessonId, homeworkId) => {
    if (typeof courseId !== 'string' || typeof chapterId !== 'string' || typeof lessonId !== 'string' || typeof homeworkId !== 'string') {
      console.error('Invalid courseId, chapterId, lessonId, or homeworkId:', courseId, chapterId, lessonId, homeworkId);
      return;
    }
    const courseRef = doc(db, 'library', courseId);
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
      console.error('Course does not exist:', courseId);
      return;
    }
    const courseData = courseDoc.data();
    const updatedChapters = courseData.chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const updatedLessons = chapter.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            const updatedHomeworks = lesson.homeworks.filter(homework => homework.id !== homeworkId);
            return { ...lesson, homeworks: updatedHomeworks };
          }
          return lesson;
        });
        return { ...chapter, lessons: updatedLessons };
      }
      return chapter;
    });
    await updateDoc(courseRef, { chapters: updatedChapters });
    setLibrary(library.map(course => course.id === courseId ? { ...course, chapters: updatedChapters } : course));
  };

  const startEdit = (item, type, courseId = null, chapterId = null, lessonId = null) => {
    setEditMode(true);
    setEditItem({ ...item, type, courseId, chapterId, lessonId });
  };

  const handleEdit = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'fileURLs') {
      setEditItem({ ...editItem, [name]: files });
    } else if (name === 'text' && editItem.type === 'homework') {
      setTempHomeworkText(value);
    } else {
      setEditItem({ ...editItem, [name]: value });
    }
  };
  
  const saveEdit = async (updatedItem) => {
    try {
      const courseRef = doc(db, 'library', updatedItem.courseId || updatedItem.id);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        console.error('Course does not exist:', updatedItem.courseId || updatedItem.id);
        return;
      }

      const courseData = courseDoc.data();

      // Handle file uploads if there are any files
      if (updatedItem.fileURLs && updatedItem.fileURLs.length > 0) {
        const storage = getStorage();
        const fileURLs = [];

        for (const file of updatedItem.fileURLs) {
          const storageRef = ref(storage, `homeworks/${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          fileURLs.push(downloadURL);
        }

        updatedItem.fileURLs = fileURLs;
      }

      if (updatedItem.type === 'course') {
        await updateDoc(courseRef, updatedItem);
      } else if (updatedItem.type === 'chapter') {
        const updatedChapters = courseData.chapters.map(chapter =>
          chapter.id === updatedItem.id ? { ...chapter, ...updatedItem } : chapter
        );
        await updateDoc(courseRef, { chapters: updatedChapters });
      } else if (updatedItem.type === 'lesson') {
        const updatedChapters = courseData.chapters.map(chapter => {
          if (chapter.id === updatedItem.chapterId) {
            const updatedLessons = chapter.lessons.map(lesson =>
              lesson.id === updatedItem.id ? { ...lesson, ...updatedItem } : lesson
            );
            return { ...chapter, lessons: updatedLessons };
          }
          return chapter;
        });
        await updateDoc(courseRef, { chapters: updatedChapters });
      } else if (updatedItem.type === 'homework') {
        const updatedChapters = courseData.chapters.map(chapter => {
          if (chapter.id === updatedItem.chapterId) {
            const updatedLessons = chapter.lessons.map(lesson => {
              if (lesson.id === updatedItem.lessonId) {
                const updatedHomeworks = lesson.homeworks.map(homework =>
                  homework.id === updatedItem.id ? { ...homework, ...updatedItem } : homework
                );
                return { ...lesson, homeworks: updatedHomeworks };
              }
              return lesson;
            });
            return { ...chapter, lessons: updatedLessons };
          }
          return chapter;
        });
        await updateDoc(courseRef, { chapters: updatedChapters });
      }

      const updatedLibrary = await getDocs(collection(db, 'library'));
      const libraryData = updatedLibrary.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedLibraryData = sortByOrdinal(libraryData);
      setLibrary(sortedLibraryData);

      setEditMode(false);
      setEditItem(null);
      toast.success('Item updated successfully');
    } catch (error) {
      console.error("Error saving edit:", error);
      toast.error('Failed to save changes');
    }
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses(prevState => ({ ...prevState, [courseId]: !prevState[courseId] }));
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prevState => ({ ...prevState, [chapterId]: !prevState[chapterId] }));
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prevState => ({ ...prevState, [lessonId]: !prevState[lessonId] }));
  };

  const addHomework = (courseId, chapterId, lessonId) => {
    setCurrentCourseId(courseId);
    setCurrentChapterId(chapterId);
    setCurrentLessonId(lessonId);
    setShowHomeworkTypeSelection(true);
  };

  const addCustomHomework = async () => {
    const courseRef = doc(db, 'library', currentCourseId);
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
      console.error('Course does not exist:', currentCourseId);
      return;
    }
    const courseData = courseDoc.data();
    const updatedChapters = courseData.chapters.map(chapter => {
      if (chapter.id === currentChapterId) {
        const updatedLessons = chapter.lessons.map(lesson => {
          if (lesson.id === currentLessonId) {
            const newHomework = { 
              id: Date.now().toString(), 
              type: 'custom',
              text: '', 
              fileURLs: [] 
            };
            return { ...lesson, homeworks: [...(lesson.homeworks || []), newHomework] };
          }
          return lesson;
        });
        return { ...chapter, lessons: updatedLessons };
      }
      return chapter;
    });
    await updateDoc(courseRef, { chapters: updatedChapters });
    setLibrary(library.map(course => course.id === currentCourseId ? { ...course, chapters: updatedChapters } : course));
    setShowHomeworkTypeSelection(false);
    toast.success('Custom homework added successfully');
  };

  const HomeworkTypeSelection = ({ onSelectCustom, onSelectPredefined, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Select Homework Type</h2>
        <div className="flex gap-2">
          <Button onClick={onSelectCustom}>Custom Homework</Button>
          <Button onClick={onSelectPredefined}>Pre-defined Homework</Button>
        </div>
        <Button onClick={onCancel} className="mt-2 w-full">Cancel</Button>
      </div>
    </div>
  );

  const handleSelectHomework = async (selectedHomework) => {
    const courseRef = doc(db, 'library', currentCourseId);
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
      console.error('Course does not exist:', currentCourseId);
      return;
    }
    const courseData = courseDoc.data();
    const updatedChapters = courseData.chapters.map(chapter => {
      if (chapter.id === currentChapterId) {
        const updatedLessons = chapter.lessons.map(lesson => {
          if (lesson.id === currentLessonId) {
            const newHomework = { 
              id: Date.now().toString(), 
              type: selectedHomework.name, // This is crucial
              component: selectedHomework.name,
              text: selectedHomework.name,
            };
            return { ...lesson, homeworks: [...(lesson.homeworks || []), newHomework] };
          }
          return lesson;
        });
        return { ...chapter, lessons: updatedLessons };
      }
      return chapter;
    });
    await updateDoc(courseRef, { chapters: updatedChapters });
    setLibrary(library.map(course => course.id === currentCourseId ? { ...course, chapters: updatedChapters } : course));
    setShowHomeworkManagement(false);
    toast.success('Homework added successfully');
  };
  
  const containerStyles = 'pt-20 top bg-gray-100 rounded-lg shadow-md p-4';
  const courseStyles = 'mb-4 p-4 bg-blue-50 rounded-lg shadow-sm';
  const courseHeaderStyles = 'flex flex-wrap items-center mb-2 gap-2';
  const chapterStyles = 'ml-4 mt-2 p-2 bg-green-50 rounded-lg';
  const chapterHeaderStyles = 'flex flex-wrap items-center mb-1 gap-2';
  const lessonStyles = 'ml-4 mt-1 p-2 bg-yellow-50 rounded-lg';
  const lessonHeaderStyles = 'flex flex-wrap items-center mb-1 gap-2';
  const homeworkStyles = 'ml-4 mt-1 p-2 bg-red-50 rounded-lg';
  const itemNameStyles = 'font-semibold flex-grow';
  const buttonGroupStyles = 'flex gap-1 mt-1 sm:mt-0';


  const renderHomeworkText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <Button
            key={index}
            onClick={() => window.open(part, '_blank')}
            className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          >
            онлайн
          </Button>
        );
      }
      return part;
    });
  };

  const EditForm = () => {
  const [localEditItem, setLocalEditItem] = useState({ ...editItem });
  const [newFiles, setNewFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalEditItem({ ...editItem });
    setNewFiles([]);
  }, [editItem]);

  const handleLocalEdit = (e) => {
    const { name, value, files } = e.target;
    if (name === 'fileURLs') {
      setNewFiles(prev => [...prev, ...Array.from(files)]);
    } else {
      setLocalEditItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveExistingFile = (urlToRemove) => {
    setLocalEditItem(prev => ({
      ...prev,
      fileURLs: prev.fileURLs.filter(url => url !== urlToRemove)
    }));
  };

  const handleRemoveNewFile = (indexToRemove) => {
    setNewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Combine existing fileURLs with new files
      const updatedItem = {
        ...localEditItem,
        fileURLs: [
          ...(localEditItem.fileURLs || []),
          ...newFiles
        ]
      };
      await saveEdit(updatedItem);
    } catch (error) {
      console.error("Error saving:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Edit {localEditItem.type.charAt(0).toUpperCase() + localEditItem.type.slice(1)}</h2>
        {localEditItem.type !== 'homework' && (
          <Input
            name="name"
            value={localEditItem.name}
            onChange={handleLocalEdit}
            className="mb-2 w-full"
            placeholder="Name"
          />
        )}
        <Input
          name="ordinal"
          type="number"
          value={localEditItem.ordinal}
          onChange={handleLocalEdit}
          className="mb-2 w-full"
          placeholder="Ordinal"
        />
        {(localEditItem.type === 'course' || localEditItem.type === 'chapter' || localEditItem.type === 'lesson') && (
          <textarea
            name="description"
            value={localEditItem.description || ''}
            onChange={handleLocalEdit}
            className="mb-2 p-2 border border-gray-300 rounded-lg w-full"
            placeholder="Description"
          />
        )}
        {localEditItem.type === 'homework' && (
          <div className="mb-2">
            <textarea
              name="text"
              value={localEditItem.text || ''}
              onChange={handleLocalEdit}
              className="mb-2 p-2 border border-gray-300 rounded-lg w-full"
              placeholder="Homework Text"
            />
            <div className="mb-2">
              <h3 className="font-semibold">Existing Files:</h3>
              {localEditItem.fileURLs?.map((url, index) => (
                <div key={index} className="flex items-center mb-1">
                  <Link className="h-4 w-4 mr-2" />
                  <a href={url} target="_blank" rel="noopener noreferrer" className="mr-2 text-blue-500 hover:underline">
                    File {index + 1}
                  </a>
                  <Button onClick={() => handleRemoveExistingFile(url)} size="sm" disabled={isSaving}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mb-2">
              <h3 className="font-semibold">New Files:</h3>
              {newFiles.map((file, index) => (
                <div key={index} className="flex items-center mb-1">
                  <span className="mr-2">{file.name}</span>
                  <Button onClick={() => handleRemoveNewFile(index)} size="sm" disabled={isSaving}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="w-full flex items-center justify-center"
              onClick={() => document.getElementById('fileInput').click()}
              disabled={isSaving}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Attach Files</span>
            </Button>
            <input
              id="fileInput"
              type="file"
              name="fileURLs"
              multiple
              onChange={handleLocalEdit}
              className="hidden"
              disabled={isSaving}
            />
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSave} 
            className="mr-2 relative" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="opacity-0">Save</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Button onClick={() => setEditMode(false)} disabled={isSaving}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};


  const LibraryContent = () => (
    <div className={containerStyles}>
      {library.map(course => (
        <div key={course.id} className={courseStyles}>
          <div className={courseHeaderStyles}>
            <Button onClick={() => toggleCourse(course.id)} className="mr-2">
              {expandedCourses[course.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <span className={itemNameStyles}>{course.name}</span>
            <div className={buttonGroupStyles}>
              <Button onClick={() => startEdit(course, 'course')}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button onClick={() => addChapter(course.id)}>
                <PlusCircle className="h-4 w-4" />
              </Button>
              <Button onClick={() => deleteCourse(course.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {expandedCourses[course.id] && (
            <div>
              <p className="ml-4 text-sm text-gray-600">{course.description}</p>
              {(course.chapters?.length || 0) === 0 && (
                <div className="ml-4 mt-2 text-gray-500">
                  No chapters available
                </div>
              )}
              {course.chapters?.map(chapter => (
                <div key={chapter.id} className={chapterStyles}>
                  <div className={chapterHeaderStyles}>
                    <Button onClick={() => toggleChapter(chapter.id)} className="mr-2">
                      {expandedChapters[chapter.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <span className={itemNameStyles}>{chapter.ordinal}. {chapter.name}</span>
                    <div className={buttonGroupStyles}>
                      <Button onClick={() => startEdit(chapter, 'chapter', course.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => addLesson(course.id, chapter.id)}>
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => deleteChapter(course.id, chapter.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {expandedChapters[chapter.id] && (
                    <div>
                      <p className="ml-4 text-sm text-gray-600">{chapter.description}</p>
                      {(chapter.lessons?.length || 0) === 0 && (
                        <div className="ml-4 mt-2 text-gray-500">
                          No lessons available
                        </div>
                      )}
                    {chapter.lessons?.map(lesson => (
  <div key={lesson.id} className={lessonStyles}>
    <div className={lessonHeaderStyles}>
      <Button onClick={() => toggleLesson(lesson.id)} className="mr-2">
        {expandedLessons[lesson.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      <span className={itemNameStyles}>{lesson.ordinal}. {lesson.name}</span>
      <div className={buttonGroupStyles}>
        <Button onClick={() => startEdit(lesson, 'lesson', course.id, chapter.id)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button onClick={() => deleteLesson(course.id, chapter.id, lesson.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
    {expandedLessons[lesson.id] && (
                            <div>
                              <p className="ml-6 text-sm text-gray-600">{lesson.description}</p>
                              <Button onClick={() => addHomework(course.id, chapter.id, lesson.id)} className="ml-6 mb-2">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Homework
                              </Button>
                              {(lesson.homeworks?.length || 0) === 0 && (
                                <div className="ml-6 mt-2 text-gray-500">
                                  No homeworks available
                                </div>
                              )}
                               {lesson.homeworks?.map(homework => (
                                <div key={homework.id} className={homeworkStyles}>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <ChevronRight className="h-4 w-4" />
                                    <span className={itemNameStyles}>
                                      {homework.type ? `${homework.type} Homework` : 'Custom Homework'}
                                    </span>
                                    <div className="ml-4">
                                      {renderHomeworkText(homework.text || '')}
                                    </div>
                                    {homework.fileURLs?.map((fileURL, index) => (
                                      <a key={index} href={fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        File {index + 1}
                                      </a>
                                    ))}
                                    <div className={buttonGroupStyles}>
                                      <Button onClick={() => startEdit(homework, 'homework', course.id, chapter.id, lesson.id)}>
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button onClick={() => deleteHomework(course.id, chapter.id, lesson.id, homework.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

return (
  <div className={containerStyles}>
    <Toaster position="top-right" />
    <h1 className="text-2xl font-bold mb-4">Library</h1>
    <Button onClick={addCourse} className="mb-4">
      <PlusCircle className="mr-2 h-4 w-4" /> Add Course
    </Button>
    <LibraryContent />
    {editMode && <EditForm />}
    {showHomeworkTypeSelection && (
      <HomeworkTypeSelection
        onSelectCustom={addCustomHomework}
        onSelectPredefined={() => setShowHomeworkManagement(true)}
        onCancel={() => setShowHomeworkTypeSelection(false)}
      />
    )}
    {showHomeworkManagement && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg">
          <HomeworkManagement
            onSelectHomework={handleSelectHomework}
            onCancel={() => {
              setShowHomeworkManagement(false);
              setShowHomeworkTypeSelection(false);
            }}
            mode="select"
          />
        </div>
      </div>
    )}
  </div>
);
};

export default Library;