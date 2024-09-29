import React from 'react';

const Delect = ({ label, onClick }) => {
  return (
    <div>
      <button
        onClick={onClick}
        className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition"
      >
        {label || 'Delete'}
      </button>
    </div>
  );
};

export default Delect;
