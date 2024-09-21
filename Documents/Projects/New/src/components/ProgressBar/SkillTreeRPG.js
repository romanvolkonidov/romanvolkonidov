import React, { useState } from 'react';
import { Circle, CheckCircle, Lock } from 'lucide-react';

const SkillTreeRPG = ({ viewOnly }) => {
  const [skillPoints, setSkillPoints] = useState(5);
  const [skills, setSkills] = useState({
    'Basic Syntax': { level: 2, maxLevel: 3, requires: null },
    'Functions': { level: 1, maxLevel: 3, requires: 'Basic Syntax' },
    'Data Structures': { level: 0, maxLevel: 3, requires: 'Functions' },
    'Algorithms': { level: 0, maxLevel: 3, requires: 'Data Structures' },
    'Advanced Topics': { level: 0, maxLevel: 3, requires: 'Algorithms' },
  });

  const canUpgradeSkill = (skillName) => {
    const skill = skills[skillName];
    if (skill.level >= skill.maxLevel || skillPoints === 0) return false;
    if (skill.requires && skills[skill.requires].level === 0) return false;
    return true;
  };

  const upgradeSkill = (skillName) => {
    if (canUpgradeSkill(skillName)) {
      setSkills(prevSkills => ({
        ...prevSkills,
        [skillName]: { ...prevSkills[skillName], level: prevSkills[skillName].level + 1 }
      }));
      setSkillPoints(prevPoints => prevPoints - 1);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Coding Skill Tree</h2>
      <div className="mb-4 text-center">
        <span className="text-xl font-semibold">Skill Points: {skillPoints}</span>
      </div>
      {Object.entries(skills).map(([skillName, skill]) => (
        <div key={skillName} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">{skillName}</span>
            <div className="flex items-center">
              {[...Array(skill.maxLevel)].map((_, index) => (
                <div key={index} className="mr-1">
                  {index < skill.level ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
          {!viewOnly && (
            <button
              onClick={() => upgradeSkill(skillName)}
              disabled={!canUpgradeSkill(skillName)}
              className={`w-full py-2 rounded-lg ${
                canUpgradeSkill(skillName)
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {skill.requires && skills[skill.requires].level === 0 ? (
                <Lock className="inline w-4 h-4 mr-2" />
              ) : null}
              Upgrade ({skill.level}/{skill.maxLevel})
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SkillTreeRPG;