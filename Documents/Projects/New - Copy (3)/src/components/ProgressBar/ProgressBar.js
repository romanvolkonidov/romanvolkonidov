import React from 'react';

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