import React, { useState, useContext, useEffect } from 'react';
import { GlobalStateContext } from '@/context/GlobalStateContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Popover, { PopoverTrigger, PopoverContent } from '@/components/ui/Popover';
import Calendar from '@/components/ui/Calendar';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';

const TablePage = () => {
  const { courses: globalCourses, tableData: globalTableData, handleSaveTableData } = useContext(GlobalStateContext);
  const [courses, setCourses] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lessonProgress, setLessonProgress] = useState(0);
  const [selectedHomeworks, setSelectedHomeworks] = useState([]);
  const [expandedBranches, setExpandedBranches] = useState({});

  useEffect(() => {
    setCourses(globalCourses);
  }, [globalCourses]);

  useEffect(() => {
    const fetchTableData = async () => {
      const tableDataSnapshot = await getDocs(collection(db, 'tableData'));
      const fetchedTableData = tableDataSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTableData(fetchedTableData);
    };
    fetchTableData();
  }, []);

  const saveTableData = async (newTableData) => {
    setTableData(newTableData);
    await handleSaveTableData(newTableData);
  };

  const toggleBranch = (id) => {
    setExpandedBranches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCourseChange = (course) => {
    setSelectedCourse(course);
    setSelectedChapter(null);
    setSelectedLesson(null);
    setSelectedHomeworks([]);
    toggleBranch(course.id);
  };

  const handleChapterChange = (chapter) => {
    setSelectedChapter(chapter);
    setSelectedLesson(null);
    setSelectedHomeworks([]);
    toggleBranch(chapter.id);
  };

  const handleLessonChange = (lesson) => {
    setSelectedLesson(lesson);
    setSelectedHomeworks([]);
    toggleBranch(lesson.id);
  };

  const addTableEntry = async () => {
    const newEntry = {
      id: Date.now(),
      date: selectedDate,
      course: selectedCourse,
      chapter: selectedChapter,
      lesson: selectedLesson,
      progress: lessonProgress,
      homeworks: selectedHomeworks.map(hw => ({ ...hw, rating: 0 }))
    };
    const updatedTableData = [...tableData, newEntry];
    await saveTableData(updatedTableData);
    resetSelections();
  };

  const resetSelections = () => {
    setSelectedCourse(null);
    setSelectedChapter(null);
    setSelectedLesson(null);
    setSelectedDate(new Date());
    setLessonProgress(0);
    setSelectedHomeworks([]);
    setShowAddLesson(false);
    setExpandedBranches({});
  };

  const updateEntry = async (id, field, value) => {
    const updatedTableData = tableData.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    await saveTableData(updatedTableData);
  };

  const updateHomeworkRating = async (entryId, homeworkId, rating) => {
    const updatedTableData = tableData.map(entry =>
      entry.id === entryId ? {
        ...entry,
        homeworks: entry.homeworks.map(hw =>
          hw.id === homeworkId ? { ...hw, rating } : hw
        )
      } : entry
    );
    await saveTableData(updatedTableData);
  };

  const deleteEntry = async (id) => {
    const updatedTableData = tableData.filter(entry => entry.id !== id);
    await saveTableData(updatedTableData);
  };

  const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
  );

  const renderSelectionTree = () => (
    <div className="mb-4 border rounded p-4">
      {courses.sort((a, b) => a.ordinal - b.ordinal).map(course => (
        <div key={course.id} className="mb-2">
          <Button onClick={() => handleCourseChange(course)} className="flex items-center">
            {expandedBranches[course.id] ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            {course.name}
          </Button>
          {expandedBranches[course.id] && course.chapters?.sort((a, b) => a.ordinal - b.ordinal).map(chapter => (
            <div key={chapter.id} className="ml-4 mt-2">
              <Button onClick={() => handleChapterChange(chapter)} className="flex items-center">
                {expandedBranches[chapter.id] ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                {chapter.ordinal}. {chapter.name}
              </Button>
              {expandedBranches[chapter.id] && chapter.lessons?.sort((a, b) => a.ordinal - b.ordinal).map(lesson => (
                <div key={lesson.id} className="ml-4 mt-2">
                  <Button onClick={() => handleLessonChange(lesson)} className="flex items-center">
                    {expandedBranches[lesson.id] ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                    {lesson.ordinal}. {lesson.name}
                  </Button>
                  {expandedBranches[lesson.id] && (
                    <div className="ml-4 mt-2">
                      <h4>Homeworks:</h4>
                      {lesson.homeworks.map((hw) => (
                        <div key={hw.id} className="flex items-center mt-1">
                          <input
                            type="checkbox"
                            id={`hw-${hw.id}`}
                            checked={selectedHomeworks.some(selectedHw => selectedHw.id === hw.id)}
                            onChange={() => {
                              setSelectedHomeworks(prev => 
                                prev.some(selectedHw => selectedHw.id === hw.id)
                                  ? prev.filter(selectedHw => selectedHw.id !== hw.id)
                                  : [...prev, hw]
                              );
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`hw-${hw.id}`}>{hw.text}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lesson Progress Table</h1>
      <Button onClick={() => setShowAddLesson(true)} className="mb-4">
        Add Completed Lesson
      </Button>

      {showAddLesson && (
        <div className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">Add New Lesson</h2>
          {renderSelectionTree()}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">{format(selectedDate, 'PPP')}</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block mb-2">Lesson Progress (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={lessonProgress}
                onChange={(e) => setLessonProgress(parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={addTableEntry} className="mr-2">Add Entry</Button>
            <Button onClick={resetSelections}>Cancel</Button>
          </div>
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Date</th>
            <th className="border p-2">Course</th>
            <th className="border p-2">Chapter</th>
            <th className="border p-2">Lesson</th>
            <th className="border p-2">Progress</th>
            <th className="border p-2">Homeworks</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map(entry => (
            <tr key={entry.id}>
              <td className="border p-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">{format(entry.date, 'PPP')}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={entry.date}
                      onSelect={(date) => updateEntry(entry.id, 'date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </td>
              <td className="border p-2">{entry.course.name}</td>
              <td className="border p-2">{entry.chapter.name}</td>
              <td className="border p-2">{entry.lesson.name}</td>
              <td className="border p-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={entry.progress}
                  onChange={(e) => updateEntry(entry.id, 'progress', parseInt(e.target.value))}
                  className="w-20 mr-2"
                />
                <ProgressBar progress={entry.progress} />
              </td>
              <td className="border p-2">
                {entry.homeworks.map(hw => (
                  <div key={hw.id} className="mb-2">
                    <span>{hw.text}</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={hw.rating}
                      onChange={(e) => updateHomeworkRating(entry.id, hw.id, parseInt(e.target.value))}
                      className="w-20 ml-2"
                    />
                    <ProgressBar progress={hw.rating} />
                  </div>
                ))}
              </td>
              <td className="border p-2">
                <Button onClick={() => deleteEntry(entry.id)} className="bg-red-500 hover:bg-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablePage;