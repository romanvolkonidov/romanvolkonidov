import React, { useContext, useEffect, useState, useRef } from 'react';
import { PlusCircle, Edit2, ChevronDown, ChevronRight, Trash2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { GlobalStateContext } from '@/context/GlobalStateContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const TablePage = ({ studentId, tableData, onSaveTableData }) => {
  const { courses, addCourse, updateCourse, deleteCourse, loading, error } = useContext(GlobalStateContext);

  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [expandedBranches, setExpandedBranches] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedLessons, setSelectedLessons] = useState(() => JSON.parse(localStorage.getItem(`selectedLessons_${studentId}`)) || []);
  const [selectedHomeworks, setSelectedHomeworks] = useState(() => JSON.parse(localStorage.getItem(`selectedHomeworks_${studentId}`)) || {});
  const [localTableData, setLocalTableData] = useState(() => JSON.parse(localStorage.getItem(`tableData_${studentId}`)) || tableData);
  const newItemRef = useRef(null);
  
  

  useEffect(() => {
    if (newItemRef.current) {
      newItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(`selectedLessons_${studentId}`, JSON.stringify(selectedLessons));
  }, [selectedLessons]);

  useEffect(() => {
    localStorage.setItem(`selectedHomeworks_${studentId}`, JSON.stringify(selectedHomeworks));
  }, [selectedHomeworks]);

  useEffect(() => {
    const fetchTableData = async () => {
      const tableDataDoc = await getDoc(doc(db, 'tableData', studentId));
      if (tableDataDoc.exists()) {
        setLocalTableData(tableDataDoc.data().data);
      } else {
        setLocalTableData([]);
      }
    };
    fetchTableData();
  }, [studentId]);

  const handleSave = async () => {
    try {
      const tableDataDoc = doc(db, 'tableData', studentId);
      await updateDoc(tableDataDoc, { data: localTableData });
      onSaveTableData(localTableData);
    } catch (error) {
      console.error("Error updating table data", error);
    }
  };

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

  const handleLessonCheck = (courseId, chapterId, lessonId) => {
    setSelectedLessons(prev => {
      const isAlreadySelected = prev.some(item => 
        item.courseId === courseId && 
        item.chapterId === chapterId && 
        item.lessonId === lessonId
      );

      if (isAlreadySelected) {
        return prev.filter(item => 
          !(item.courseId === courseId && 
            item.chapterId === chapterId && 
            item.lessonId === lessonId)
        );
      } else {
        return [...prev, { courseId, chapterId, lessonId }];
      }
    });
  };

  const handleHomeworkCheck = (lessonId, homeworkId, isChecked) => {
    setSelectedHomeworks(prev => ({
      ...prev,
      [lessonId]: {
        ...(prev[lessonId] || {}),
        [homeworkId]: isChecked
      }
    }));
  };

  const handleHomeworkResultFileChange = (lessonId, homeworkId, e) => {
    const { files } = e.target;
    uploadFilesToFirebase(Array.from(files)).then(fileUrls => {
      setSelectedHomeworks(prev => ({
        ...prev,
        [lessonId]: {
          ...(prev[lessonId] || {}),
          [homeworkId]: { ...prev[lessonId][homeworkId], resultFiles: fileUrls }
        }
      }));
    });
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
                              <Button 
                                onClick={() => handleLessonCheck(course.id, chapter.id, lesson.id)} 
                                className={`mb-2 ${selectedLessons.some(item => 
                                  item.courseId === course.id && 
                                  item.chapterId === chapter.id && 
                                  item.lessonId === lesson.id
                                ) ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}`}
                              >
                                <CheckSquare className="h-4 w-4" />
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
                                        <div className="flex items-center mb-2">
                                          <Checkbox
                                            id={`homework-checkbox-${hw.id}`}
                                            checked={selectedHomeworks[lesson.id]?.[hw.id] || false}
                                            onChange={(e) => handleHomeworkCheck(lesson.id, hw.id, e.target.checked)}
                                          />
                                          <label htmlFor={`homework-checkbox-${hw.id}`} className="ml-2">
                                            {hw.text}
                                          </label>
                                        </div>
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

// Function to handle file input change for handing in homework
const handleHandInHomeworkFileChange = (lessonId, homeworkId, event, fileType) => {
  const newFiles = Array.from(event.target.files);
  setSelectedHomeworks(prevSelectedHomeworks => {
    const existingFiles = prevSelectedHomeworks[lessonId]?.[homeworkId]?.[fileType] || [];
    return {
      ...prevSelectedHomeworks,
      [lessonId]: {
        ...prevSelectedHomeworks[lessonId],
        [homeworkId]: {
          ...prevSelectedHomeworks[lessonId][homeworkId],
          [fileType]: [...existingFiles, ...newFiles]
        }
      }
    };
  });
};

// Example usage in renderTable function
// Function to handle file deletion
// Function to handle file deletion


// Modified renderFileLinks function
// Function to handle progress change
const handleProgressChange = (lessonId, event) => {
  const newProgress = event.target.value;
  setSelectedLessons(prevSelectedLessons => prevSelectedLessons.map(lesson => 
    lesson.lessonId === lessonId ? { ...lesson, progress: newProgress } : lesson
  ));
};

// Example usage in renderTable function
const renderTable = () => {
  // Sort selected lessons by date, latest on top
  const sortedLessons = [...selectedLessons].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 mt-4">
        <thead>
          <tr>
            <th className="border-b p-2">Дата</th>
            <th className="border-b p-2">Курс</th>
            <th className="border-b p-2">Тема</th>
            <th className="border-b p-2">Урок</th>
            <th className="border-b p-2">Урок закончен на %</th>
            <th className="border-b p-2">Домашняя работа</th>
            <th className="border-b p-2">Сдать домашнюю работу</th>
            <th className="border-b p-2">Результаты домашней работы 0-100</th>
            <th className="border-b p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedLessons.map((selectedLesson, index) => {
            const course = courses.find(c => c.id === selectedLesson.courseId);
            const chapter = course?.chapters.find(ch => ch.id === selectedLesson.chapterId);
            const lesson = chapter?.lessons.find(l => l.id === selectedLesson.lessonId);

            if (!course || !chapter || !lesson) {
              return null; // Skip rendering if any of the objects are undefined
            }

            const selectedHomeworksForLesson = lesson.homeworks?.filter(hw => selectedHomeworks[lesson.id]?.[hw.id]);

            return (
              <tr key={index}>
                <td className="border-b p-2">
                  <input
                    type="date"
                    value={selectedLesson.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange(selectedLesson.lessonId, e)}
                    className="p-2 border w-full"
                  />
                </td>
                <td className="border-b p-2">{course.name}</td>
                <td className="border-b p-2">{chapter.name}</td>
                <td className="border-b p-2">{lesson.name}</td>
                <td className="border-b p-2">
                  <input
                    type="number"
                    value={selectedLesson.progress || 0}
                    onChange={(e) => handleProgressChange(selectedLesson.lessonId, e)}
                    className="p-2 border w-full mb-2"
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedLesson.progress || 0}%` }}></div>
                  </div>
                </td>
                <td className="border-b p-2">
                  {selectedHomeworksForLesson?.map(hw => (
                    <div key={hw.id}>
                      {hw.text && <p>{hw.text}</p>}
                      {renderFileLinks(hw.files, 'File', lesson.id, hw.id, 'files')}
                    </div>
                  ))}
                </td>
                <td className="border-b p-2">
                  {selectedHomeworksForLesson?.map(hw => (
                    <div key={hw.id}>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleHandInHomeworkFileChange(lesson.id, hw.id, e, 'handInFiles')}
                        className="mb-2 p-2 border w-full"
                      />
                      {renderFileLinks(selectedHomeworks[lesson.id]?.[hw.id]?.handInFiles || [], 'Hand In File', lesson.id, hw.id, 'handInFiles')}
                    </div>
                  ))}
                </td>
                <td className="border-b p-2">
                  {selectedHomeworksForLesson?.map(hw => (
                    <div key={hw.id}>
                      <input
                        type="number"
                        value={selectedHomeworks[lesson.id]?.[hw.id]?.result || 0}
                        onChange={(e) => handleHomeworkResultChange(lesson.id, hw.id, e)}
                        className="mb-2 p-2 border w-full"
                      />
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${selectedHomeworks[lesson.id]?.[hw.id]?.result || 0}%` }}></div>
                      </div>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleHandInHomeworkFileChange(lesson.id, hw.id, e, 'resultFiles')}
                        className="mb-2 p-2 border w-full"
                      />
                      {renderFileLinks(selectedHomeworks[lesson.id]?.[hw.id]?.resultFiles || [], 'Result File', lesson.id, hw.id, 'resultFiles')}
                    </div>
                  ))}
                </td>
                <td className="border-b p-2">
                  <Button onClick={() => handleLessonUncheck(course.id, chapter.id, lesson.id)} className="bg-yellow-500 hover:bg-yellow-600">Uncheck</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const handleDateChange = (lessonId, event) => {
  const newDate = event.target.value;
  setSelectedLessons(prevSelectedLessons => prevSelectedLessons.map(lesson => 
    lesson.lessonId === lessonId ? { ...lesson, date: newDate } : lesson
  ));
};

// Function to handle file deletion
const handleDeleteFile = (lessonId, homeworkId, fileIndex, fileType) => {
  setSelectedHomeworks(prevSelectedHomeworks => {
    const updatedFiles = prevSelectedHomeworks[lessonId][homeworkId][fileType].filter((_, index) => index !== fileIndex);
    return {
      ...prevSelectedHomeworks,
      [lessonId]: {
        ...prevSelectedHomeworks[lessonId],
        [homeworkId]: {
          ...prevSelectedHomeworks[lessonId][homeworkId],
          [fileType]: updatedFiles
        }
      }
    };
  });
};

// Modified renderFileLinks function
const renderFileLinks = (files, prefix, lessonId, homeworkId, fileType) => (
  <div className="flex flex-wrap gap-2">
    {files.map((file, index) => (
      <div key={index} className="flex items-center">
        <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {prefix} {index + 1}
        </a>
        <button onClick={() => handleDeleteFile(lessonId, homeworkId, index, fileType)} className="ml-2 text-red-500 hover:text-red-700">
          &times;
        </button>
      </div>
    ))}
  </div>
);

// Function to handle unchecking a lesson
const handleLessonUncheck = (courseId, chapterId, lessonId) => {
  setSelectedLessons(prevSelectedLessons => prevSelectedLessons.filter(
    item => !(item.courseId === courseId && item.chapterId === chapterId && item.lessonId === lessonId)
  ));
};

const handleHomeworkResultChange = (lessonId, homeworkId, event) => {
  const newResult = event.target.value;
  setSelectedHomeworks(prevSelectedHomeworks => ({
    ...prevSelectedHomeworks,
    [lessonId]: {
      ...prevSelectedHomeworks[lessonId],
      [homeworkId]: {
        ...prevSelectedHomeworks[lessonId][homeworkId],
        result: newResult
      }
    }
  }));
};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {renderLibrary()}
      {editMode && renderEditForm()}
      {itemToDelete && renderDeleteConfirmation()}
      {renderTable()}
      <Button onClick={handleSave} className="mt-4">Save Table Data</Button>
    </div>
  );
};

export default TablePage;