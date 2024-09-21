import React, { useState } from 'react';
import { Moon, Star, Sun, Activity, Rocket } from 'lucide-react';

const SpaceExplorationProgress = () => {
  const [currentLevel, setCurrentLevel] = useState(2);
  const levels = [
    { name: 'Moon', icon: Moon, color: 'text-gray-300' },
    { name: 'Asteroid Belt', icon: Star, color: 'text-yellow-400' },
    { name: 'Mars', icon: Activity, color: 'text-red-500' },
    { name: 'Jupiter', icon: Activity, color: 'text-orange-500' },
    { name: 'Saturn', icon: Activity, color: 'text-yellow-600' },
    { name: 'Deep Space', icon: Sun, color: 'text-blue-400' },
  ];

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Coding Space Exploration</h2>
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-700 transform -translate-x-1/2"></div>
        {levels.map((level, index) => (
          <div key={level.name} className={`flex items-center mb-8 ${index <= currentLevel ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index <= currentLevel ? 'bg-blue-600' : 'bg-gray-700'} z-10`}>
              <level.icon className={`w-6 h-6 ${level.color}`} />
            </div>
            <div className="ml-4 flex-grow">
              <h3 className="font-semibold">{level.name}</h3>
              <p className="text-sm text-gray-400">
                {index < currentLevel ? 'Explored' : index === currentLevel ? 'Current Mission' : 'Undiscovered'}
              </p>
            </div>
            {index === currentLevel && (
              <Rocket className="w-6 h-6 text-blue-400 animate-pulse" />
            )}
          </div>
        ))}
      </div>
      <input
        type="range"
        min="0"
        max={levels.length - 1}
        value={currentLevel}
        onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
        className="w-full mt-4"
      />
    </div>
  );
};

export default SpaceExplorationProgress;