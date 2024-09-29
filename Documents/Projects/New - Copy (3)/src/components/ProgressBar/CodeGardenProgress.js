import React, { useState } from 'react';
import { Sprout, Flower, Activity } from 'lucide-react';

const CodeGardenProgress = ({ viewOnly }) => {
  const [plants, setPlants] = useState([
    { name: 'Variables', stage: 2 },
    { name: 'Functions', stage: 1 },
    { name: 'Arrays', stage: 0 },
    { name: 'Objects', stage: 1 },
    { name: 'Loops', stage: 2 },
    { name: 'Conditionals', stage: 0 },
  ]);

  const stages = [
    { icon: Sprout, color: 'text-green-300' },
    { icon: Flower, color: 'text-pink-400' },
    { icon: Activity, color: 'text-green-600' },
  ];

  const growPlant = (index) => {
    if (!viewOnly) {
      setPlants(prevPlants => 
        prevPlants.map((plant, i) => 
          i === index ? { ...plant, stage: (plant.stage + 1) % 3 } : plant
        )
      );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-green-50 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-green-800">Your Code Garden</h2>
      <div className="grid grid-cols-3 gap-4">
        {plants.map((plant, index) => {
          const StageIcon = stages[plant.stage].icon;
          return (
            <div key={plant.name} className="text-center" onClick={() => growPlant(index)}>
              <div className={`bg-white rounded-full p-4 mb-2 mx-auto w-16 h-16 flex items-center justify-center ${!viewOnly ? 'cursor-pointer' : ''}`}>
                <StageIcon className={`w-8 h-8 ${stages[plant.stage].color}`} />
              </div>
              <p className="text-sm font-medium text-green-700">{plant.name}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-center">
        <p className="text-lg font-semibold text-green-800">
          Your garden is {Math.round((plants.reduce((sum, plant) => sum + plant.stage, 0) / (plants.length * 2)) * 100)}% grown
        </p>
      </div>
    </div>
  );
};

export default CodeGardenProgress;