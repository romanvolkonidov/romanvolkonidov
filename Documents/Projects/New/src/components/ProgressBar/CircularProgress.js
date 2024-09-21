import React, { useState } from 'react';

const CircularProgress = ({ viewOnly }) => {
  const [progress, setProgress] = useState(75);

  const radius = 90;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-8 rounded-lg shadow-md">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="#e6e6e6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#3b82f6"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="mt-4 text-center">
        <span className="text-4xl font-bold text-blue-600">{progress}%</span>
        <p className="text-gray-600 mt-2">Course Progress</p>
      </div>
      {!viewOnly && (
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          className="mt-4 w-full"
        />
      )}
    </div>
  );
};

export default CircularProgress;