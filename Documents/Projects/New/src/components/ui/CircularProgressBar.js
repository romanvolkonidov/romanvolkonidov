import React from 'react';

const CircularProgressBar = ({ value }) => {
  const sqSize = 100;
  const strokeWidth = 5;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * value) / 100;

  const circularProgressBarStyle = `
    .circular-progressbar {
      display: block;
      margin: 20px auto;
      max-width: 100%;
    }
    .circular-progressbar-path {
      stroke: #3e98c7;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.5s ease 0s;
    }
    .circular-progressbar-trail {
      stroke: #d6d6d6;
    }
    .circular-progressbar-text {
      fill: #3e98c7;
      font-size: 24px;
      dominant-baseline: middle;
      text-anchor: middle;
    }
  `;

  return (
    <>
      <style>{circularProgressBarStyle}</style>
      <svg
        className="circular-progressbar"
        width={sqSize}
        height={sqSize}
        viewBox={viewBox}
      >
        <circle
          className="circular-progressbar-trail"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          fill="none"
        />
        <circle
          className="circular-progressbar-path"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          fill="none"
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
          }}
        />
        <text
          className="circular-progressbar-text"
          x={sqSize / 2}
          y={sqSize / 2}
        >
          {`${value}%`}
        </text>
      </svg>
    </>
  );
};

export default CircularProgressBar;