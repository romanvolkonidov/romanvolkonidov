import React, { useContext, useRef, useState } from 'react';
import { PlusCircle, Edit2, ChevronDown, ChevronRight, Trash2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { GlobalStateContext } from '@/context/GlobalStateContext';

const Library = ({ onEdit, onDelete, onAddChapter, onAddLesson, onAddHomework, onToggleBranch, expandedBranches, selectedLessons, handleLessonCheck }) => {
  const { courses } = useContext(GlobalStateContext);
  const newItemRef = useRef(null);

  const expandBranch = (id) => {
    onToggleBranch(id);
  };

  return (
    <div>
      {courses.sort((a, b) => a.ordinal - b.ordinal).map(course => (
        <div key={course.id} className="mb-4">
          <div className="flex">
            <div className="flex flex-col mr-4">
              <Button onClick={() => onToggleBranch(course.id)} className="mb-2">
                {expandedBranches[course.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <Button onClick={() => onEdit(course)} className="mb-2">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button onClick={() => onAddChapter(course.id)} className="mb-2">
                <PlusCircle className="h-4 w-4" /> Chapter
              </Button>
              <Button onClick={() => onDelete({ type: 'course', courseId: course.id })} className="mb-2 bg-red-500 hover:bg-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <span className="font-bold">{course.name}</span>
              {expandedBranches[course.id] && course.chapters?.sort((a, b) => a.ordinal - b.ordinal).map(chapter => (
                <div key={chapter.id} className="ml-4 mt-2" id={`chapter-${chapter.id}`}>
                  <div className="flex">
                    <div className="flex flex-col mr-4">
                      <Button onClick={() => onToggleBranch(chapter.id)} className="mb-2">
                        {expandedBranches[chapter.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <Button onClick={() => onEdit(chapter)} className="mb-2">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => onAddLesson(course.id, chapter.id)} className="mb-2">
                        <PlusCircle className="h-4 w-4" /> Lesson
                      </Button>
                      <Button onClick={() => onDelete({ type: 'chapter', courseId: course.id, chapterId: chapter.id })} className="mb-2 bg-red-500 hover:bg-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <span>{chapter.ordinal}. {chapter.name}</span>
                      {expandedBranches[chapter.id] && chapter.lessons?.sort((a, b) => a.ordinal - b.ordinal).map(lesson => (
                        <div key={lesson.id} className="ml-4 mt-2" id={`lesson-${lesson.id}`}>
                          <div className="flex">
                            <div className="flex flex-col mr-4">
                              <Button onClick={() => onToggleBranch(lesson.id)} className="mb-2">
                                {expandedBranches[lesson.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                              <Button onClick={() => onEdit(lesson)} className="mb-2">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => onAddHomework(course.id, chapter.id, lesson.id)} className="mb-2">
                                <PlusCircle className="h-4 w-4" /> Homework
                              </Button>
                              <Button onClick={() => onDelete({ type: 'lesson', courseId: course.id, chapterId: chapter.id, lessonId: lesson.id })} className="mb-2 bg-red-500 hover:bg-red-600">
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
                                            checked={selectedLessons[lesson.id]?.[hw.id] || false}
                                            onChange={(e) => handleLessonCheck(lesson.id, hw.id, e.target.checked)}
                                          />
                                          <label htmlFor={`homework-checkbox-${hw.id}`} className="ml-2">
                                            {hw.text}
                                          </label>
                                        </div>
                                        {hw.files.map((file, fileIndex) => (
                                          <div key={fileIndex} className="flex items-center">
                                            <Button onClick={() => window.open(file, '_blank')} className="mr-2">View File</Button>
                                            <Button onClick={() => onDelete({ type: 'file', courseId: course.id, chapterId: chapter.id, lessonId: lesson.id, homeworkId: hw.id, fileIndex })} className="bg-red-500 hover:bg-red-600">Delete File</Button>
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
};

export default Library;