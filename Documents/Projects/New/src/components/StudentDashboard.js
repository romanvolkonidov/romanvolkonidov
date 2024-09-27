import React, { useState, useEffect, useContext } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/StudentDashboard.css';
import StudentProgressBar from './ProgressBar/StudentProgressBar';
import KidsProgressTracker from './ProgressBar/KidsProgressTracker';
import TablePage from './TablePage'; // Import TablePage component
import TeacherRecommendations from '@/components/TeacherRecommendations';
import StudentProfile from '@/components/StudentProfile';
import StudentFeedback from '@/components/StudentFeedback';

const currencies = ['USD', 'KES', 'RUB', 'EUR'];

const StudentDashboard = () => {
  const { students, transactions, setTransactions, exchangeRates } = useContext(GlobalStateContext);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (selectedStudentId) {
      const foundStudent = students.find(s => s.id === selectedStudentId);
      setSelectedStudent(foundStudent);
      if (foundStudent) {
        setProgress(foundStudent.progress || 0);
      }
    }
  }, [selectedStudentId, students]);

  const convertToSelectedCurrency = (amount, currency) => {
    if (!exchangeRates[currency] || !exchangeRates['USD']) {
      console.error(`Missing exchange rate for ${currency} or USD`);
      return 0;
    }
    const rate = exchangeRates['USD'] / exchangeRates[currency];
    return amount * rate;
  };

  if (!selectedStudent) {
    return (
      <div className="max-w-5xl mx-auto p-5 font-sans text-gray-800">
        <h2 className="text-center text-blue-500 mb-5 text-2xl font-bold">Select a Student</h2>
        <ul className="space-y-4">
          {students.map(student => (
            <li key={student.id} className="bg-gray-100 border border-gray-300 rounded p-3 mb-3 relative">
              <button
                onClick={() => setSelectedStudentId(student.id)}
                className="text-lg font-medium text-indigo-600 hover:underline"
              >
                {student.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const filteredTransactions = transactions
    .filter(transaction => transaction.category === selectedStudent.name)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const payments = filteredTransactions.filter(transaction => transaction.type === 'income');
  const lessons = filteredTransactions.filter(transaction => transaction.type === 'lesson');

  const totalPaidLessons = payments.reduce((sum, payment) => sum + (convertToSelectedCurrency(payment.amount, payment.currency) / convertToSelectedCurrency(selectedStudent.price, selectedStudent.currency)), 0);
  const completedLessons = lessons.length;
  const remainingLessons = totalPaidLessons - completedLessons;
  const debtLessons = remainingLessons < 0 ? Math.abs(remainingLessons) : 0;
  const positiveRemainingLessons = remainingLessons > 0 ? remainingLessons : 0;

  const barData = {
    labels: ['Lessons'],
    datasets: [
      ...(debtLessons === 0 ? [{
        label: 'Remaining Lessons',
        data: [positiveRemainingLessons],
        backgroundColor: '#4caf50',
      }] : []),
      ...(debtLessons > 0 ? [{
        label: 'Debt Lessons',
        data: [debtLessons],
        backgroundColor: '#f44336',
      }] : []),
    ],
  };

  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="student-page">
      <StudentProfile />

      <div className="chart-info-container">
        <div className="student-info-bar-container">
          <div className="student-info">
            <h2>{selectedStudent.name}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">Price per Lesson</h3>
                <p className="text-2xl">USD {(convertToSelectedCurrency(selectedStudent.price, selectedStudent.currency)).toFixed(2)}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">Lessons Purchased</h3>
                <p className="text-2xl">{totalPaidLessons.toFixed(2)}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">Lessons Completed</h3>
                <p className="text-2xl">{completedLessons}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">Remaining Lessons</h3>
                <p className="text-2xl">{positiveRemainingLessons}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">Debt Lessons</h3>
                <p className="text-2xl">{debtLessons}</p>
              </div>
            </div>
          </div>
          <div className="bar-chart">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
      <StudentProgressBar studentId={selectedStudentId} viewOnly={true} />
      <TablePage studentId={selectedStudentId} readOnly={true} className="table-left" />
      <TeacherRecommendations studentId={selectedStudentId} isViewOnly={true} />
      <StudentFeedback studentId={selectedStudentId} />
    </div>
  );
}

export default StudentDashboard;