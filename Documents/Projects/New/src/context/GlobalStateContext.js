import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const GlobalStateContext = createContext();

const GlobalStateProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]); // State for courses including lessons
  const [expectedIncome, setExpectedIncome] = useState({ amount: 1000, currency: 'KES' });
  const [debt, setDebt] = useState({ amount: 0, currency: 'KES' });
  const [exchangeRates, setExchangeRates] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentBarData, setStudentBarData] = useState({});
  const [tableData, setTableData] = useState({}); // State for table data

  const storage = getStorage();

  /**
   * @param {Array} files - List of files to upload
   * @returns {Promise<Array>} - URLs of uploaded files
   */
  const uploadFiles = async (files) => {
    const uploadPromises = files.map(async (file) => {
      const storageRef = ref(storage, `homework/${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });
    return Promise.all(uploadPromises);
  };

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

      // Fetch courses
      const courseSnapshot = await getDocs(collection(db, 'courses'));
      const fetchedCourses = courseSnapshot.docs.map(doc => {
        const course = { id: doc.id, ...doc.data() };
        course.chapters = course.chapters.map(chapter => {
          chapter.lessons = chapter.lessons.map(lesson => ({
            ...lesson,
            homework: lesson.homework || { text: '', files: [] }
          }));
          return chapter;
        });
        return course;
      });
      setCourses(fetchedCourses);

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

      // Fetch table data
      const tableDataSnapshot = await getDocs(collection(db, 'tableData'));
      const fetchedTableData = tableDataSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().data;
        return acc;
      }, {});
      setTableData(fetchedTableData);

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

  const addCourse = async (course) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, 'courses'), course);
      setCourses(prev => [...prev, { id: docRef.id, ...course }]);
    } catch (error) {
      setError("Error adding course");
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (id, updatedCourse) => {
    setLoading(true);
    setError(null);
    try {
      const courseDoc = doc(db, 'courses', id);
      await updateDoc(courseDoc, updatedCourse);
      setCourses(prev => prev.map(course => (course.id === id ? { id, ...updatedCourse } : course)));
    } catch (error) {
      setError("Error updating course");
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourses(prev => prev.filter(course => course.id !== id));
    } catch (error) {
      setError("Error deleting course");
      console.error("Error deleting document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (editItem.chapters) {
      // It's a course
      await updateCourse(editItem.id, editItem);
    } else if (editItem.lessons) {
      // It's a chapter
      const course = courses.find(c => c.chapters.some(ch => ch.id === editItem.id));
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map(ch => ch.id === editItem.id ? editItem : ch)
      };
      await updateCourse(course.id, updatedCourse);
    } else {
      // It's a lesson
      const course = courses.find(c => c.chapters.some(ch => ch.lessons.some(l => l.id === editItem.id)));
      const updatedCourse = {
        ...course,
        chapters: await Promise.all(course.chapters.map(async (ch) => {
          if (ch.lessons.some(l => l.id === editItem.id)) {
            const updatedLessons = await Promise.all(ch.lessons.map(async (l) => {
              if (l.id === editItem.id) {
                const fileUrls = await uploadFiles(editItem.homework.files);
                return { ...editItem, homework: { ...editItem.homework, files: fileUrls } };
              }
              return l;
            }));
            return { ...ch, lessons: updatedLessons };
          }
          return ch;
        }))
      };
      await updateCourse(course.id, updatedCourse);
    }
    setEditMode(false);
    setEditItem(null);
  };

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (!exchangeRates || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return amount;
    }
    const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    return amount * rate;
  };

  const handleSaveTableData = async (id, newTableData) => {
    setLoading(true);
    setError(null);
    try {
      const tableDataDoc = doc(db, 'tableData', id);
      await setDoc(tableDataDoc, { data: newTableData });
      setTableData(prev => ({ ...prev, [id]: newTableData }));
    } catch (error) {
      setError("Error updating table data");
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalStateContext.Provider
      value={{
        transactions,
        students,
        courses,
        expectedIncome,
        debt,
        exchangeRates,
        error,
        loading,
        studentBarData,
        tableData,
        addTransaction,
        updateExpectedIncome,
        setDebtAmount,
        addStudent,
        updateStudent,
        deleteStudent,
        deleteTransaction,
        addCourse,
        updateCourse,
        deleteCourse,
        convertAmount,
        setTransactions,
        setStudents,
        setCourses,
        setStudentBarData,
        handleSaveTableData,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export { GlobalStateProvider, GlobalStateContext };