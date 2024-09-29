import React, { useState } from 'react';
import { Radar } from 'recharts';

const RadarChartProgress = () => {
  const [skills, setSkills] = useState({
    'Problem Solving': 80,
    'Data Structures': 65,
    'Algorithms': 70,
    'System Design': 50,
    'Coding Speed': 75,
    'Debugging': 85,
  });

  const data = [
    {
      subject: 'Problem Solving',
      A: skills['Problem Solving'],
      fullMark: 100,
    },
    {
      subject: 'Data Structures',
      A: skills['Data Structures'],
      fullMark: 100,
    },
    {
      subject: 'Algorithms',
      A: skills['Algorithms'],
      fullMark: 100,
    },
    {
      subject: 'System Design',
      A: skills['System Design'],
      fullMark: 100,
    },
    {
      subject: 'Coding Speed',
      A: skills['Coding Speed'],
      fullMark: 100,
    },
    {
      subject: 'Debugging',
      A: skills['Debugging'],
      fullMark: 100,
    },
  ];

  const handleSkillChange = (skill, value) => {
    setSkills(prevSkills => ({
      ...prevSkills,
      [skill]: parseInt(value),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Skill Proficiency</h2>
      <div className="flex justify-center mb-8">
        <Radar
          width={300}
          height={300}
          cx={150}
          cy={150}
          outerRadius={100}
          data={data}
          fill="#8884d8"
          fillOpacity={0.6}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Student" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </Radar>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(skills).map(([skill, value]) => (
          <div key={skill} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{skill}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => handleSkillChange(skill, e.target.value)}
              className="w-full"
            />
            <span className="text-xs text-gray-500 mt-1">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadarChartProgress;