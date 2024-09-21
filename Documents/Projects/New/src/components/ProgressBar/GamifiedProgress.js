import React, { useState } from 'react';
import { Star, Trophy } from 'lucide-react';

const GamifiedProgress = ({ viewOnly }) => {
  const [experience, setExperience] = useState(750);
  const [level, setLevel] = useState(3);

  const maxExperience = 1000;
  const progress = (experience / maxExperience) * 100;

  const handleExperienceChange = (value) => {
    const newExperience = parseInt(value);
    setExperience(newExperience);
    setLevel(Math.floor(newExperience / 250) + 1);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Coding Adventure</h2>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Trophy className="w-8 h-8 text-yellow-400 mr-2" />
          <span className="text-xl font-semibold">Level {level}</span>
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-6 h-6 ${i < level ? 'text-yellow-400' : 'text-gray-600'}`} />
          ))}
        </div>
      </div>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-200 bg-purple-600">
              XP
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-purple-200">
              {experience} / {maxExperience}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
          <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
        </div>
      </div>
      {!viewOnly && (
        <div className="mt-4">
          <input
            type="range"
            min="0"
            max="1000"
            value={experience}
            onChange={(e) => handleExperienceChange(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      <div className="mt-4 text-center text-sm">
        {level === 5 ? (
          <p>Congratulations! You've reached the maximum level!</p>
        ) : (
          <p>{250 - (experience % 250)} XP needed for next level</p>
        )}
      </div>
    </div>
  );
};

export default GamifiedProgress;