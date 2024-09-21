import React, { useState } from 'react';

const AdultsProgressTracker = ({ viewOnly }) => {
  const [bars, setBars] = useState([{ milestones: 0, progress: 0, color: '#40E0D0' }]);

  const addBar = () => {
    setBars([...bars, { milestones: 0, progress: 0, color: '#40E0D0' }]);
  };

  const removeBar = (index) => {
    const newBars = bars.filter((_, i) => i !== index);
    setBars(newBars);
  };

  const handleMilestonesChange = (index, milestones) => {
    const newBars = [...bars];
    newBars[index].milestones = milestones;
    if (newBars[index].milestones < 0) newBars[index].milestones = 0;
    setBars(newBars);
  };

  const handleProgressChange = (index, progress) => {
    const newBars = [...bars];
    newBars[index].progress = progress;
    if (newBars[index].progress < 0) newBars[index].progress = 0;
    if (newBars[index].progress > 100) newBars[index].progress = 100;
    setBars(newBars);
  };

  const handleColorChange = (index, color) => {
    const newBars = [...bars];
    newBars[index].color = color;
    setBars(newBars);
  };

  return (
    <div className="p-4">
      {!viewOnly && (
        <button onClick={addBar} className="mb-4 p-2 bg-blue-500 text-white rounded">Add Bar</button>
      )}
      {bars.map((bar, index) => (
        <div key={index} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {!viewOnly && (
              <>
                <input
                  type="number"
                  value={bar.milestones}
                  onChange={(e) => handleMilestonesChange(index, parseInt(e.target.value))}
                  className="p-2 border rounded"
                  min="0"
                />
                <input
                  type="number"
                  value={bar.progress}
                  onChange={(e) => handleProgressChange(index, parseInt(e.target.value))}
                  className="p-2 border rounded"
                  min="0"
                  max="100"
                />
                <input
                  type="color"
                  value={bar.color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="p-2 border rounded"
                />
                <button onClick={() => removeBar(index)} className="p-2 bg-red-500 text-white rounded">Remove Bar</button>
              </>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 relative">
            <div
              className="h-6 rounded-full"
              style={{
                width: `${bar.progress}%`,
                background: bar.color,
              }}
            ></div>
            {Array.from({ length: bar.milestones }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-6 flex items-center justify-center"
                style={{
                  left: `${(i + 1) * (100 / (bar.milestones + 1))}%`,
                }}
              >
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdultsProgressTracker;