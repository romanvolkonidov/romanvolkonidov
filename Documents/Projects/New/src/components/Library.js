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
  const [newHomework, setNewHomework] = useState({ text: '', files: [] });
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

  const addHomework = async (courseId, chapterId, lessonId) => {
    const { text, files } = newHomework;
    if (!text || files.length === 0) {
      console.error('Homework text or files missing');
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

    const newHomeworkData = { id: Date.now().toString(), text, fileURLs };
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
    setNewHomework({ text: '', files: [] }); // Reset new homework state
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

  const handleHomeworkTextChange = (e) => {
    setNewHomework({ ...newHomework, text: e.target.value });
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

  const containerStyles = {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const courseStyles = {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#fff',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  };

  const courseHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
  };

  const chapterStyles = {
    marginLeft: '1rem',
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  };

  const chapterHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.25rem',
  };

  const lessonStyles = {
    marginLeft: '1rem',
    marginTop: '0.25rem',
    padding: '0.5rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  };

  const lessonHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.25rem',
  };

  const homeworkStyles = {
    marginLeft: '1rem',
    marginTop: '0.25rem',
    padding: '0.5rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  };

  const renderEditForm = () => (
    <div style={{ position: 'fixed', inset: '0', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Edit Item</h2>
        <Input
          name="name"
          value={editItem.name}
          onChange={handleEdit}
          style={{ marginBottom: '8px' }}
          placeholder="Name"
        />
        {editItem.ordinal !== undefined && (
          <Input
            name="ordinal"
            type="number"
            value={editItem.ordinal}
            onChange={handleEdit}
            style={{ marginBottom: '8px' }}
            placeholder="Ordinal"
          />
        )}
        {(editItem.type === 'course' || editItem.type === 'chapter' || editItem.type === 'lesson') && (
          <textarea
            name="description"
            value={editItem.description || ''}
            onChange={handleEdit}
            style={{ marginBottom: '8px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
            placeholder="Description"
          />
        )}
        <Button onClick={saveEdit} style={{ marginRight: '8px' }}>Save</Button>
        <Button onClick={() => setEditMode(false)}>Cancel</Button>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div style={containerStyles}>
      {library.map(course => (
        <div key={course.id} style={courseStyles}>
          <div style={courseHeaderStyles}>
            <Button onClick={() => toggleCourse(course.id)} style={{ marginRight: '0.5rem' }}>
              {expandedCourses[course.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <span style={{ fontWeight: 'bold' }}>{course.name}</span>
            <Button onClick={() => startEdit(course, 'course')} style={{ marginLeft: 'auto' }}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => addChapter(course.id)} style={{ marginLeft: '0.5rem' }}>
              <PlusCircle className="h-4 w-4" />
            </Button>
            <Button onClick={() => deleteCourse(course.id)} style={{ marginLeft: '0.5rem' }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {expandedCourses[course.id] && (
            <div>
              <p style={{ marginLeft: '1rem', fontSize: '0.875rem', color: '#555' }}>{course.description}</p>
              {(course.chapters?.length || 0) === 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem', color: '#777' }}>
                  No chapters available
                </div>
              )}
              {course.chapters?.map(chapter => (
                <div key={chapter.id} style={chapterStyles}>
                  <div style={chapterHeaderStyles}>
                    <Button onClick={() => toggleChapter(chapter.id)} style={{ marginRight: '0.5rem' }}>
                      {expandedChapters[chapter.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <span>{chapter.ordinal}. {chapter.name}</span>
                    <Button onClick={() => startEdit(chapter, 'chapter', course.id)} style={{ marginLeft: 'auto' }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => addLesson(course.id, chapter.id)} style={{ marginLeft: '0.5rem' }}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => deleteChapter(course.id, chapter.id)} style={{ marginLeft: '0.5rem' }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {expandedChapters[chapter.id] && (
                    <div>
                      <p style={{ marginLeft: '1rem', fontSize: '0.875rem', color: '#555' }}>{chapter.description}</p>
                      {(chapter.lessons?.length || 0) === 0 && (
                        <div style={{ marginLeft: '1rem', marginTop: '0.5rem', color: '#777' }}>
                          No lessons available
                        </div>
                      )}
                      {chapter.lessons?.map(lesson => (
                        <div key={lesson.id} style={lessonStyles}>
                          <div style={lessonHeaderStyles}>
                            <Button onClick={() => toggleLesson(lesson.id)} style={{ marginRight: '0.5rem' }}>
                              {expandedLessons[lesson.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                            <span>{lesson.ordinal}. {lesson.name}</span>
                            <Button onClick={() => startEdit(lesson, 'lesson', course.id, chapter.id)} style={{ marginLeft: 'auto' }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => addHomework(course.id, chapter.id, lesson.id)} style={{ marginLeft: '0.5rem' }}>
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => deleteLesson(course.id, chapter.id, lesson.id)} style={{ marginLeft: '0.5rem' }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {expandedLessons[lesson.id] && (
                            <div>
                              <p style={{ marginLeft: '1.5rem', fontSize: '0.875rem', color: '#555' }}>{lesson.description}</p>
                              <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                                <Input
                                  type="text"
                                  value={newHomework.text}
                                  onChange={handleHomeworkTextChange}
                                  placeholder="Homework Text"
                                  style={{ marginBottom: '0.5rem' }}
                                />
                                <input type="file" multiple onChange={handleFileChange} style={{ marginBottom: '0.5rem' }} />
                                <Button onClick={() => addHomework(course.id, chapter.id, lesson.id)} style={{ marginLeft: '0.5rem' }}>
                                  <PlusCircle className="h-4 w-4" /> Save
                                </Button>
                              </div>
                              {(lesson.homeworks?.length || 0) === 0 && (
                                <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#777' }}>
                                  No homeworks available
                                </div>
                              )}
                              {lesson.homeworks?.map(homework => (
                                <div key={homework.id} style={homeworkStyles}>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <ChevronRight style={{ marginRight: '0.5rem', height: '16px', width: '16px' }} />
                                    <span>{homework.text}</span>
                                    {homework.fileURLs.map((fileURL, index) => (
                                      <a key={index} href={fileURL} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem' }}>
                                        File {index + 1}
                                      </a>
                                    ))}
                                    <Button onClick={() => deleteHomework(course.id, chapter.id, lesson.id, homework.id)} style={{ marginLeft: '0.5rem' }}>
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
    <div style={containerStyles}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Library</h1>
      <Button onClick={addCourse} style={{ marginBottom: '1rem' }}>
        <PlusCircle style={{ marginRight: '0.5rem', height: '16px', width: '16px' }} /> Add Course
      </Button>
      {renderLibrary()}
      {editMode && renderEditForm()}
    </div>
  );
};

export default Library;