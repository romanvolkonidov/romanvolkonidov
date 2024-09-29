import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import '../styles/StudentWeeklySchedule.css';

const LessonCard = ({ day, time, subject }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-black-600">{day}</span>
      <span className="text-gray-600">{time}</span>
    </div>
    <h3 className="text-lg font-semibold mb-1">{subject}</h3>
  </div>
);

const StudentWeeklySchedule = ({ customClass = '', viewOnly = false, studentId }) => {
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({
    day: '',
    time: '',
    subject: '',
  });

  useEffect(() => {
    const fetchLessons = async () => {
      const q = query(collection(db, 'weeklySchedule'), where('studentId', '==', studentId));
      const querySnapshot = await getDocs(q);
      const lessonsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(lessonsData);
    };

    fetchLessons();
  }, [studentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLesson({ ...newLesson, [name]: value });
  };

  const handleAddLesson = async () => {
    const lessonWithStudentId = { ...newLesson, studentId };
    try {
      const docRef = await addDoc(collection(db, 'weeklySchedule'), lessonWithStudentId);
      setLessons([...lessons, { id: docRef.id, ...lessonWithStudentId }]);
      setNewLesson({ day: '', time: '', subject: '' });
    } catch (e) {
      console.error('Error adding document: ', e);
    }
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
              day={lesson.day}
              time={lesson.time}
              subject={lesson.subject}
            />
          ))
        ) : (
          <p>No lessons available</p>
        )}
      </div>
      {!viewOnly && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Add New Lesson</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-gray-600">День</label>
              <input
                type="text"
                name="day"
                value={newLesson.day}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-gray-600">Время</label>
              <input
                type="text"
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
              Add Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentWeeklySchedule;