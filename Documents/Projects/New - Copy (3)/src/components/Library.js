import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Add this import

const Library = () => {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  const addCourse = async () => {
    const highestOrdinal = Math.max(0, ...library.map(course => course.ordinal || 0));
    const newCourse = { name: 'New Course', description: '', chapters: [] };
    const docRef = await addDoc(collection(db, 'library'), newCourse);
    setLibrary([...library, { id: docRef.id, ...newCourse }]);
  };

  const addChapter = async (courseId) => {
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
  };

  const addLesson = async (courseId, chapterId) => {
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
  };

  const deleteCourse = async (courseId) => {
    if (typeof courseId !== 'string') {
      console.error('Invalid courseId:', courseId);
      return;
    }
    await deleteDoc(doc(db, 'library', courseId));
    setLibrary(library.filter(course => course.id !== courseId));
  };

  const deleteChapter = async (courseId, chapterId) => {
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
  };

  const deleteLesson = async (courseId, chapterId, lessonId) => {
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
    } else {
      setEditItem({ ...editItem, [name]: value });
    }
  };

  const saveEdit = async () => {
    const courseRef = doc(db, 'library', editItem.courseId || editItem.id);
    const courseDoc = await getDoc(courseRef);

    if (!courseDoc.exists()) {
      console.error('Course does not exist:', editItem.courseId || editItem.id);
      return;
    }

    const courseData = courseDoc.data();

    // Handle file uploads if there are any files
    if (editItem.fileURLs && editItem.fileURLs.length > 0) {
      const storage = getStorage();
      const fileURLs = [];

      for (const file of editItem.fileURLs) {
        const storageRef = ref(storage, `homeworks/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        fileURLs.push(downloadURL);
      }

      editItem.fileURLs = fileURLs;
    }

    if (editItem.type === 'course') {
      await updateDoc(courseRef, editItem);
    } else if (editItem.type === 'chapter') {
      const updatedChapters = courseData.chapters.map(chapter =>
        chapter.id === editItem.id ? { ...chapter, ...editItem } : chapter
      );
      await updateDoc(courseRef, { chapters: updatedChapters });
    } else if (editItem.type === 'lesson') {
      const updatedChapters = courseData.chapters.map(chapter => {
        if (chapter.id === editItem.chapterId) {
          const updatedLessons = chapter.lessons.map(lesson =>
            lesson.id === editItem.id ? { ...lesson, ...editItem } : lesson
          );
          return { ...chapter, lessons: updatedLessons };
        }
        return chapter;
      });
      await updateDoc(courseRef, { chapters: updatedChapters });
    } else if (editItem.type === 'homework') {
      const updatedChapters = courseData.chapters.map(chapter => {
        if (chapter.id === editItem.chapterId) {
          const updatedLessons = chapter.lessons.map(lesson => {
            if (lesson.id === editItem.lessonId) {
              const updatedHomeworks = lesson.homeworks.map(homework =>
                homework.id === editItem.id ? { ...homework, ...editItem } : homework
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
    const sortedLibraryData = libraryData.sort((a, b) => (a.ordinal || Infinity) - (b.ordinal || Infinity));
    setLibrary(sortedLibraryData);

    setEditMode(false);
    setEditItem(null);
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

  const addHomework = async (courseId, chapterId, lessonId) => {
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
            const newHomework = { id: Date.now().toString(), text: '', fileURLs: [] };
            return { ...lesson, homeworks: [...(lesson.homeworks || []), newHomework] };
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

  const containerStyles = 'pt-20 top bg-gray-100 rounded-lg shadow-md';
  const courseStyles = 'mb-4 p-4 bg-white rounded-lg shadow-sm';
  const courseHeaderStyles = 'flex items-center mb-2';
  const chapterStyles = 'ml-4 mt-2 p-2 bg-gray-200 rounded-lg';
  const chapterHeaderStyles = 'flex items-center mb-1';
  const lessonStyles = 'ml-4 mt-1 p-2 bg-gray-100 rounded-lg';
  const lessonHeaderStyles = 'flex items-center mb-1';
  const homeworkStyles = 'ml-4 mt-1 p-2 bg-gray-50 rounded-lg';


  const renderEditForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Edit {editItem.type.charAt(0).toUpperCase() + editItem.type.slice(1)}</h2>
        {editItem.type !== 'homework' && (
          <Input
            name="name"
            value={editItem.name}
            onChange={handleEdit}
            className="mb-2"
            placeholder="Name"
          />
        )}
        {editItem.ordinal !== undefined && (
          <Input
            name="ordinal"
            type="number"
            value={editItem.ordinal}
            onChange={handleEdit}
            className="mb-2"
            placeholder="Ordinal"
          />
        )}
        {(editItem.type === 'course' || editItem.type === 'chapter' || editItem.type === 'lesson') && (
          <textarea
            name="description"
            value={editItem.description || ''}
            onChange={handleEdit}
            className="mb-2 p-2 border border-gray-300 rounded-lg w-full"
            placeholder="Description"
          />
        )}
        {editItem.type === 'homework' && (
          <div className="mb-2">
            <textarea
              name="text"
              value={editItem.text || ''}
              onChange={handleEdit}
              className="mb-2 p-2 border border-gray-300 rounded-lg w-full"
              placeholder="Homework Text"
            />
            <Button
              type="button"
              className="w-full flex items-center justify-center"
              onClick={() => document.getElementById('fileInput').click()}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Attach Files</span>
            </Button>
            <input
              id="fileInput"
              type="file"
              name="fileURLs"
              multiple
              onChange={handleEdit}
              className="hidden"
            />
          </div>
        )}
        <Button onClick={saveEdit} className="mr-2">Save</Button>
        <Button onClick={() => setEditMode(false)}>Cancel</Button>
      </div>
    </div>
  );

const renderLibrary = () => (
  <div className={containerStyles}>
    {library.map(course => (
      <div key={course.id} className={courseStyles}>
        <div className={courseHeaderStyles}>
          <Button onClick={() => toggleCourse(course.id)} className="mr-2">
            {expandedCourses[course.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <span className="font-bold">{course.name}</span>
          <Button onClick={() => startEdit(course, 'course')} className="ml-auto">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button onClick={() => addChapter(course.id)} className="ml-2">
            <PlusCircle className="h-4 w-4" />
          </Button>
          <Button onClick={() => deleteCourse(course.id)} className="ml-2">
            <Trash2 className="h-4 w-4" />
          </Button>
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
                  <span>{chapter.ordinal}. {chapter.name}</span>
                  <Button onClick={() => startEdit(chapter, 'chapter', course.id)} className="ml-auto">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => addLesson(course.id, chapter.id)} className="ml-2">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => deleteChapter(course.id, chapter.id)} className="ml-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                          <span>{lesson.ordinal}. {lesson.name}</span>
                          <Button onClick={() => startEdit(lesson, 'lesson', course.id, chapter.id)} className="ml-auto">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => deleteLesson(course.id, chapter.id, lesson.id)} className="ml-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                                <div className="flex items-center">
                                  <ChevronRight className="mr-2 h-4 w-4" />
                                  <span>{homework.text}</span>
                                  {homework.fileURLs?.map((fileURL, index) => (
                                    <a key={index} href={fileURL} target="_blank" rel="noopener noreferrer" className="ml-2">
                                      File {index + 1}
                                    </a>
                                  ))}
                                  <Button onClick={() => startEdit(homework, 'homework', course.id, chapter.id, lesson.id)} className="ml-auto">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button onClick={() => deleteHomework(course.id, chapter.id, lesson.id, homework.id)} className="ml-2">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
      <h1 className="text-2xl font-bold mb-4">Library</h1>
      <Button onClick={addCourse} className="mb-4">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Course
      </Button>
      {renderLibrary()}
      {editMode && renderEditForm()}
    </div>
  );
};

export default Library;