import React from 'react';
import './ProgressBar.css'; // Ensure this import is correct

const ProgressBar = ({ progress, milestones }) => {
  return (
    <div className="progress-bar">
      {milestones.map((milestone, index) => (
        <div
          key={index}
          className="milestone"
          style={{ left: `${milestone.percentage}%` }}
        >
          <div className="tooltip">{milestone.name}</div>
        </div>
      ))}
      <div className="progress" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default ProgressBar;