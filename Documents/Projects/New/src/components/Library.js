import React, { useContext, useEffect, useState, useRef } from 'react';
import { PlusCircle, Edit2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlobalStateContext } from '@/context/GlobalStateContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Library = () => {
  const { courses, addCourse, updateCourse, deleteCourse, loading, error } = useContext(GlobalStateContext);

  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [expandedBranches, setExpandedBranches] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);
  const newItemRef = useRef(null);

  useEffect(() => {
    if (newItemRef.current) {
      newItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [courses]);

  const toggleBranch = (id) => {
    setExpandedBranches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandBranch = (id) => {
    setExpandedBranches(prev => ({ ...prev, [id]: true })); 
  };

  const addChapter = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    const newChapter = { id: Date.now(), name: 'New Chapter', ordinal: (course.chapters?.length || 0) + 1, lessons: [] };
    const updatedCourse = { ...course, chapters: [...(course.chapters || []), newChapter] };
    updateCourse(courseId, updatedCourse);
    expandBranch(courseId);
    newItemRef.current = document.getElementById(`chapter-${newChapter.id}`);
  };

  const addLesson = (courseId, chapterId) => {
    const course = courses.find(c => c.id === courseId);
    let newLesson;
    const updatedCourse = {
      ...course,
      chapters: course.chapters.map(chapter => {
        if (chapter.id === chapterId) {
          newLesson = {
            id: Date.now(),
            name: 'New Lesson',
            ordinal: (chapter.lessons?.length || 0) + 1,
            description: '',
            homeworks: []
          };
          return { ...chapter, lessons: [...(chapter.lessons || []), newLesson] };
        }
        return chapter;
      })
    };
    updateCourse(courseId, updatedCourse);
    expandBranch(courseId);
    expandBranch(chapterId);
    newItemRef.current = document.getElementById(`lesson-${newLesson.id}`);
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
  };

  const handleDelete = () => {
    const { type, courseId, chapterId, lessonId } = itemToDelete;
    if (type === 'course') {
      deleteCourse(courseId);
    } else if (type === 'chapter') {
      const course = courses.find(c => c.id === courseId);
      const updatedCourse = {
        ...course,
        chapters: course.chapters.filter(chapter => chapter.id !== chapterId)
      };
      updateCourse(courseId, updatedCourse);
    } else if (type === 'lesson') {
      const course = courses.find(c => c.id === courseId);
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map(chapter => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              lessons: chapter.lessons.filter(lesson => lesson.id !== lessonId)
            };
          }
          return chapter;
        })
      };
      updateCourse(courseId, updatedCourse);
    }
    setItemToDelete(null);
  };

  const startEdit = (item) => {
    setEditMode(true);
    setEditItem(item);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleHomeworkChange = (homeworkId, e) => {
    const { name, value, files } = e.target;
    setEditItem((prevState) => {
      const updatedHomeworks = prevState.homeworks.map(hw => {
        if (hw.id === homeworkId) {
          if (name === 'text') {
            return { ...hw, text: value };
          } else if (name === 'files') {
            const currentFiles = hw.files || [];
            const newFiles = Array.from(files);
            const totalFiles = currentFiles.length + newFiles.length;
            if (totalFiles > 10) {
              alert('You can only upload up to 10 files.');
              return { ...hw, files: [...currentFiles, ...newFiles.slice(0, 10 - currentFiles.length)] };
            }
            return { ...hw, files: [...currentFiles, ...newFiles] };
          }
        }
        return hw;
      });
      return { ...prevState, homeworks: updatedHomeworks };
    });
  };

  const addHomework = (courseId, chapterId, lessonId) => {
    const newHomework = { id: Date.now(), text: '', files: [] };
    const course = courses.find(c => c.id === courseId);
    const updatedCourse = {
      ...course,
      chapters: course.chapters.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            lessons: chapter.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return { ...lesson, homeworks: [...(lesson.homeworks || []), newHomework] };
              }
              return lesson;
            })
          };
        }
        return chapter;
      })
    };
    updateCourse(courseId, updatedCourse);
    expandBranch(courseId);
    expandBranch(chapterId);
    expandBranch(lessonId);
    newItemRef.current = document.getElementById(`homework-${newHomework.id}`);
  };

  const addHomeworkEntry = () => {
    setEditItem((prevState) => ({
      ...prevState,
      homeworks: [...prevState.homeworks, { id: Date.now(), text: '', files: [] }]
    }));
  };

  const removeHomeworkEntry = (homeworkId) => {
    setEditItem((prevState) => ({
      ...prevState,
      homeworks: prevState.homeworks.filter(hw => hw.id !== homeworkId)
    }));
  };

  const uploadFilesToFirebase = async (files) => {
    const storage = getStorage();
    const uploadPromises = files.map(file => {
      const storageRef = ref(storage, `homework/${file.name}`);
      return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
    });
    return Promise.all(uploadPromises);
  };

  const saveEdit = async () => {
    if (editItem.homeworks) {
      for (let homework of editItem.homeworks) {
        if (homework.files.length > 0) {
          const newFiles = homework.files.filter(file => typeof file !== 'string'); // Filter out already uploaded files
          if (newFiles.length > 0) {
            const fileUrls = await uploadFilesToFirebase(newFiles);
            homework.files = [...homework.files.filter(file => typeof file === 'string'), ...fileUrls]; // Merge existing and new file URLs
          }
        }
      }
    }
  
    if (editItem.chapters) {
      updateCourse(editItem.id, editItem);
    } else if (editItem.lessons) {
      const course = courses.find(c => c.chapters.some(ch => ch.id === editItem.id));
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map(ch => ch.id === editItem.id ? editItem : ch)
      };
      updateCourse(course.id, updatedCourse);
    } else {
      const course = courses.find(c => c.chapters.some(ch => ch.lessons.some(l => l.id === editItem.id)));
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map(ch => ({
          ...ch,
          lessons: ch.lessons.map(l => l.id === editItem.id ? editItem : l)
        }))
      };
      updateCourse(course.id, updatedCourse);
    }
    setEditMode(false);
    setEditItem(null);
  };

  const renderEditForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Item</h2>
        <input
          name="name"
          value={editItem?.name || ''}
          onChange={handleEditChange}
          className="mb-2 p-2 border w-full"
          placeholder="Name"
        />
        {editItem?.ordinal !== undefined && (
          <input
            name="ordinal"
            type="number"
            value={editItem?.ordinal || ''}
            onChange={handleEditChange}
            className="mb-2 p-2 border w-full"
            placeholder="Ordinal"
          />
        )}
        {editItem?.description !== undefined && (
          <textarea
            name="description"
            value={editItem?.description || ''}
            onChange={handleEditChange}
            className="mb-2 p-2 border w-full"
            placeholder="Description"
            rows="4"
          />
        )}
        {Array.isArray(editItem?.homeworks) && (
          <div>
            <h3 className="font-bold mb-2">Homeworks</h3>
            {editItem.homeworks.map((hw) => (
              <div key={hw.id} className="mb-4 p-2 border rounded">
                <textarea
                  name="text"
                  value={hw.text || ''}
                  onChange={(e) => handleHomeworkChange(hw.id, e)}
                  className="mb-2 p-2 border w-full"
                  placeholder="Homework Text"
                  rows="2"
                />
                {hw.files && hw.files.map((file, index) => (
                  <div key={index} className="mb-2 flex items-center">
                    <Button onClick={() => window.open(file, '_blank')} className="mr-2">View File</Button>
                    <Button onClick={() => removeFile(hw.id, index)} className="bg-red-500 hover:bg-red-600">Delete File</Button>
                  </div>
                ))}
                <input
                  name="files"
                  type="file"
                  multiple
                  onChange={(e) => handleHomeworkChange(hw.id, e)}
                  className="mb-2 p-2 border w-full"
                />
                <Button onClick={() => removeHomeworkEntry(hw.id)} className="mb-2 bg-red-500 hover:bg-red-600">
                  Remove Homework
                </Button>
              </div>
            ))}
            <Button onClick={addHomeworkEntry} className="mb-2">
              Add Homework Entry
            </Button>
          </div>
        )}
        <Button onClick={saveEdit} className="mr-2">Save</Button>
        <Button onClick={() => setEditMode(false)}>Cancel</Button>
      </div>
    </div>
  );

  const removeFile = (homeworkId, fileIndex) => {
    setEditItem((prevState) => {
      const updatedHomeworks = prevState.homeworks.map(hw => {
        if (hw.id === homeworkId) {
          const updatedFiles = hw.files.filter((_, index) => index !== fileIndex);
          return { ...hw, files: updatedFiles };
        }
        return hw;
      });
      return { ...prevState, homeworks: updatedHomeworks };
    });
  };

  const removeFileFromTree = (courseId, chapterId, lessonId, homeworkId, fileIndex) => {
    const course = courses.find(c => c.id === courseId);
    const updatedCourse = {
      ...course,
      chapters: course.chapters.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            lessons: chapter.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return {
                  ...lesson,
                  homeworks: lesson.homeworks.map(hw => {
                    if (hw.id === homeworkId) {
                      const updatedFiles = hw.files.filter((_, index) => index !== fileIndex);
                      return { ...hw, files: updatedFiles };
                    }
                    return hw;
                  })
                };
              }
              return lesson;
            })
          };
        }
        return chapter;
      })
    };
    updateCourse(courseId, updatedCourse);
  };

  const renderLibrary = () => (
    <div>
      {courses.sort((a, b) => a.ordinal - b.ordinal).map(course => (
        <div key={course.id} className="mb-4">
          <div className="flex">
            <div className="flex flex-col mr-4">
              <Button onClick={() => toggleBranch(course.id)} className="mb-2">
                {expandedBranches[course.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <Button onClick={() => startEdit(course)} className="mb-2">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button onClick={() => addChapter(course.id)} className="mb-2">
                <PlusCircle className="h-4 w-4" /> Chapter
              </Button>
              <Button onClick={() => confirmDelete({ type: 'course', courseId: course.id })} className="mb-2 bg-red-500 hover:bg-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <span className="font-bold">{course.name}</span>
              {expandedBranches[course.id] && course.chapters?.sort((a, b) => a.ordinal - b.ordinal).map(chapter => (
                <div key={chapter.id} className="ml-4 mt-2" id={`chapter-${chapter.id}`}>
                  <div className="flex">
                    <div className="flex flex-col mr-4">
                      <Button onClick={() => toggleBranch(chapter.id)} className="mb-2">
                        {expandedBranches[chapter.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <Button onClick={() => startEdit(chapter)} className="mb-2">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => addLesson(course.id, chapter.id)} className="mb-2">
                        <PlusCircle className="h-4 w-4" /> Lesson
                      </Button>
                      <Button onClick={() => confirmDelete({ type: 'chapter', courseId: course.id, chapterId: chapter.id })} className="mb-2 bg-red-500 hover:bg-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <span>{chapter.ordinal}. {chapter.name}</span>
                      {expandedBranches[chapter.id] && chapter.lessons?.sort((a, b) => a.ordinal - b.ordinal).map(lesson => (
                        <div key={lesson.id} className="ml-4 mt-2" id={`lesson-${lesson.id}`}>
                          <div className="flex">
                            <div className="flex flex-col mr-4">
                              <Button onClick={() => toggleBranch(lesson.id)} className="mb-2">
                                {expandedBranches[lesson.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                              <Button onClick={() => startEdit(lesson)} className="mb-2">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => addHomework(course.id, chapter.id, lesson.id)} className="mb-2">
                                <PlusCircle className="h-4 w-4" /> Homework
                              </Button>
                              <Button onClick={() => confirmDelete({ type: 'lesson', courseId: course.id, chapterId: chapter.id, lessonId: lesson.id })} className="mb-2 bg-red-500 hover:bg-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div>
                              <span>{lesson.ordinal}. {lesson.name}</span>
                              <div className="ml-4">
                                <p>{lesson.description}</p>
                                {expandedBranches[lesson.id] && (
                                  <div>
                                    <h4>Homeworks:</h4>
                                    {Array.isArray(lesson.homeworks) && lesson.homeworks.map((hw) => (
                                      <div key={hw.id} id={`homework-${hw.id}`} className="ml-4 mt-2 p-4 border rounded shadow">
                                        <p>{hw.text}</p>
                                        {hw.files.map((file, fileIndex) => (
                                          <div key={fileIndex} className="flex items-center">
                                            <Button onClick={() => window.open(file, '_blank')} className="mr-2">View File</Button>
                                            <Button onClick={() => removeFileFromTree(course.id, chapter.id, lesson.id, hw.id, fileIndex)} className="bg-red-500 hover:bg-red-600">Delete File</Button>
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
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
  );

  const renderDeleteConfirmation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <div className="mb-4">Are you sure you want to delete this item?</div>
        <div className="flex justify-end">
          <Button onClick={handleDelete} className="mr-2 bg-red-500 hover:bg-red-600">Delete</Button>
          <Button onClick={() => setItemToDelete(null)}>Cancel</Button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {renderLibrary()}
      {editMode && renderEditForm()}
      {itemToDelete && renderDeleteConfirmation()}
    </div>
  );
};

export default Library;