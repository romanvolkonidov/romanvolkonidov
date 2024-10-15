import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import '../styles/StudentWeeklySchedule.css';

const LessonCard = ({ lesson, onEdit, onDelete, viewOnly }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-black">{lesson.day}</span>
      <span className="text-black">{lesson.time}</span>
    </div>
    <h3 className="text-lg font-semibold mb-1 text-black">{lesson.subject}</h3>
    {!viewOnly && (
      <div className="flex space-x-2">
        <button onClick={() => onEdit(lesson)} className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors">Edit</button>
        <button onClick={() => onDelete(lesson.id)} className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors">Delete</button>
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
    <div className={`bg-white p-6 rounded-lg shadow-md ${customClass}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Расписание</h2>
        <Calendar className="text-black" size={24} />
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
          <p className="text-black">No lessons available</p>
        )}
      </div>
      {!viewOnly && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-4 text-black">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-black mb-1">День</label>
              <select
                name="day"
                value={newLesson.day}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black text-black"
              >
                <option value="">Выберите день</option>
                {dayOrder.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black mb-1">Время</label>
              <input
                type="time"
                name="time"
                value={newLesson.time}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black text-black"
              />
            </div>
            <div>
              <label className="block text-black mb-1">Урок</label>
              <input
                type="text"
                name="subject"
                value={newLesson.subject}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black text-black"
              />
            </div>
            <button
              onClick={handleAddLesson}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
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