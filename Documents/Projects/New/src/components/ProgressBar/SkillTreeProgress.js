import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Circle } from 'lucide-react';

const SkillTreeProgress = () => {
  const [skills, setSkills] = useState({
    basics: { completed: true, subskills: ['Variables', 'Functions', 'Loops'] },
    dataStructures: { completed: true, subskills: ['Arrays', 'Linked Lists', 'Trees'] },
    algorithms: { completed: false, subskills: ['Sorting', 'Searching', 'Graph Algorithms'] },
    advancedTopics: { completed: false, subskills: ['Dynamic Programming', 'Machine Learning', 'System Design'] },
  });

  const toggleSkill = (skill) => {
    setSkills(prevSkills => ({
      ...prevSkills,
      [skill]: { ...prevSkills[skill], completed: !prevSkills[skill].completed }
    }));
  };

  const renderSkill = (skillName, skill) => (
    <div key={skillName} className="mb-4">
      <div 
        className="flex items-center cursor-pointer"
        onClick={() => toggleSkill(skillName)}
      >
        {skill.completed ? (
          <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
        ) : (
          <Circle className="w-6 h-6 text-gray-300 mr-2" />
        )}
        <span className={`text-lg font-semibold ${skill.completed ? 'text-green-600' : 'text-gray-700'}`}>
          {skillName.charAt(0).toUpperCase() + skillName.slice(1)}
        </span>
      </div>
      <div className="ml-8 mt-2">
        {skill.subskills.map((subskill, index) => (
          <div key={subskill} className="flex items-center mt-1">
            <AlertCircle className={`w-4 h-4 mr-2 ${skill.completed ? 'text-green-400' : 'text-gray-400'}`} />
            <span className={`text-sm ${skill.completed ? 'text-green-600' : 'text-gray-600'}`}>{subskill}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Programming Skill Tree</h2>
      {Object.entries(skills).map(([skillName, skill]) => renderSkill(skillName, skill))}
      <p className="mt-4 text-center text-gray-600">
        Click on a skill to toggle its completion status.
      </p>
    </div>
  );
};

export default SkillTreeProgress;