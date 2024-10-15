import React from 'react';
import { Progress } from '@/components/ui/Progress';
import Tooltip from '@/components/ui/Tooltip';

const ResultsColumn = ({ results, homeworkId, studentId }) => {
  if (!results || !results[homeworkId] || !results[homeworkId][studentId]) {
    return <div className="text-sm text-gray-500">No results</div>;
  }

  const studentResult = results[homeworkId][studentId];

  if (typeof studentResult.percentage !== 'number') {
    return <div className="text-sm text-gray-500">Invalid result data</div>;
  }

  const percentage = studentResult.percentage.toFixed(1);

  return (
    <Tooltip content={
      <div>
        <p>Score: {percentage}%</p>
        <p>Completed: {new Date(studentResult.completedAt).toLocaleString()}</p>
        {studentResult.attempts && <p>Attempts: {studentResult.attempts}</p>}
      </div>
    }>
      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden cursor-pointer">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Tooltip>
  );
};

export default ResultsColumn;