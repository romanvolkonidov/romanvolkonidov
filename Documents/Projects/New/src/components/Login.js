import React, { useState, useContext } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase'; // Adjust the import path based on your project structure
import { collection, getDocs } from 'firebase/firestore';

const Login = () => {
  const { setAuthenticatedStudent } = useContext(GlobalStateContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Admin credentials
      const adminUsername = 'admin';
      const adminPassword = '2206';

      if (username === adminUsername && password === adminPassword) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', 'true');
        setError('');
        navigate('/'); // Navigate to the home page for admin
        return;
      }

      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const student = students.find(s => s.username === username && s.password === password);

      if (student) {
        setAuthenticatedStudent(student);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', 'false');
        setError('');
        navigate(`/dashboard/${student.id}`); // Navigate to the student's dashboard page
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('Error logging in');
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="login-page">
      <h2>Student Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;