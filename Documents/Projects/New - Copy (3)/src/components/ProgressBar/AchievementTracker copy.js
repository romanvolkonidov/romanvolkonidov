import React, { useState } from 'react';
import { Award, Clock, Code, Database, Cpu } from 'lucide-react';

const AchievementTracker = () => {
  const [achievements, setAchievements] = useState({
    'Quick Learner': { completed: true, icon: Clock, description: 'Complete your first lesson' },
    'Code Warrior': { completed: false, icon: Code, description: 'Write 100 lines of code' },
    'Data Master': { completed: false, icon: Database, description: 'Create your first database' },
    'Algorithm Ace': { completed: false, icon: Cpu, description: 'Implement 5 different algorithms' },
    'Full Stack Developer': { completed: false, icon: Award, description: 'Complete all course modules' },
  });

  const toggleAchievement = (achievementName) => {
    setAchievements(prevAchievements => ({
      ...prevAchievements,
      [achievementName]: { 
        ...prevAchievements[achievementName], 
        completed: !prevAchievements[achievementName].completed 
      }
    }));
  };

  const completedCount = Object.values(achievements).filter(a => a.completed).length;

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Coding Achievements</h2>
      <div className="mb-4 text-center">
        <span className="text-xl font-semibold">
          {completedCount} / {Object.keys(achievements).length} Achievements Unlocked
        </span>
      </div>
      {Object.entries(achievements).map(([name, { completed, icon: Icon, description }]) => (
        <div 
          key={name} 
          className={`flex items-center mb-4 p-3 rounded-lg cursor-pointer ${
            completed ? 'bg-green-700' : 'bg-gray-700'
          }`}
          onClick={() => toggleAchievement(name)}
        >
          <Icon className={`w-8 h-8 mr-3 ${completed ? 'text-yellow-400' : 'text-gray-400'}`} />
          <div className="flex-grow">
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-gray-300">{description}</p>
          </div>
          {completed && (
            <Award className="w-6 h-6 text-yellow-400" />
          )}
        </div>
      ))}
    </div>
  );
};

export default AchievementTracker;