import React, { useState, useContext } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { db } from '../firebase'; // Adjust the import path based on your project structure
import { doc, updateDoc } from 'firebase/firestore';

const SetPassword = ({ studentId }) => {
  const { students, setStudents } = useContext(GlobalStateContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSetCredentials = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
      return;
    }

    try {
      const studentDoc = doc(db, 'students', studentId);
      await updateDoc(studentDoc, { username, password });

      const updatedStudents = students.map(student => 
        student.id === studentId ? { ...student, username, password } : student
      );

      setStudents(updatedStudents);
      setSuccess('Credentials updated successfully');
      setError('');
    } catch (error) {
      setError('Error updating credentials');
      setSuccess('');
      console.error("Error updating credentials:", error);
    }
  };

  return (
    <div className="set-password">
      <h3>Set Credentials for Student</h3>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleSetCredentials}>Set Credentials</button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default SetPassword;