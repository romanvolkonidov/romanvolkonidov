import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/Slider";

const StudentProgressBar = ({ viewOnly, studentId }) => {
  const [bars, setBars] = useState(() => {
    const savedBars = localStorage.getItem(`studentProgressBars_${studentId}`);
    return savedBars ? JSON.parse(savedBars) : [{ milestones: [], progress: 50, color: '#40E0D0' }];
  });

  useEffect(() => {
    localStorage.setItem(`studentProgressBars_${studentId}`, JSON.stringify(bars));
  }, [bars, studentId]);

  const addBar = () => {
    setBars([...bars, { milestones: [], progress: 50, color: '#40E0D0' }]);
  };

  const removeBar = (index) => {
    const newBars = bars.filter((_, i) => i !== index);
    setBars(newBars);
  };

  const handleMilestonesChange = (index, milestones) => {
    const newBars = [...bars];
    newBars[index].milestones = Array.from({ length: milestones }, (_, i) => ({
      name: `Milestone ${i + 1}`,
    }));
    setBars(newBars);
  };

  const handleProgressChange = (index, value) => {
    const newBars = [...bars];
    newBars[index].progress = value[0];
    if (newBars[index].progress < 0) newBars[index].progress = 0;
    if (newBars[index].progress > 100) newBars[index].progress = 100;
    setBars(newBars);
  };

  const handleColorChange = (index, color) => {
    const newBars = [...bars];
    newBars[index].color = color;
    setBars(newBars);
  };

  const handleMilestoneNameChange = (barIndex, milestoneIndex, name) => {
    const newBars = [...bars];
    newBars[barIndex].milestones[milestoneIndex].name = name;
    setBars(newBars);
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Student Progress</h2>
      {!viewOnly && (
        <button onClick={addBar} className="mb-4 p-2 bg-blue-500 text-white rounded">Add Bar</button>
      )}
      {bars.map((bar, index) => (
        <div key={index} className="mb-4">
          {!viewOnly && (
            <div className="flex items-center justify-between mb-2">
              <input
                type="number"
                value={bar.milestones.length}
                onChange={(e) => handleMilestonesChange(index, parseInt(e.target.value))}
                className="p-2 border rounded"
                min="0"
              />
              <Slider
                defaultValue={[bar.progress]}
                max={100}
                step={1}
                onValueChange={(value) => handleProgressChange(index, value)}
              />
              <input
                type="color"
                value={bar.color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="p-2 border rounded"
              />
              <button onClick={() => removeBar(index)} className="p-2 bg-red-500 text-white rounded">Remove Bar</button>
            </div>
          )}
          <div className="relative pt-1 w-full">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-teal-600">
                  {bar.progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200 relative w-full">
              <div
                style={{ width: `${bar.progress}%`, background: bar.color }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ease-in-out"
              ></div>
              {bar.milestones.map((milestone, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-2 w-2 bg-black rounded-full cursor-pointer"
                  style={{
                    left: `${(i + 1) * (100 / (bar.milestones.length + 1))}%`,
                    transform: 'translateX(-50%)',
                  }}
                  title={milestone.name}
                  onClick={() => alert(milestone.name)}
                ></div>
              ))}
            </div>
            {!viewOnly && bar.milestones.length > 0 && (
              <div className="mb-4">
                <select
                  onChange={(e) => {
                    const [milestoneIndex, name] = e.target.value.split('-');
                    handleMilestoneNameChange(index, parseInt(milestoneIndex), name);
                  }}
                  className="p-2 border rounded"
                >
                  {bar.milestones.map((milestone, i) => (
                    <option key={i} value={`${i}-${milestone.name}`}>
                      {milestone.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Rename milestone"
                  onBlur={(e) => {
                    const milestoneIndex = parseInt(e.target.previousSibling.value.split('-')[0]);
                    handleMilestoneNameChange(index, milestoneIndex, e.target.value);
                  }}
                  className="p-2 border rounded ml-2"
                />
              </div>
            )}
          </div>
          <p className="text-center text-gray-600 mt-4">
            {bar.progress < 25 && "Just getting started! Keep going!"}
            {bar.progress >= 25 && bar.progress < 50 && "You're making progress! Keep it up!"}
            {bar.progress >= 50 && bar.progress < 75 && "Halfway there! You're doing great!"}
            {bar.progress >= 75 && bar.progress < 100 && "Almost there! You're nearly finished!"}
            {bar.progress === 100 && "Congratulations! You've completed the course!"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StudentProgressBar;