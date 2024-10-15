import React, { useContext } from 'react';
import { VisibilityContext } from '../context/VisibilityContext';

const Visibility = () => {
  const { isFinancialSectionVisible, updateVisibilityState } = useContext(VisibilityContext);

  const toggleFinancialSectionVisibility = () => {
    updateVisibilityState(!isFinancialSectionVisible);
  };

  return (
    <div className="home-page">
      <button onClick={toggleFinancialSectionVisibility} className="p-2 bg-black-500 text-white rounded">
        On/Off
      </button>
      <p>{isFinancialSectionVisible ? 'Visible' : 'Hidden'}</p>
    </div>
  );
};

export default Visibility;