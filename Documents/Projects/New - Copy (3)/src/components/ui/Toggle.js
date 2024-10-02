import React from 'react';

const Toggle = ({ id, checked, onChange, label }) => {
  return (
    <div className="flex items-center">
      <label htmlFor={id} className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            className="sr-only"
            checked={checked}
            onChange={() => onChange(!checked)}
          />
          <div className={`block w-10 h-6 rounded-full ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${checked ? 'transform translate-x-4' : ''}`}></div>
        </div>
        <div className="ml-3 text-gray-700 font-medium">
          {label}
        </div>
      </label>
    </div>
  );
};

export default Toggle;