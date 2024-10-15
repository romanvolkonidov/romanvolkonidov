import React, { useState, useContext, useEffect } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const SetPassword = ({ studentId, allowEditing = true }) => {
  const { students, setStudents } = useContext(GlobalStateContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchStudentCredentials = async () => {
      try {
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          setUsername(studentData.username || '');
          setPassword(studentData.password || '');
        }
      } catch (error) {
        console.error("Error fetching student credentials:", error);
      }
    };

    fetchStudentCredentials();
  }, [studentId]);

  const handleSetCredentials = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
      return;
    }

    try {
      const studentDoc = doc(db, 'students', studentId);
      const updatedUsername = newUsername || username;
      const updatedPassword = newPassword || password;
      await updateDoc(studentDoc, { 
        username: updatedUsername, 
        password: updatedPassword 
      });

      const updatedStudents = students.map(student => 
        student.id === studentId ? { ...student, username: updatedUsername, password: updatedPassword } : student
      );

      setStudents(updatedStudents);
      setUsername(updatedUsername);
      setPassword(updatedPassword);
      setSuccess('Credentials updated successfully');
      setError('');
      setIsEditing(false);
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('Error updating credentials');
      setSuccess('');
      console.error("Error updating credentials:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-2xl font-bold text-black mb-4"></h3>
      {username && password ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Логин</label>
            <p className="text-black font-semibold">{username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Пароль</label>
            <p className="text-black font-semibold">{password}</p>
          </div>
          {allowEditing && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
            >
              Change Credentials
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-black mb-2">No credentials set yet.</p>
          {allowEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
            >
              Set Initial Credentials
            </button>
          )}
        </div>
      )}
      
      {allowEditing && isEditing && (
        <div className="space-y-4 mt-4">
          <div>
            <label htmlFor="newUsername" className="block text-sm font-medium text-black mb-1">
              {username ? 'New Username' : 'Username'}
            </label>
            <input
              type="text"
              id="newUsername"
              placeholder={username ? 'New Username' : 'Username'}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black text-black"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-black mb-1">
              {password ? 'New Password' : 'Password'}
            </label>
            <input
              type="password"
              id="newPassword"
              placeholder={password ? 'New Password' : 'Password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black text-black"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black text-black"
            />
          </div>
          <button 
            onClick={handleSetCredentials}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            {username && password ? 'Update Credentials' : 'Set Credentials'}
          </button>
          <button 
            onClick={() => {
              setIsEditing(false);
              setNewUsername('');
              setNewPassword('');
              setConfirmPassword('');
            }}
            className="w-full bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
};

export default SetPassword;