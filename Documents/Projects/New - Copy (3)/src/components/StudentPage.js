import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { GlobalStateContext } from '../context/GlobalStateContext';
import 'chart.js/auto';
import '../styles/StudentPage.css';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import TablePage from '@/components/TablePage';
import StudentProgressBar from '@/components/ProgressBar/StudentProgressBar';
import TeacherRecommendations from '@/components/TeacherRecommendations';
import StudentProfile from './StudentProfile';
import StudentFeedback from '@/components/StudentFeedback';
import StudentWeeklySchedule from '@/components/StudentWeeklySchedule';
import { 
  BarChart2, 
  FileText, 
  List, 
  DollarSign, 
  BarChart, 
  Table, 
  MessageSquare, 
  ThumbsUp, 
  Calendar 
} from 'lucide-react';

const AdminProfileView = ({ studentId }) => {
  return <StudentProfile studentId={studentId} showSetPassword={true} showVisibility={true} />;
};

const currencies = ['USD', 'KES', 'RUB', 'EUR'];

const StudentPage = () => {
  const { students, transactions, setTransactions, exchangeRates } = useContext(GlobalStateContext);
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSubject, setSelectedSubject] = useState('English');
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [currency, setCurrency] = useState('USD');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [convertedTransactions, setConvertedTransactions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [showPayments, setShowPayments] = useState(false);
  const [showLessons, setShowLessons] = useState(false);

  // New state variables for toggle buttons
  const [showChartInfo, setShowChartInfo] = useState(false);
  const [showForms, setShowForms] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showTablePage, setShowTablePage] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);

  useEffect(() => {
    const foundStudent = students.find(s => s.id === id);
    setStudent(foundStudent);
    if (foundStudent) {
      setProgress(foundStudent.progress || 0);
    }
  }, [id, students]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (amount && date && student && currency) {
      setError(null);
      const newTransaction = { type: 'income', category: student.name, amount: parseFloat(amount), date, currency };
      try {
        const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
        const updatedTransactions = [...transactions, { id: docRef.id, ...newTransaction }];
        setTransactions(updatedTransactions);
        resetPaymentForm();
        setPopupMessage('Payment added successfully!');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      } catch (error) {
        setError("Error adding payment");
      }
    } else {
      setError("Please fill out all fields");
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (selectedSubject && student) {
      setError(null);
      const newLesson = { type: 'lesson', category: student.name, description: lessonDescription, date: lessonDate, subject: selectedSubject };
      try {
        const docRef = await addDoc(collection(db, 'transactions'), newLesson);
        const updatedTransactions = [...transactions, { id: docRef.id, ...newLesson }];
        setTransactions(updatedTransactions);
        resetLessonForm();
        setPopupMessage('Lesson added successfully!');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      } catch (error) {
        setError("Error adding lesson");
      }
    } else {
      setError("Please fill out all fields");
    }
  };

  const handleRemoveTransaction = async (id) => {
    setError(null);
    try {
      await deleteDoc(doc(db, 'transactions', id));
      setTransactions(transactions.filter(transaction => transaction.id !== id));
    } catch (error) {
      setError("Error removing transaction");
    }
  };

  const handleEditPayment = (id) => {
    const payment = transactions.find(transaction => transaction.id === id);
    if (payment) {
      setEditingPaymentId(id);
      setAmount(payment.amount);
      setDate(payment.date);
      setCurrency(payment.currency);
    } else {
      setError("Payment not found");
    }
  };

  const handleEditLesson = (id) => {
    const lesson = transactions.find(transaction => transaction.id === id);
    if (lesson) {
      setEditingLessonId(id);
      setLessonDescription(lesson.description);
      setLessonDate(lesson.date);
      setSelectedSubject(lesson.subject);
    } else {
      setError("Lesson not found");
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const transactionDoc = doc(db, 'transactions', editingPaymentId);
      await updateDoc(transactionDoc, { amount: parseFloat(amount), date, currency });
      setTransactions(transactions.map(transaction => transaction.id === editingPaymentId ? { ...transaction, amount: parseFloat(amount), date, currency } : transaction));
      resetPaymentForm();
      setPopupMessage('Payment updated successfully!');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      setError("Error updating payment");
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const transactionDoc = doc(db, 'transactions', editingLessonId);
      await updateDoc(transactionDoc, { description: lessonDescription, date: lessonDate, subject: selectedSubject });
      setTransactions(transactions.map(transaction => transaction.id === editingLessonId ? { ...transaction, description: lessonDescription, date: lessonDate, subject: selectedSubject } : transaction));
      resetLessonForm();
      setPopupMessage('Lesson updated successfully!');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      setError("Error updating lesson");
    }
  };

  const handleSaveProgress = async (newProgress) => {
    setError(null);
    try {
      const studentDoc = doc(db, 'students', id);
      await updateDoc(studentDoc, { progress: newProgress });
      setProgress(newProgress);
      setPopupMessage('Progress updated successfully!');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      setError("Error updating progress");
    }
  };

  const resetPaymentForm = () => {
    setEditingPaymentId(null);
    setAmount('');
    setDate('');
    setCurrency('USD');
  };

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setLessonDescription('');
    setLessonDate(new Date().toISOString().slice(0, 10));
    setSelectedSubject('English');
  };

  const convertToSelectedCurrency = (amount, currency) => {
    if (!exchangeRates[currency] || !exchangeRates[displayCurrency]) {
      console.error(`Missing exchange rate for ${currency} or ${displayCurrency}`);
      return 0;
    }
    const rate = exchangeRates[displayCurrency] / exchangeRates[currency];
    return amount * rate;
  };

  const convertTransactions = (transactions, toCurrency) => {
    const convertedTransactions = transactions.map(transaction => {
      const convertedAmount = convertToSelectedCurrency(transaction.amount, transaction.currency);
      return { ...transaction, amount: convertedAmount, currency: toCurrency };
    });
    return convertedTransactions;
  };

  useEffect(() => {
    const updateConvertedTransactions = () => {
      const converted = convertTransactions(transactions, displayCurrency);
      setConvertedTransactions(converted);
    };
    updateConvertedTransactions();
  }, [displayCurrency, transactions, exchangeRates]);

  if (!student) {
    return <div>Student not found</div>;
  }

  const filteredTransactions = convertedTransactions
    .filter(transaction => transaction.category === student.name)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const payments = filteredTransactions.filter(transaction => transaction.type === 'income');
  const lessons = filteredTransactions.filter(transaction => transaction.type === 'lesson');
  const englishLessons = lessons.filter(lesson => lesson.subject === 'English');
  const itLessons = lessons.filter(lesson => lesson.subject === 'IT');

  const totalPaidLessons = payments.reduce((sum, payment) => sum + (convertToSelectedCurrency(payment.amount, payment.currency) / convertToSelectedCurrency(student.price, student.currency)), 0);
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

  const displayedTransactions = filter === 'All' ? filteredTransactions :
    filter === 'Payments' ? payments : lessons;

  const ToggleButton = ({ icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md transition-all duration-300 ${
        isActive ? 'bg-black text-white' : 'bg-black text-black hover:bg-gray-700'
      }`}
    >
      <Icon size={24} className="mb-2" />
      <span className="text-sm text-center">{label}</span>
    </button>
  );

  return (
    <div className="student-page p-6">
      <div className="side-by-side-container mb-6">
        <AdminProfileView studentId={id} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <ToggleButton
          icon={BarChart2}
          label="Chart & Info"
          isActive={showChartInfo}
          onClick={() => setShowChartInfo(!showChartInfo)}
        />
        <ToggleButton
          icon={FileText}
          label="Forms"
          isActive={showForms}
          onClick={() => setShowForms(!showForms)}
        />
        
        <ToggleButton
          icon={DollarSign}
          label="Transactions"
          isActive={showTransactions}
          onClick={() => setShowTransactions(!showTransactions)}
        />
        <ToggleButton
          icon={BarChart}
          label="Progress Bar"
          isActive={showProgressBar}
          onClick={() => setShowProgressBar(!showProgressBar)}
        />
        <ToggleButton
          icon={Table}
          label="Table Page"
          isActive={showTablePage}
          onClick={() => setShowTablePage(!showTablePage)}
        />
        <ToggleButton
          icon={MessageSquare}
          label="Recommendations"
          isActive={showRecommendations}
          onClick={() => setShowRecommendations(!showRecommendations)}
        />
        <ToggleButton
          icon={ThumbsUp}
          label="Feedback"
          isActive={showFeedback}
          onClick={() => setShowFeedback(!showFeedback)}
        />
        <ToggleButton
          icon={Calendar}
          label="Weekly Schedule"
          isActive={showWeeklySchedule}
          onClick={() => setShowWeeklySchedule(!showWeeklySchedule)}
        />
      </div>

      {showChartInfo && (
        <div className="chart-info-container">
          <div className="student-info">
            <h2></h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">Стоимость одного урока</h3>
                
                <p className="text-lg">
                  {student.currency} {student.price.toFixed(2)}
                </p>
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
                <p className="text-2xl">{positiveRemainingLessons.toFixed(2)}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">Не оплаченные уроки</h3>
                <p className="text-2xl">{debtLessons.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="my-8">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
      {showPopup && <div className="popup">{popupMessage}</div>}

      {showForms && (
        <div className="forms-container">
          <form onSubmit={editingPaymentId ? handleUpdatePayment : handleAddPayment}>
            <h3>{editingPaymentId ? 'Edit Payment' : 'Add Payment'}</h3>
            <div>
              <label htmlFor="amount">Amount:</label>
              <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required>
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date">Date:</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <button type="submit" className="add-payment-button">{editingPaymentId ? 'Update Payment' : 'Add Payment'}</button>
            {editingPaymentId && <button type="button" onClick={resetPaymentForm} className="cancel-button">Cancel</button>}
          </form>
          <form onSubmit={editingLessonId ? handleUpdateLesson : handleAddLesson}>
            <h3>{editingLessonId ? 'Edit Lesson' : 'Add Lesson'}</h3>
            <div>
              <label htmlFor="lessonDescription">Lesson Description:</label>
              <input type="text" id="lessonDescription" value={lessonDescription} onChange={(e) => setLessonDescription(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lessonDate">Lesson Date:</label>
              <input type="date" id="lessonDate" value={lessonDate} onChange={(e) => setLessonDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="selectedSubject">Subject:</label>
              <select id="selectedSubject" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required>
                <option value="English">English</option>
                <option value="IT">IT</option>
              </select>
            </div>
            <button type="submit" className="add-lesson-button">{editingLessonId ? 'Update Lesson' : 'Add Lesson'}</button>
            {editingLessonId && <button type="button" onClick={resetLessonForm} className="cancel-button">Cancel</button>}
          </form>
        </div>
      )}

      {showDropdowns && (
        <div>
          <div className="dropdown">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All Transactions</option>
              <option value="Payments">Payments</option>
              <option value="Lessons">Completed Lessons</option>
            </select>
          </div>
          <div className="dropdown">
            <select value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value)}>
              {currencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {showTransactions && (
        <div className="transactions-container">
          <div className="transactions-list">
            <h3>Payments</h3>
            <button onClick={() => setShowPayments(!showPayments)}>
              {showPayments ? 'Hide Payments' : 'Show Payments'}
            </button>
            {showPayments && (
              <ul>
                {payments.map(transaction => (
                  <li key={transaction.id} className="transaction-item">
                    Payment of {transaction.amount.toFixed(2)} {transaction.currency} on {transaction.date}
                    <div className="button-group">
                      <button onClick={() => handleEditPayment(transaction.id)}>Edit</button>
                      <button onClick={() => handleRemoveTransaction(transaction.id)} className="remove-button">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="transactions-list completed-lessons">
            <h3>Completed Lessons</h3>
            <button onClick={() => setShowLessons(!showLessons)}>
              {showLessons ? 'Hide Lessons' : 'Show Lessons'}
            </button>
            {showLessons && (
              <>
                <div className="subject-list">
                  <h4>English</h4>
                  <ul>
                    {englishLessons.map(transaction => (
                      <li key={transaction.id} className="transaction-item">
                        {transaction.description} on {transaction.date}
                        <div className="button-group">
                          <button onClick={() => handleEditLesson(transaction.id)}>Edit</button>
                          <button onClick={() => handleRemoveTransaction(transaction.id)} className="remove-button">Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="subject-list">
                  <h4>IT</h4>
                  <ul>
                    {itLessons.map(transaction => (
                      <li key={transaction.id} className="transaction-item">
                        {transaction.description} on {transaction.date}
                        <div className="button-group">
                          <button onClick={() => handleEditLesson(transaction.id)}>Edit</button>
                          <button onClick={() => handleRemoveTransaction(transaction.id)} className="remove-button">Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showProgressBar && <StudentProgressBar studentId={id} />}

      {showTablePage && <TablePage readOnly={false} studentId={id} />}

      {showRecommendations && <TeacherRecommendations studentId={id} />}

      {showFeedback && <StudentFeedback studentId={id} />}

      {showWeeklySchedule && <StudentWeeklySchedule studentId={id} />}
    </div>
  );
};

export default StudentPage;