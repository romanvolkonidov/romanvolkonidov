import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Library = () => {
  const [library, setLibrary] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newHomework, setNewHomework] = useState({ name: '', files: [] });
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

  useEffect(() => {
    const fetchLibrary = async () => {
      const querySnapshot = await getDocs(collection(db, 'library'));
      const libraryData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLibrary(libraryData);
    };

    fetchLibrary();
  }, []);

  const addCourse = async () => {
    const newCourse = { name: 'New Course', chapters: [] };
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
    const newChapter = { id: Date.now().toString(), name: 'New Chapter', ordinal: (courseData.chapters?.length || 0) + 1, lessons: [] };
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

  const addHomework = async (courseId, chapterId, lessonId) => {
    const { name, files } = newHomework;
    if (!name || files.length === 0) {
      console.error('Homework name or files missing');
      return;
    }

    const courseRef = doc(db, 'library', courseId);
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
      console.error('Course does not exist:', courseId);
      return;
    }
    const courseData = courseDoc.data();

    // Upload files to Firebase Storage and get URLs
    const fileURLs = await Promise.all(files.map(async (file) => {
      const storageRef = ref(storage, `homeworks/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    }));

    const newHomeworkData = { id: Date.now().toString(), name, fileURLs };
    const updatedChapters = courseData.chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const updatedLessons = chapter.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            return { ...lesson, homeworks: [...(lesson.homeworks || []), newHomeworkData] };
          }
          return lesson;
        });
        return { ...chapter, lessons: updatedLessons };
      }
      return chapter;
    });
    await updateDoc(courseRef, { chapters: updatedChapters });
    setLibrary(library.map(course => course.id === courseId ? { ...course, chapters: updatedChapters } : course));
    setNewHomework({ name: '', files: [] }); // Reset new homework state
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

  const startEdit = (item, type, courseId = null, chapterId = null) => {
    setEditMode(true);
    setEditItem({ ...item, type, courseId, chapterId });
  };

  const handleEdit = (e) => {
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: value });
  };

  const saveEdit = async () => {
    const courseRef = doc(db, 'library', editItem.courseId || editItem.id);
    const courseDoc = await getDoc(courseRef);
  
    if (!courseDoc.exists()) {
      console.error('Course does not exist:', editItem.courseId || editItem.id);
      return;
    }
  
    const courseData = courseDoc.data();
  
    if (editItem.type === 'course') {
      // Update the course itself
      await updateDoc(courseRef, editItem);
    } else if (editItem.type === 'chapter') {
      // Update a chapter within the course
      const updatedChapters = courseData.chapters.map(chapter =>
        chapter.id === editItem.id ? { ...chapter, ...editItem } : chapter
      );
      await updateDoc(courseRef, { chapters: updatedChapters });
    } else if (editItem.type === 'lesson') {
      // Update a lesson within a chapter
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
    }
  
    // Update the local state
    setLibrary(library.map(course => course.id === (editItem.courseId || editItem.id) ? { ...course, ...courseData } : course));
    setEditMode(false);
    setEditItem(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewHomework({ ...newHomework, files });
  };

  const handleHomeworkNameChange = (e) => {
    setNewHomework({ ...newHomework, name: e.target.value });
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

  const renderEditForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Edit Item</h2>
        <Input
          name="name"
          value={editItem.name}
          onChange={handleEdit}
          className="mb-2"
          placeholder="Name"
        />
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
        {editItem.description !== undefined && (
          <Input
            name="description"
            value={editItem.description}
            onChange={handleEdit}
            className="mb-2"
            placeholder="Description"
          />
        )}
        <Button onClick={saveEdit} className="mr-2">Save</Button>
        <Button onClick={() => setEditMode(false)}>Cancel</Button>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div>
      {library.map(course => (
        <div key={course.id} className="mb-4">
          <div className="flex items-center">
            <Button onClick={() => toggleCourse(course.id)} className="mr-2">
              {expandedCourses[course.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <span className="font-bold">{course.name}</span>
            <Button onClick={() => startEdit(course, 'course')} className="ml-2">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => addChapter(course.id)} className="ml-2">
              <PlusCircle className="h-4 w-4" /> Chapter
            </Button>
            <Button onClick={() => deleteCourse(course.id)} className="ml-2">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {expandedCourses[course.id] && (
            <div>
              {(course.chapters?.length || 0) === 0 && (
                <div className="ml-4 mt-2 text-gray-500">No chapters available</div>
              )}
              {course.chapters?.map(chapter => (
                <div key={chapter.id} className="ml-4 mt-2">
                  <div className="flex items-center">
                    <Button onClick={() => toggleChapter(chapter.id)} className="mr-2">
                      {expandedChapters[chapter.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <span>{chapter.ordinal}. {chapter.name}</span>
                    <Button onClick={() => startEdit(chapter, 'chapter', course.id)} className="ml-2">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => addLesson(course.id, chapter.id)} className="ml-2">
                      <PlusCircle className="h-4 w-4" /> Lesson
                    </Button>
                    <Button onClick={() => deleteChapter(course.id, chapter.id)} className="ml-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {expandedChapters[chapter.id] && (
                    <div>
                      {(chapter.lessons?.length || 0) === 0 && (
                        <div className="ml-4 mt-2 text-gray-500">No lessons available</div>
                      )}
                      {chapter.lessons?.map(lesson => (
                        <div key={lesson.id} className="ml-4 mt-2">
                          <div className="flex items-center">
                            <Button onClick={() => toggleLesson(lesson.id)} className="mr-2">
                              {expandedLessons[lesson.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                            <span>{lesson.ordinal}. {lesson.name}</span>
                            <Button onClick={() => startEdit(lesson, 'lesson', course.id, chapter.id)} className="ml-2">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => addHomework(course.id, chapter.id, lesson.id)} className="ml-2">
                              <PlusCircle className="h-4 w-4" /> Homework
                            </Button>
                            <Button onClick={() => deleteLesson(course.id, chapter.id, lesson.id)} className="ml-2">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {expandedLessons[lesson.id] && (
                            <div>
                              <p className="ml-6 text-sm text-gray-600">{lesson.description}</p>
                              <div className="ml-6 mt-2">
                                <Input
                                  type="text"
                                  value={newHomework.name}
                                  onChange={handleHomeworkNameChange}
                                  placeholder="Homework Name"
                                  className="mb-2"
                                />
                                <input type="file" multiple onChange={handleFileChange} className="mb-2" />
                                <Button onClick={() => addHomework(course.id, chapter.id, lesson.id)} className="ml-2">
                                  <PlusCircle className="h-4 w-4" /> Add Homework
                                </Button>
                              </div>
                              {(lesson.homeworks?.length || 0) === 0 && (
                                <div className="ml-6 mt-2 text-gray-500">No homeworks available</div>
                              )}
                              {lesson.homeworks?.map(homework => (
                                <div key={homework.id} className="ml-6 mt-2">
                                  <div className="flex items-center">
                                    <ChevronRight className="mr-2 h-4 w-4" />
                                    <span>{homework.name}</span>
                                    {homework.fileURLs.map((fileURL, index) => (
                                      <a key={index} href={fileURL} target="_blank" rel="noopener noreferrer" className="ml-2">
                                        File {index + 1}
                                      </a>
                                    ))}
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
    <div className="p-4">
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