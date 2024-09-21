// src/components/ui/Progress.js

import React from 'react';

const Progress = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded">
      <div
        className="bg-blue-500 text-xs font-medium text-white text-center p-0.5 leading-none rounded"
        style={{ width: `${value}%` }}
      >
        {value}%
      </div>
    </div>
  );
};

export default Progress;
