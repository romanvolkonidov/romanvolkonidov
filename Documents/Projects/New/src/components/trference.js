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

<CircularProgress studentId={id} progress={progress} onProgressChange={handleSaveProgress} />
<TablePage studentId={id} tableData={studentTableData} onSaveTableData={handleSaveTableData} />