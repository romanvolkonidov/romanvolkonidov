import React, { useState, useEffect } from 'react';

const CircularProgress = ({ viewOnly, studentId, name }) => {
  const [circles, setCircles] = useState(() => {
    const savedCircles = localStorage.getItem(`studentProgressCircles_${studentId}`);
    return savedCircles ? JSON.parse(savedCircles) : [{ name: name || 'Course Progress', progress: 75 }];
  });

  useEffect(() => {
    localStorage.setItem(`studentProgressCircles_${studentId}`, JSON.stringify(circles));
  }, [circles, studentId]);

  const addCircle = () => {
    setCircles([...circles, { name: 'New Progress', progress: 0 }]);
  };

  const removeCircle = (index) => {
    const newCircles = circles.filter((_, i) => i !== index);
    setCircles(newCircles);
  };

  const handleProgressChange = (index, value) => {
    const newCircles = [...circles];
    newCircles[index].progress = value;
    setCircles(newCircles);
  };

  const handleNameChange = (index, newName) => {
    const newCircles = [...circles];
    newCircles[index].name = newName;
    setCircles(newCircles);
  };

  const radius = 198; // Increased radius by 10%
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    <div className="relative flex flex-wrap items-center justify-center bg-gray-100 p-8 rounded-lg shadow-md">
      {circles.map((circle, index) => {
        const strokeDashoffset = circumference - (circle.progress / 100) * circumference;
        return (
          <div key={index} className="mb-8 w-full md:w-1/2 p-4"> {/* Adjusted card size to w-full for small screens and w-1/2 for medium and larger screens */}
            <div className="relative">
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 mx-auto">
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
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl font-bold text-blue-600">{circle.progress}%</span> {/* Increased font size */}
              </div>
            </div>
            <div className="mt-4 text-center">
              <input
                type="text"
                value={circle.name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="text-2xl font-bold text-blue-600 text-center bg-transparent border-none outline-none"
                disabled={viewOnly}
              />
            </div>
            {!viewOnly && (
              <input
                type="range"
                min="0"
                max="100"
                value={circle.progress}
                onChange={(e) => handleProgressChange(index, e.target.value)}
                className="mt-4 w-full"
              />
            )}
            {!viewOnly && (
              <button
                onClick={() => removeCircle(index)}
                className="mt-2 p-2 bg-red-500 text-white rounded"
              >
                Remove Circle
              </button>
            )}
          </div>
        );
      })}
      {!viewOnly && (
        <button
          onClick={addCircle}
          className="absolute bottom-4 right-4 p-2 bg-blue-500 text-white rounded"
        >
          Add Circle
        </button>
      )}
    </div>
  );
};

export default CircularProgress;