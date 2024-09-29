import React, { useContext } from 'react';
import { VisibilityContext } from '../context/VisibilityContext';

const Visibility = () => {
  const { isFinancialSectionVisible, updateVisibilityState } = useContext(VisibilityContext);

  const toggleFinancialSectionVisibility = () => {
    updateVisibilityState(!isFinancialSectionVisible);
  };

  return (
    <div className="home-page">
      <h1>Home Page</h1>
      <button onClick={toggleFinancialSectionVisibility} className="p-2 bg-blue-500 text-white rounded">
        Toggle Financial Section Visibility
      </button>
      <p>Financial Section is {isFinancialSectionVisible ? 'Visible' : 'Hidden'}</p>
    </div>
  );
};

export default Visibility;