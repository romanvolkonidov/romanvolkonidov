import React, { useState } from 'react';
import { Sword, Shield, Book, Zap, Trophy } from 'lucide-react';

const QuestProgress = ({ viewOnly }) => {
  const [completedQuests, setCompletedQuests] = useState(3);
  const totalQuests = 5;

  const quests = [
    { name: 'Basics Battle', icon: Sword, reward: 'Variables Mastery' },
    { name: 'Function Fortress', icon: Shield, reward: 'Function Prowess' },
    { name: 'Loop Labyrinth', icon: Zap, reward: 'Loop Wizard' },
    { name: 'Data Structure Dungeon', icon: Book, reward: 'Data Sage' },
    { name: 'Algorithm Arena', icon: Trophy, reward: 'Algorithm Champion' }
  ];

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Coding Quest Progress</h2>
      <div className="mb-4 text-center">
        <span className="text-xl font-semibold">{completedQuests} / {totalQuests} Quests Completed</span>
      </div>
      {quests.map((quest, index) => (
        <div key={quest.name} className={`flex items-center mb-4 p-3 rounded-lg ${index < completedQuests ? 'bg-green-700' : 'bg-gray-700'}`}>
          <quest.icon className={`w-8 h-8 mr-3 ${index < completedQuests ? 'text-yellow-400' : 'text-gray-400'}`} />
          <div className="flex-grow">
            <h3 className="font-semibold">{quest.name}</h3>
            <p className="text-sm text-gray-300">Reward: {quest.reward}</p>
          </div>
          {index < completedQuests && (
            <span className="text-xs bg-yellow-400 text-gray-800 py-1 px-2 rounded-full">Completed</span>
          )}
        </div>
      ))}
      {!viewOnly && (
        <input
          type="range"
          min="0"
          max={totalQuests}
          value={completedQuests}
          onChange={(e) => setCompletedQuests(parseInt(e.target.value))}
          className="w-full mt-4"
        />
      )}
    </div>
  );
};

export default QuestProgress;