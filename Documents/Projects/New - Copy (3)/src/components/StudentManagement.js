import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import 'tailwindcss/tailwind.css';

const currencies = ['USD', 'RUB', 'EUR', 'KES', 'respective'];

const StudentManagement = () => {
  const { students = [], setStudents, transactions = [], setTransactions, exchangeRates = {} } = useContext(GlobalStateContext);
  const [studentName, setStudentName] = useState('');
  const [subjects, setSubjects] = useState({ English: false, IT: false });
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('respective');
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = useRef(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, 'students'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const updatedItems = items.map(item => {
          if (!item.currency) {
            item.currency = 'USD';
            updateDoc(doc(db, 'students', item.id), { currency: 'USD' });
          }
          return item;
        });
        setStudents(updatedItems.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        setError("Error fetching student data");
        console.error("Error fetching Firestore data: ", error.message, error.stack);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setStudents]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const newStudent = {
      name: studentName || '',
      subjects: subjects || { English: false, IT: false },
      price: parseFloat(price) || 0,
      currency: currency || 'USD',
    };
    try {
      const docRef = await addDoc(collection(db, 'students'), newStudent);
      setStudents([...students, { id: docRef.id, ...newStudent }].sort((a, b) => a.name.localeCompare(b.name)));
      setStudentName('');
      setSubjects({ English: false, IT: false });
      setPrice('');
      setCurrency('USD');
    } catch (error) {
      setError("Error adding student");
      console.error("Error adding document: ", error.message, error.stack);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'students', id));
      const updatedStudents = students.filter(student => student.id !== id);
      setStudents(updatedStudents);

      const studentName = students.find(s => s.id === id)?.name;
      const updatedTransactions = transactions.map(transaction => 
        transaction.category === studentName 
          ? { ...transaction, studentRemoved: true }
          : transaction
      );
      
      // Update transactions in Firestore
      for (let transaction of updatedTransactions) {
        if (transaction.studentRemoved) {
          await updateDoc(doc(db, 'transactions', transaction.id), { studentRemoved: true });
        }
      }
      
      setTransactions(updatedTransactions);
    } catch (error) {
      setError("Error removing student");
      console.error("Error removing document: ", error.message, error.stack);
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
      setStudentToDelete(null);
    }
  };

  const handleSubjectChange = (subject) => {
    setSubjects(prevSubjects => ({
      ...prevSubjects,
      [subject]: !prevSubjects[subject],
    }));
  };

  const handleEditStudent = (student) => {
    setEditingStudentId(student.id);
    setStudentName(student.name);
    setSubjects(student.subjects);
    setPrice(student.price);
    setCurrency(student.currency || 'USD');
    formRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const studentDoc = doc(db, 'students', editingStudentId);
      await updateDoc(studentDoc, {
        name: studentName || '',
        subjects: subjects || { English: false, IT: false },
        price: parseFloat(price) || 0,
        currency: currency || 'USD',
      });
      const updatedStudents = students.map(student =>
        student.id === editingStudentId
          ? { ...student, name: studentName, subjects: subjects, price: parseFloat(price), currency: currency }
          : student
      ).sort((a, b) => a.name.localeCompare(b.name));
      setStudents(updatedStudents);
      setEditingStudentId(null);
      setStudentName('');
      setSubjects({ English: false, IT: false });
      setPrice('');
      setCurrency('USD');
    } catch (error) {
      setError("Error updating student");
      console.error("Error updating document: ", error.message, error.stack);
    } finally {
      setLoading(false);
    }
  };

  const convertToSelectedCurrency = (amount, currency) => {
    if (selectedCurrency === 'respective') {
      return amount;
    }
    if (!exchangeRates[currency]) {
      console.error(`Missing exchange rate for ${currency}`);
      return amount;
    }
    if (!exchangeRates[selectedCurrency]) {
      console.error(`Missing exchange rate for ${selectedCurrency}`);
      return amount;
    }
    const rate = exchangeRates[selectedCurrency] / exchangeRates[currency];
    return amount * rate;
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      handleRemoveStudent(studentToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setStudentToDelete(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-5 font-sans text-black">
      <h2 className="text-center text-black mb-5 text-2xl font-bold">Student Management</h2>
      <form ref={formRef} onSubmit={editingStudentId ? handleUpdateStudent : handleAddStudent} className="space-y-4">
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-black">Student Name</label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Subjects</label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="english"
                name="English"
                checked={subjects.English}
                onChange={() => handleSubjectChange('English')}
                className="h-4 w-4 text-black border-gray-300 rounded"
              />
              <label htmlFor="english" className="ml-2 block text-sm text-black">English</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="it"
                name="IT"
                checked={subjects.IT}
                onChange={() => handleSubjectChange('IT')}
                className="h-4 w-4 text-black border-gray-300 rounded"
              />
              <label htmlFor="it" className="ml-2 block text-sm text-black">IT</label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-black">Price</label>
          <div className="flex space-x-2">
            <input
              type="number"
              id="price"
              name="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm text-black"
            />
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm text-black"
            >
              {currencies.filter(curr => curr !== 'respective').map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
        </div>
          
        <div className="flex space-x-2">
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
            {editingStudentId ? 'Update Student' : 'Add Student'}
          </button>
          {editingStudentId && (
            <button type="button" onClick={() => setEditingStudentId(null)} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p className="text-black">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-black">Student List</h3>
        <div className="mb-4">
          <label htmlFor="selectedCurrency" className="block text-sm font-medium text-black">Display Currency:</label>
          <select
            id="selectedCurrency"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm text-black"
          >
            {currencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="searchTerm" className="block text-sm font-medium text-black">Search Student:</label>
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm text-black"
          />
        </div>
        <ul className="space-y-4">
          {filteredStudents.map((student, index) => (
            <li key={student.id} className="bg-gray-100 border border-gray-300 rounded p-3 mb-3 relative">
              <Link to={`/student/${student.id}`} className="text-lg font-medium text-black hover:underline">
                {student.name}
              </Link>
              <p className="text-sm text-black">
                Subjects: {Object.keys(student.subjects).filter(subject => student.subjects[subject]).join(', ')}
              </p>
              <p className="text-sm text-black">
                Price: {selectedCurrency === 'respective' ? student.price : convertToSelectedCurrency(student.price, student.currency).toFixed(2)} {selectedCurrency === 'respective' ? student.currency : selectedCurrency}
              </p>
              <div className="absolute right-2 top-2">
                <button onClick={() => handleEditStudent(student)} className="bg-black text-white p-2 rounded hover:bg-gray-800">Edit</button>
                <button onClick={() => handleDeleteClick(student)} className="bg-black text-white p-2 rounded ml-2 hover:bg-gray-800">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-black">Confirm Deletion</h2>
            <p className="mb-4 text-black">Are you sure you want to delete this student?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;