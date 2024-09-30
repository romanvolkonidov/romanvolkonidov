import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // Adjust the import path based on your project structure
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Add logic to determine if the user is an admin

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log('User:', user); // Debug log
      // Add logic to determine if the user is an admin
      if (user) {
        // Example logic to check if the user is an admin
        setIsAdmin(user.email === 'admin@example.com'); // Replace with your admin check logic
        console.log('Is Admin:', user.email === 'admin@example.com'); // Debug log
      } else {
        setIsAdmin(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};