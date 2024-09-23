import React, { useState, useContext, useEffect } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { PlusCircle, Edit2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const Library = () => {
  const { courses, addCourse, updateCourse, deleteCourse } = useContext(GlobalStateContext);

  const [newCourse, setNewCourse] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newLesson, setNewLesson] = useState('');
  const [newHomework, setNewHomework] = useState('');
  const [homeworkFiles, setHomeworkFiles] = useState([]);
  const [expandedBranches, setExpandedBranches] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const toggleBranch = (id) => {
    setExpandedBranches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (newCourse) {
      await addCourse({ id: Date.now().toString(), name: newCourse, chapters: [] });
      setNewCourse('');
    }
  };

  const handleAddChapter = async (courseId) => {
    if (newChapter) {
      const course = courses.find(course => course.id === courseId);
      const updatedCourse = {
        ...course,
        chapters: [...course.chapters, { id: Date.now().toString(), name: newChapter, lessons: [] }]
      };
      await updateCourse(courseId, updatedCourse);
      setNewChapter('');
    }
  };

  const handleAddLesson = async (courseId, chapterId) => {
    if (newLesson) {
      const course = courses.find(course => course.id === courseId);
      const chapter = course.chapters.find(ch => ch.id === chapterId);
      const updatedChapter = {
        ...chapter,
        lessons: [...chapter.lessons, { id: Date.now().toString(), name: newLesson, homework: { text: '', files: [] } }]
      };
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map(ch => ch.id === chapterId ? updatedChapter : ch)
      };
      await updateCourse(courseId, updatedCourse);
      setNewLesson('');
    }
  };

  const handleAddHomework = async (courseId, chapterId, lessonId) => {
    if (newHomework) {
      const course = courses.find(course => course.id === courseId);
      const chapter = course.chapters.find(ch => ch.id === chapterId);
      const lesson = chapter.lessons.find(l => l.id === lessonId);
      const updatedLesson = {
        ...lesson,
        homework: { text: newHomework, files: homeworkFiles.map(file => ({ name: file.name, url: URL.createObjectURL(file) })) }
      };
      const updatedChapter = {
        ...chapter,
        lessons: chapter.lessons.map(l => l.id === lessonId ? updatedLesson : l)
      };
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map(ch => ch.id === chapterId ? updatedChapter : ch)
      };
      await updateCourse(courseId, updatedCourse);
      setNewHomework('');
      setHomeworkFiles([]);
    }
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setHomeworkFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setHomeworkFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleDeleteCourse = async (courseId) => {
    console.log(`Deleting course with id: ${courseId}`); // Debugging log
    await deleteCourse(courseId);
    console.log(`Course with id: ${courseId} deleted`); // Debugging log
  };

  const handleDeleteAllCourses = async () => {
    for (const course of courses) {
      await deleteCourse(course.id);
    }
    console.log('All courses deleted'); // Debugging log
  };

  const handleRemoveHomeworkFile = async (courseId, chapterId, lessonId, fileIndex) => {
    const course = courses.find(course => course.id === courseId);
    const chapter = course.chapters.find(ch => ch.id === chapterId);
    const lesson = chapter.lessons.find(l => l.id === lessonId);
    const updatedLesson = {
      ...lesson,
      homework: {
        ...lesson.homework,
        files: lesson.homework.files.filter((_, i) => i !== fileIndex)
      }
    };
    const updatedChapter = {
      ...chapter,
      lessons: chapter.lessons.map(l => l.id === lessonId ? updatedLesson : l)
    };
    const updatedCourse = {
      ...course,
      chapters: course.chapters.map(ch => ch.id === chapterId ? updatedChapter : ch)
    };
    await updateCourse(courseId, updatedCourse);
  };

  const startEditing = (item, value) => {
    setEditingItem(item);
    setEditingValue(value);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditingValue('');
  };

  const saveEditing = async () => {
    const { type, courseId, chapterId, lessonId } = editingItem;
    if (type === 'course') {
      const course = courses.find(c => c.id === courseId);
      const updatedCourse = { ...course, name: editingValue };
      await updateCourse(courseId, updatedCourse);
    } else if (type === 'chapter') {
      const course = courses.find(c => c.id === courseId);
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map(ch => ch.id === chapterId ? { ...ch, name: editingValue } : ch)
      };
      await updateCourse(courseId, updatedCourse);
    } else if (type === 'lesson') {
      const course = courses.find(c => c.id === courseId);
      const chapter = course.chapters.find(ch => ch.id === chapterId);
      const updatedChapter = {
        ...chapter,
        lessons: chapter.lessons.map(l => l.id === lessonId ? { ...l, name: editingValue } : l)
      };
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map(ch => ch.id === chapterId ? updatedChapter : ch)
      };
      await updateCourse(courseId, updatedCourse);
    } else if (type === 'homework') {
      const course = courses.find(c => c.id === courseId);
      const chapter = course.chapters.find(ch => ch.id === chapterId);
      const lesson = chapter.lessons.find(l => l.id === lessonId);
      const updatedLesson = {
        ...lesson,
        homework: { ...lesson.homework, text: editingValue }
      };
      const updatedChapter = {
        ...chapter,
        lessons: chapter.lessons.map(l => l.id === lessonId ? updatedLesson : l)
      };
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map(ch => ch.id === chapterId ? updatedChapter : ch)
      };
      await updateCourse(courseId, updatedCourse);
    }
    cancelEditing();
  };

  const renderTree = () => {
    console.log('Rendering courses:', courses); // Debugging log
    return (
      <div>
        <form onSubmit={handleAddCourse} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            placeholder="New Course"
          />
          <Button type="submit">
            <PlusCircle style={{ height: '1rem', width: '1rem' }} /> Add Course
          </Button>
        </form>
        <Button onClick={handleDeleteAllCourses} style={{ marginBottom: '1rem', backgroundColor: '#EF4444', hover: { backgroundColor: '#DC2626' } }}>
          <Trash2 style={{ height: '1rem', width: '1rem' }} /> Delete All Courses
        </Button>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {courses.sort((a, b) => a.ordinal - b.ordinal).map(course => (
            <div key={course.id} style={{ marginBottom: '1rem', flex: '1 1 calc(33.333% - 1rem)', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '1rem' }}>
                  <Button onClick={() => toggleBranch(course.id)} style={{ marginBottom: '0.5rem' }}>
                    {expandedBranches[course.id] ? <ChevronDown style={{ height: '1rem', width: '1rem' }} /> : <ChevronRight style={{ height: '1rem', width: '1rem' }} />}
                  </Button>
                  <Button onClick={() => startEditing({ type: 'course', courseId: course.id }, course.name)} style={{ marginBottom: '0.5rem' }}>
                    <Edit2 style={{ height: '1rem', width: '1rem' }} />
                  </Button>
                  <Button onClick={() => handleAddChapter(course.id)} style={{ marginBottom: '0.5rem' }}>
                    <PlusCircle style={{ height: '1rem', width: '1rem' }} /> Chapter
                  </Button>
                  <Button onClick={() => handleDeleteCourse(course.id)} style={{ marginBottom: '0.5rem', backgroundColor: '#EF4444', hover: { backgroundColor: '#DC2626' } }}>
                    <Trash2 style={{ height: '1rem', width: '1rem' }} />
                  </Button>
                </div>
                <div>
                  {editingItem?.type === 'course' && editingItem.courseId === course.id ? (
                    <div>
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                      />
                      <Button onClick={saveEditing}>Update</Button>
                      <Button onClick={cancelEditing}>Cancel</Button>
                    </div>
                  ) : (
                    <span style={{ fontWeight: 'bold' }}>{course.name}</span>
                  )}
                  {expandedBranches[course.id] && course.chapters?.sort((a, b) => a.ordinal - b.ordinal).map(chapter => (
                    <div key={chapter.id} style={{ marginLeft: '1rem', marginTop: '0.5rem' }} id={`chapter-${chapter.id}`}>
                      <div style={{ display: 'flex' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '1rem' }}>
                          <Button onClick={() => toggleBranch(chapter.id)} style={{ marginBottom: '0.5rem' }}>
                            {expandedBranches[chapter.id] ? <ChevronDown style={{ height: '1rem', width: '1rem' }} /> : <ChevronRight style={{ height: '1rem', width: '1rem' }} />}
                          </Button>
                          <Button onClick={() => startEditing({ type: 'chapter', courseId: course.id, chapterId: chapter.id }, chapter.name)} style={{ marginBottom: '0.5rem' }}>
                            <Edit2 style={{ height: '1rem', width: '1rem' }} />
                          </Button>
                          <Button onClick={() => handleAddLesson(course.id, chapter.id)} style={{ marginBottom: '0.5rem' }}>
                            <PlusCircle style={{ height: '1rem', width: '1rem' }} /> Lesson
                          </Button>
                          <Button onClick={() => handleDeleteCourse(course.id)} style={{ marginBottom: '0.5rem', backgroundColor: '#EF4444', hover: { backgroundColor: '#DC2626' } }}>
                            <Trash2 style={{ height: '1rem', width: '1rem' }} />
                          </Button>
                        </div>
                        <div>
                          {editingItem?.type === 'chapter' && editingItem.chapterId === chapter.id ? (
                            <div>
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                              />
                              <Button onClick={saveEditing}>Update</Button>
                              <Button onClick={cancelEditing}>Cancel</Button>
                            </div>
                          ) : (
                            <span>{chapter.ordinal}. {chapter.name}</span>
                          )}
                          {expandedBranches[chapter.id] && chapter.lessons?.sort((a, b) => a.ordinal - b.ordinal).map(lesson => (
                            <div key={lesson.id} style={{ marginLeft: '1rem', marginTop: '0.5rem' }} id={`lesson-${lesson.id}`}>
                              <div style={{ display: 'flex' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '1rem' }}>
                                  <Button onClick={() => toggleBranch(lesson.id)} style={{ marginBottom: '0.5rem' }}>
                                    {expandedBranches[lesson.id] ? <ChevronDown style={{ height: '1rem', width: '1rem' }} /> : <ChevronRight style={{ height: '1rem', width: '1rem' }} />}
                                  </Button>
                                  <Button onClick={() => startEditing({ type: 'lesson', courseId: course.id, chapterId: chapter.id, lessonId: lesson.id }, lesson.name)} style={{ marginBottom: '0.5rem' }}>
                                    <Edit2 style={{ height: '1rem', width: '1rem' }} />
                                  </Button>
                                  <Button onClick={() => handleAddHomework(course.id, chapter.id, lesson.id)} style={{ marginBottom: '0.5rem' }}>
                                    <PlusCircle style={{ height: '1rem', width: '1rem' }} /> Homework
                                  </Button>
                                  <Button onClick={() => handleDeleteCourse(course.id)} style={{ marginBottom: '0.5rem', backgroundColor: '#EF4444', hover: { backgroundColor: '#DC2626' } }}>
                                    <Trash2 style={{ height: '1rem', width: '1rem' }} />
                                  </Button>
                                </div>
                                <div>
                                  {editingItem?.type === 'lesson' && editingItem.lessonId === lesson.id ? (
                                    <div>
                                      <input
                                        type="text"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                      />
                                      <Button onClick={saveEditing}>Update</Button>
                                      <Button onClick={cancelEditing}>Cancel</Button>
                                    </div>
                                  ) : (
                                    <span>{lesson.ordinal}. {lesson.name}</span>
                                  )}
                                  {expandedBranches[lesson.id] && (
                                    <div>
                                      <h4>Homeworks:</h4>
                                      {Array.isArray(lesson.homework.files) && lesson.homework.files.map((file, index) => (
                                        <div key={index} style={{ marginLeft: '1rem', marginTop: '0.5rem', padding: '1rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                              {file.name}
                                            </a>
                                            <button onClick={() => handleRemoveHomeworkFile(course.id, chapter.id, lesson.id, index)} className="ml-2 text-red-500 hover:text-red-700">
                                              &times;
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="library-container">
      <form onSubmit={handleAddCourse} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={newCourse}
          onChange={(e) => setNewCourse(e.target.value)}
          placeholder="New Course"
        />
        <Button type="submit">
          <PlusCircle style={{ height: '1rem', width: '1rem' }} /> Add Course
        </Button>
      </form>
      <Button onClick={handleDeleteAllCourses} style={{ marginBottom: '1rem', backgroundColor: '#EF4444', hover: { backgroundColor: '#DC2626' } }}>
        <Trash2 style={{ height: '1rem', width: '1rem' }} /> Delete All Courses
      </Button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {courses.sort((a, b) => a.ordinal - b.ordinal).map(course => (
          <div key={course.id} style={{ marginBottom: '1rem', flex: '1 1 calc(33.333% - 1rem)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '1rem' }}>
                <Button onClick={() => toggleBranch(course.id)} style={{ marginBottom: '0.5rem' }}>
                  {expandedBranches[course.id] ? <ChevronDown style={{ height: '1rem', width: '1rem' }} /> : <ChevronRight style={{ height: '1rem', width: '1rem' }} />}
                </Button>
                <Button onClick={() => startEditing({ type: 'course', courseId: course.id }, course.name)} style={{ marginBottom: '0.5rem' }}>
                  <Edit2 style={{ height: '1rem', width: '1rem' }} />
                </Button>
                <Button onClick={() => handleAddChapter(course.id)} style={{ marginBottom: '0.5rem' }}>
                  <PlusCircle style={{ height: '1rem', width: '1rem' }} /> Chapter
                </Button>
                <Button onClick={() => handleDeleteCourse(course.id)} style={{ marginBottom: '0.5rem', backgroundColor: '#EF4444', hover: { backgroundColor: '#DC2626' } }}>
                  <Trash2 style={{ height: '1rem', width: '1rem' }} />
                </Button>
              </div>
              <div>
                {editingItem?.type === 'course' && editingItem.courseId === course.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                    />
                    <Button onClick={saveEditing}>Update</Button>
                    <Button onClick={cancelEditing}>Cancel</Button>
                  </div>
                ) : (
                  <span style={{ fontWeight: 'bold' }}>{course.name}</span>
                )}
                {expandedBranches[course.id] && course.chapters?.sort((a, b) => a.ordinal - b.ordinal).map(chapter => (
                  <div key={chapter.id} style={{ marginLeft: '1rem', marginTop: '0.5rem' }} id={`chapter-${chapter.id}`}>
                    <div style={{ display: 'flex' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', marginRight: '1rem' }}>
                        <Button onClick={() => toggleBranch(chapter.id)} style={{ marginBottom: '0.5rem' }}>
                          {expandedBranches[chapter.id] ? <ChevronDown style={{ height: '1rem', width: '1rem' }} /> : <ChevronRight style={{ height: '1rem', width: '1rem' }} />}
                        </Button>
                        <Button onClick={() => startEditing({ type: 'chapter', courseId: course.id, chapterId: chapter.id }, chapter.name)} style={{ marginBottom: '0.5rem' }}>
                          <Edit2 style={{ height: '1rem', width: '1rem' }} />
                        </Button>
                        <Button onClick={() => handleAddLesson(course.id, chapter.id)} style={{ marginBottom: '0.5rem' }}>
                          <PlusCircle style={{ height: '1rem', width: '1rem' }} /> Lesson
                        </Button>
                        <Button onClick={() => handleDeleteCourse(course.id)} style={{ marginBottom: '0.5rem', backgroundColor: '#EF4444', hover: { backgroundColor: '#DC2626' } }}>
                          <Trash2 style={{ height: '1rem', width: '1rem' }} />
                        </Button>
                      </div>
                      <div>
                        {editingItem?.type === 'chapter' && editingItem.chapterId === chapter.id ? (
                          <div>
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                            />
                            <Button onClick={saveEditing}>Update</Button>
                            <Button onClick={cancelEditing}>Cancel</Button>
                          </div>
                        ) : (
                          <span>{chapter.ordinal}. {chapter.name}</span>
                        )}
                        {expandedBranches[chapter.id] && chapter.lessons?.sort((a, b) => a.ordinal - b.ordinal).map(lesson => (
                          <div key={lesson.id} style={{ marginLeft: '1rem', marginTop: '0.5rem' }} id={`lesson-${lesson.id}`}>
                            <div style={{ display: 'flex' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '1rem' }}>
                                <Button onClick={() => toggleBranch(lesson.id)} style={{ marginBottom: '0.5rem' }}>
                                  {expandedBranches[lesson.id] ? <ChevronDown style={{ height: '1rem', width: '1rem' }} /> : <ChevronRight style={{ height: '1rem', width: '1rem' }} />}
                                </Button>
                                <Button onClick={() => startEditing({ type: 'lesson', courseId: course.id, chapterId: chapter.id, lessonId: lesson.id }, lesson.name)} style={{ marginBottom: '0.5rem' }}>
                                  <Edit2 style={{ height: '1rem', width: '1rem' }} />
                                </Button>
                                <Button onClick={() => handleAddHomework(course.id, chapter.id, lesson.id)} style={{ marginBottom: '0.5rem' }}>
                                  <PlusCircle style={{ height: '1rem', width: '1rem' }} /> Homework
                                </Button>
                                <Button onClick={() => handleDeleteCourse(course.id)} style={{ marginBottom: '0.5rem', backgroundColor: '#EF4444', hover: { backgroundColor: '#DC2626' } }}>
                                  <Trash2 style={{ height: '1rem', width: '1rem' }} />
                                </Button>
                              </div>
                              <div>
                                {editingItem?.type === 'lesson' && editingItem.lessonId === lesson.id ? (
                                  <div>
                                    <input
                                      type="text"
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                    />
                                    <Button onClick={saveEditing}>Update</Button>
                                    <Button onClick={cancelEditing}>Cancel</Button>
                                  </div>
                                ) : (
                                  <span>{lesson.ordinal}. {lesson.name}</span>
                                )}
                                {expandedBranches[lesson.id] && (
                                  <div>
                                    <h4>Homeworks:</h4>
                                    {Array.isArray(lesson.homework.files) && lesson.homework.files.map((file, index) => (
                                      <div key={index} style={{ marginLeft: '1rem', marginTop: '0.5rem', padding: '1rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {file.name}
                                          </a>
                                          <button onClick={() => handleRemoveHomeworkFile(course.id, chapter.id, lesson.id, index)} className="ml-2 text-red-500 hover:text-red-700">
                                            &times;
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;