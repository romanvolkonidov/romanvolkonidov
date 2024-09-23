import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const GlobalStateContext = createContext();

const GlobalStateProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [expectedIncome, setExpectedIncome] = useState({ amount: 1000, currency: 'KES' });
  const [debt, setDebt] = useState({ amount: 0, currency: 'KES' });
  const [exchangeRates, setExchangeRates] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentBarData, setStudentBarData] = useState({}); // Add state for student bar data
  const [studentProgress, setStudentProgress] = useState([]);

  const fetchExchangeRates = async () => {
    const response = await fetch('https://apilayer.net/api/live?access_key=08439dfc1bdd063f9bd949a703aef93b&currencies=EUR,KES,RUB&source=USD&format=1');
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    const data = await response.json();
    return {
      USD: 1,
      EUR: data.quotes.USDEUR,
      KES: data.quotes.USDKES,
      RUB: data.quotes.USDRUB,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch transactions
      const transactionSnapshot = await getDocs(collection(db, 'transactions'));
      const fetchedTransactions = transactionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(fetchedTransactions);

      // Fetch students
      const studentSnapshot = await getDocs(collection(db, 'students'));
      const fetchedStudents = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(fetchedStudents);

      // Fetch expected income
      const incomeDocRef = doc(db, 'settings', 'expectedIncome');
      const incomeDocSnap = await getDoc(incomeDocRef);
      if (incomeDocSnap.exists()) {
        const { amount, currency } = incomeDocSnap.data();
        setExpectedIncome({ amount, currency });
      }

      // Fetch debt
      const debtDocRef = doc(db, 'settings', 'debt');
      const debtDocSnap = await getDoc(debtDocRef);
      if (debtDocSnap.exists()) {
        const { amount, currency } = debtDocSnap.data();
        setDebt({ amount, currency });
      }

      // Check if we need to fetch new exchange rates
      const lastFetch = localStorage.getItem('lastFetch');
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (!lastFetch || now - lastFetch > oneDay) {
        try {
          // Fetch new exchange rates
          const relevantRates = await fetchExchangeRates();
          setExchangeRates(relevantRates);
          localStorage.setItem('exchangeRates', JSON.stringify(relevantRates));
          localStorage.setItem('lastFetch', now);
        } catch (error) {
          console.error("Error fetching exchange rates: ", error);
          // If fetching rates fails, use stored rates if available
          const storedRates = JSON.parse(localStorage.getItem('exchangeRates'));
          if (storedRates) {
            setExchangeRates(storedRates);
          }
        }
      } else {
        // Use stored rates
        const storedRates = JSON.parse(localStorage.getItem('exchangeRates'));
        setExchangeRates(storedRates);
      }
    } catch (error) {
      setError("Error fetching data");
      console.error("Error fetching data: ", error);
      // Use stored rates if available
      const storedRates = JSON.parse(localStorage.getItem('exchangeRates'));
      if (storedRates) {
        setExchangeRates(storedRates);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStudentProgress = (newProgress) => {
    setStudentProgress(newProgress);
  };

  const deleteStudentProgress = (id) => {
    setStudentProgress(studentProgress.filter(progress => progress.id !== id));
  };

  
  const addTransaction = async (transaction) => {
    setLoading(true);
    setError(null);
    try {
      const newTransaction = {
        ...transaction,
        date: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
      setTransactions(prev => [...prev, { id: docRef.id, ...newTransaction }]);
    } catch (error) {
      setError("Error adding transaction");
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const updateExpectedIncome = async (amount, currency) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'settings', 'expectedIncome');
      await setDoc(docRef, { amount, currency });
      setExpectedIncome({ amount, currency });
    } catch (error) {
      setError("Error updating expected income");
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const setDebtAmount = async (amount, currency) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'settings', 'debt');
      await setDoc(docRef, { amount, currency });
      setDebt({ amount, currency });
    } catch (error) {
      setError("Error setting debt amount");
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, 'students'), student);
      setStudents(prev => [...prev, { id: docRef.id, ...student }]);
    } catch (error) {
      setError("Error adding student");
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id, updatedStudent) => {
    setLoading(true);
    setError(null);
    try {
      const studentDoc = doc(db, 'students', id);
      await updateDoc(studentDoc, updatedStudent);
      setStudents(prev => prev.map(student => (student.id === id ? { id, ...updatedStudent } : student)));
    } catch (error) {
      setError("Error updating student");
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'students', id));
      setStudents(prev => prev.filter(student => student.id !== id));
    } catch (error) {
      setError("Error deleting student");
      console.error("Error deleting document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'transactions', id));
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      setError("Error deleting transaction");
      console.error("Error deleting document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (!exchangeRates || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return amount;
    }
    const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    return amount * rate;
  };

  return (
    <GlobalStateContext.Provider value={{
      transactions,
      students,
      expectedIncome,
      debt,
      addTransaction,
      addStudent,
      updateStudent,
      deleteStudent,
      updateExpectedIncome,
      setDebtAmount,
      deleteTransaction,
      setTransactions,
      setStudents,
      exchangeRates,
      error,
      loading,
      convertAmount,
      studentBarData, // Add studentBarData to context value
      setStudentBarData,
      deleteStudentProgress,
      updateStudentProgress, 
      studentProgress,
      setStudentProgress,// Add setStudentBarData to context value
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export { GlobalStateContext, GlobalStateProvider };