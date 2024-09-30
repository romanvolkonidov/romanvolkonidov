import React, { useState, useEffect, useContext } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { VisibilityContext } from '../context/VisibilityContext'; // Import the VisibilityContext
import { useNavigate, useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/StudentDashboard.css';
import StudentProgressBar from './ProgressBar/StudentProgressBar';
import TablePage from './TablePage'; // Import TablePage component
import TeacherRecommendations from '@/components/TeacherRecommendations';
import StudentProfile from '@/components/StudentProfile';
import StudentFeedback from '@/components/StudentFeedback';
import StudentWeeklySchedule from '@/components/StudentWeeklySchedule';


const currencies = ['USD', 'KES', 'RUB', 'EUR'];

const StudentDashboard = () => {
  const { students, transactions, exchangeRates, authenticatedStudent } = useContext(GlobalStateContext);
  const { isFinancialSectionVisible } = useContext(VisibilityContext); // Consume the VisibilityContext
  const { id } = useParams(); // Get the student ID from the URL
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showFinancialSection, setShowFinancialSection] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticatedStudent) {
      navigate('/login');
    }
  }, [authenticatedStudent, navigate]);

  useEffect(() => {
    if (id) {
      const foundStudent = students.find(s => s.id === id);
      setSelectedStudent(foundStudent);
      if (foundStudent) {
        setProgress(foundStudent.progress || 0);
      }
    }
  }, [id, students]);

  const convertToSelectedCurrency = (amount, currency) => {
    if (!exchangeRates[currency] || !exchangeRates['USD']) {
      console.error(`Missing exchange rate for ${currency} or USD`);
      return 0;
    }
    const rate = exchangeRates['USD'] / exchangeRates[currency];
    return amount * rate;
  };

  if (!selectedStudent) {
    return <div>Loading...</div>;
  }

  const filteredTransactions = transactions
    .filter(transaction => transaction.category === selectedStudent?.name)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const payments = filteredTransactions.filter(transaction => transaction.type === 'income');
  const lessons = filteredTransactions.filter(transaction => transaction.type === 'lesson');

  const totalPaidLessons = payments.reduce((sum, payment) => sum + (convertToSelectedCurrency(payment.amount, payment.currency) / convertToSelectedCurrency(selectedStudent?.price, selectedStudent?.currency)), 0);
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
      <StudentProfile studentId={id} />
      
      {isFinancialSectionVisible && (
        <div>
          <button onClick={() => setShowFinancialSection(!showFinancialSection)}>
            Баланс
          </button>
          {showFinancialSection && (
            <div>
              <div className="chart-info-container">
                <div className="student-info-bar-container">
                  <div className="student-info">
                    <h2></h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold">Стоимость одного урока</h3>
                        <p className="text-2xl">USD {(convertToSelectedCurrency(selectedStudent.price, selectedStudent.currency)).toFixed(2)}</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold">Оплаченные уроки</h3>
                        <p className="text-2xl">{totalPaidLessons.toFixed(2)}</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold">Пройденные уроки</h3>
                        <p className="text-2xl">{completedLessons}</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold">Осталось уроков</h3>
                        <p className="text-2xl">{positiveRemainingLessons}</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold">Не оплаченные уроки</h3>
                        <p className="text-2xl">{debtLessons}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bar-chart">
                <Bar data={barData} options={barOptions} />
              </div>
              
            </div>
          )}
        </div>
      )}
      <StudentProgressBar studentId={id} viewOnly={true} />
      <TablePage studentId={id} readOnly={true} className="table-left" />
      <div className="side-by-side-container">
      <StudentWeeklySchedule viewOnly={true} studentId={id} />

        <TeacherRecommendations isViewOnly={true} studentId={id} />
        <StudentFeedback studentId={id} />

      
      </div>
   
    </div>
  );
}

export default StudentDashboard;