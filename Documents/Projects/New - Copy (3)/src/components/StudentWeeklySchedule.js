import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import '../styles/StudentWeeklySchedule.css';

const LessonCard = ({ lesson, onEdit, onDelete, viewOnly }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-black-600">{lesson.day}</span>
      <span className="text-gray-600">{lesson.time}</span>
    </div>
    <h3 className="text-lg font-semibold mb-1">{lesson.subject}</h3>
    {!viewOnly && (
      <div className="flex space-x-2">
        <button onClick={() => onEdit(lesson)} className="button bg-blue-500 hover:bg-blue-300 transition-colors">Edit</button>
        <button onClick={() => onDelete(lesson.id)} className="button bg-red-500 hover:bg-red-300 transition-colors">Delete</button>
      </div>
    )}
  </div>
);

const StudentWeeklySchedule = ({ customClass = '', viewOnly = false, studentId }) => {
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({
    day: '',
    time: '',
    subject: '',
  });
  const [editingLesson, setEditingLesson] = useState(null);

  const dayOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

  const sortLessons = (lessons) => {
    return lessons.sort((a, b) => {
      const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayComparison !== 0) return dayComparison;
      return a.time.localeCompare(b.time);
    });
  };

  useEffect(() => {
    const fetchLessons = async () => {
      const q = query(collection(db, 'weeklySchedule'), where('studentId', '==', studentId));
      const querySnapshot = await getDocs(q);
      const lessonsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(sortLessons(lessonsData));
    };

    fetchLessons();
  }, [studentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLesson({ ...newLesson, [name]: value });
  };

  const handleAddLesson = async () => {
    if (editingLesson) {
      const lessonRef = doc(db, 'weeklySchedule', editingLesson.id);
      await updateDoc(lessonRef, newLesson);
      setLessons(sortLessons(lessons.map(lesson => lesson.id === editingLesson.id ? { ...lesson, ...newLesson } : lesson)));
      setEditingLesson(null);
    } else {
      const lessonWithStudentId = { ...newLesson, studentId };
      try {
        const docRef = await addDoc(collection(db, 'weeklySchedule'), lessonWithStudentId);
        setLessons(sortLessons([...lessons, { id: docRef.id, ...lessonWithStudentId }]));
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    }
    setNewLesson({ day: '', time: '', subject: '' });
  };

  const handleEditLesson = (lesson) => {
    setNewLesson({ day: lesson.day, time: lesson.time, subject: lesson.subject });
    setEditingLesson(lesson);
  };

  const handleDeleteLesson = async (id) => {
    await deleteDoc(doc(db, 'weeklySchedule', id));
    setLessons(sortLessons(lessons.filter(lesson => lesson.id !== id)));
  };

  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${customClass}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="title">Расписание</h2>
        <Calendar className="icon-small text-black-500" />
      </div>
      <div className="space-y-4">
        {Array.isArray(lessons) && lessons.length > 0 ? (
          lessons.map((lesson, index) => (
            <LessonCard
              key={index}
              lesson={lesson}
              onEdit={handleEditLesson}
              onDelete={handleDeleteLesson}
              viewOnly={viewOnly}
            />
          ))
        ) : (
          <p>No lessons available</p>
        )}
      </div>
      {!viewOnly && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-gray-600">День</label>
              <select
                name="day"
                value={newLesson.day}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">Выберите день</option>
                {dayOrder.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600">Время</label>
              <input
                type="time"
                name="time"
                value={newLesson.time}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-gray-600">Урок</label>
              <input
                type="text"
                name="subject"
                value={newLesson.subject}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <button
              onClick={handleAddLesson}
              className="button bg-black-500 hover:bg-black-300 transition-colors"
            >
              {editingLesson ? 'Update Lesson' : 'Add Lesson'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentWeeklySchedule;