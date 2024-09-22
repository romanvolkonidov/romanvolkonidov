import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { GlobalStateContext } from '../context/GlobalStateContext';
import 'chart.js/auto';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import CircularProgress from './ProgressBar/CircularProgress';
import KidsProgressTracker from './ProgressBar/KidsProgressTracker';
import TablePage from './TablePage'; // Adjust the path if necessary
import Button from '@/components/ui/Button';

const currencies = ['USD', 'KES', 'RUB', 'EUR'];

const StudentPage = () => {
  const { students, transactions, setTransactions, exchangeRates, tableData, setTableData } = useContext(GlobalStateContext);
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
  const [studentTableData, setStudentTableData] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      const foundStudent = students.find(s => s.id === id);
      setStudent(foundStudent);
      if (foundStudent) {
        setProgress(foundStudent.progress || 0);
        const tableDataDoc = await getDoc(doc(db, 'tableData', id));
        if (tableDataDoc.exists()) {
          setStudentTableData(tableDataDoc.data().data);
        } else {
          setStudentTableData([]);
        }
      }
    };
    fetchStudentData();
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

  const handleSaveTableData = async (newTableData) => {
    setError(null);
    try {
      const tableDataDoc = doc(db, 'tableData', id);
      await updateDoc(tableDataDoc, { data: newTableData });
      setTableData({ ...tableData, [id]: newTableData });
      setStudentTableData(newTableData);
      setPopupMessage('Table data updated successfully!');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      setError("Error updating table data");
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

  return (
    <div className="student-page p-4">
      <div className="chart-info-container">
        <div className="student-info">
          <h2 className="text-3xl font-bold text-indigo-600">{student.name}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">Price per Lesson</h3>
              <p className="text-2xl">{displayCurrency} {(convertToSelectedCurrency(student.price, student.currency)).toFixed(2)}</p>
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
        <div className="my-8">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {showPopup && <div className="popup bg-green-500 text-white p-2 rounded">{popupMessage}</div>}
      <div className="forms-container">
        <form onSubmit={editingPaymentId ? handleUpdatePayment : handleAddPayment} className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{editingPaymentId ? 'Edit Payment' : 'Add Payment'}</h3>
          <div className="mb-2">
            <label htmlFor="amount" className="block mb-1">Amount:</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required className="border p-2 rounded w-full" />
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required className="border p-2 rounded w-full mt-2">
              {currencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label htmlFor="date" className="block mb-1">Date:</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="border p-2 rounded w-full" />
          </div>
          <button type="submit" className="bg-indigo-500 text-white p-2 rounded">{editingPaymentId ? 'Update Payment' : 'Add Payment'}</button>
          {editingPaymentId && <button type="button" onClick={resetPaymentForm} className="bg-gray-500 text-white p-2 rounded ml-2">Cancel</button>}
        </form>
        <form onSubmit={editingLessonId ? handleUpdateLesson : handleAddLesson} className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{editingLessonId ? 'Edit Lesson' : 'Add Lesson'}</h3>
          <div className="mb-2">
            <label htmlFor="lessonDescription" className="block mb-1">Lesson Description:</label>
            <input type="text" id="lessonDescription" value={lessonDescription} onChange={(e) => setLessonDescription(e.target.value)} className="border p-2 rounded w-full" />
          </div>
          <div className="mb-2">
            <label htmlFor="lessonDate" className="block mb-1">Lesson Date:</label>
            <input type="date" id="lessonDate" value={lessonDate} onChange={(e) => setLessonDate(e.target.value)} required className="border p-2 rounded w-full" />
          </div>
          <div className="mb-2">
            <label htmlFor="selectedSubject" className="block mb-1">Subject:</label>
            <select id="selectedSubject" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required className="border p-2 rounded w-full">
              <option value="English">English</option>
              <option value="IT">IT</option>
            </select>
          </div>
          <button type="submit" className="bg-indigo-500 text-white p-2 rounded">{editingLessonId ? 'Update Lesson' : 'Add Lesson'}</button>
          {editingLessonId && <button type="button" onClick={resetLessonForm} className="bg-gray-500 text-white p-2 rounded ml-2">Cancel</button>}
        </form>
      </div>
      <div className="dropdown mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded w-full">
          <option value="All">All Transactions</option>
          <option value="Payments">Payments</option>
          <option value="Lessons">Completed Lessons</option>
        </select>
      </div>
      <div className="dropdown mb-4">
        <select value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value)} className="border p-2 rounded w-full">
          {currencies.map(curr => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>
      </div>
      <div className="transactions-container">
        <div className="transactions-list mb-4">
          <h3 className="text-xl font-semibold mb-2">Payments</h3>
          <ul>
            {payments.map(transaction => (
              <li key={transaction.id} className="transaction-item mb-2 p-2 border rounded">
                Payment of {transaction.amount.toFixed(2)} {transaction.currency} on {transaction.date}
                <div className="button-group mt-2">
                  <button onClick={() => handleEditPayment(transaction.id)} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</button>
                  <button onClick={() => handleRemoveTransaction(transaction.id)} className="bg-red-500 text-white p-2 rounded">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="transactions-list completed-lessons">
        <h3 className="text-xl font-semibold mb-2">Completed Lessons</h3>
          <div className="subject-list mb-4">
            <h4 className="text-lg font-semibold mb-2">English</h4>
            <ul>
              {englishLessons.map(transaction => (
                <li key={transaction.id} className="transaction-item mb-2 p-2 border rounded">
                  {transaction.description} on {transaction.date}
                  <div className="button-group mt-2">
                    <button onClick={() => handleEditLesson(transaction.id)} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</button>
                    <button onClick={() => handleRemoveTransaction(transaction.id)} className="bg-red-500 text-white p-2 rounded">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="subject-list">
            <h4 className="text-lg font-semibold mb-2">IT</h4>
            <ul>
              {itLessons.map(transaction => (
                <li key={transaction.id} className="transaction-item mb-2 p-2 border rounded">
                  {transaction.description} on {transaction.date}
                  <div className="button-group mt-2">
                    <button onClick={() => handleEditLesson(transaction.id)} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</button>
                    <button onClick={() => handleRemoveTransaction(transaction.id)} className="bg-red-500 text-white p-2 rounded">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <CircularProgress studentId={id} progress={progress} onProgressChange={handleSaveProgress} />
      <TablePage studentId={id} tableData={studentTableData} onSaveTableData={handleSaveTableData} />
    </div>
  );
}

export default StudentPage;