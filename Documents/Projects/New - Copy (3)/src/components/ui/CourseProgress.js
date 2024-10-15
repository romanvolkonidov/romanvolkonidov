import React from 'react';
import { Progress } from '@/components/ui/Progress';

const CourseProgress = ({ progress, milestones }) => {
  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Course Progress</h2>
      <ProgressBar value={progress} className="w-full h-4 mb-4" />
      <p className="text-sm text-gray-600 mb-4">{progress}% Complete</p>
      
      <div className="space-y-2">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${progress >= milestone.percentage ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`text-sm ${progress >= milestone.percentage ? 'text-green-500 font-semibold' : 'text-gray-500'}`}>
              {milestone.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseProgress;