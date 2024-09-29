import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const VisibilityContext = createContext();

export const VisibilityProvider = ({ children }) => {
  const [isFinancialSectionVisible, setIsFinancialSectionVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisibilityState = async () => {
      try {
        const docRef = doc(db, 'visibility', 'financialSection');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setIsFinancialSectionVisible(docSnap.data().isVisible);
        }
      } catch (error) {
        console.error('Error fetching visibility state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisibilityState();
  }, []);

  const updateVisibilityState = async (isVisible) => {
    try {
      const docRef = doc(db, 'visibility', 'financialSection');
      await setDoc(docRef, { isVisible });
      setIsFinancialSectionVisible(isVisible);
    } catch (error) {
      console.error('Error updating visibility state:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <VisibilityContext.Provider value={{ isFinancialSectionVisible, updateVisibilityState }}>
      {children}
    </VisibilityContext.Provider>
  );
};