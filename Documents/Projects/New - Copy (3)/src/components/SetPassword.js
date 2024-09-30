import React, { useState, useContext } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const SetPassword = ({ studentId }) => {
  const { students, setStudents } = useContext(GlobalStateContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSetCredentials = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
      return;
    }

    try {
      // Assuming you have a function to update the student's credentials
      await updateStudentCredentials(studentId, username, password);

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
      <div>
        <button onClick={handleSetCredentials}>Set Credentials</button>
      </div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default SetPassword;