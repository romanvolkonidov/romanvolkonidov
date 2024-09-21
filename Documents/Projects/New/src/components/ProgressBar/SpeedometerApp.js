import React, { useState } from 'react';
import styled from 'styled-components';

// Styled components for the wrapper
const SpeedometerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 40px;
`;

const Tooltip = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  pointer-events: none;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s;
`;

const Speedometer = ({ progress, nameMap }) => {
  // Define the speed increments and their labels
  const speeds = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220];
  const radius = 100;
  const angleOffset = -90; // Start from -90 degrees (left of the circle)
  const maxSpeed = 220;
  
  // Calculate the needle angle based on the progress in percentage (0 to 100%)
  const angle = (progress / 100) * 180 - 90;

  // Tooltip state for showing the speed name on hover or click
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

  const handleMouseOver = (e, text) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.x + rect.width / 2,
      y: rect.y - 20,
      text,
    });
  };

  const handleMouseOut = () => {
    setTooltip({ visible: false, x: 0, y: 0, text: '' });
  };

  return (
    <SpeedometerWrapper>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" width="400" height="200">
        {/* Outer arc */}
        <path
          d="M30 130 A 100 100 0 0 1 270 130"
          fill="none"
          stroke="black"
          strokeWidth="10"
        />

        {/* Draw the speeds and labels */}
        {speeds.map((speed, i) => {
          const speedAngle = (speed / maxSpeed) * 180 + angleOffset;
          const x = 150 + radius * Math.cos((Math.PI / 180) * speedAngle);
          const y = 130 + radius * Math.sin((Math.PI / 180) * speedAngle);
          
          return (
            <text
              key={speed}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="14"
              fill="black"
              onMouseOver={(e) => handleMouseOver(e, nameMap[speed])}
              onMouseOut={handleMouseOut}
              style={{ cursor: 'pointer' }}
            >
              {speed}
            </text>
          );
        })}

        {/* Needle */}
        <line
          x1="150"
          y1="130"
          x2="150"
          y2="40"
          stroke="red"
          strokeWidth="5"
          transform={`rotate(${angle} 150 130)`}
        />
      </svg>

      {/* Tooltip for displaying names */}
      <Tooltip visible={tooltip.visible} style={{ left: tooltip.x, top: tooltip.y }}>
        {tooltip.text}
      </Tooltip>

      {/* Display the speed percentage */}
      <div style={{ fontSize: '20px', marginTop: '10px' }}>Speed: {progress}%</div>
    </SpeedometerWrapper>
  );
};

// Main component to manage multiple speedometers
const SpeedometerApp = () => {
  const [speedometers, setSpeedometers] = useState([0]);
  const [speedMap] = useState({
    20: 'Low',
    40: 'Medium',
    60: 'High',
    80: 'Very High',
    100: 'Fast',
    120: 'Very Fast',
    140: 'Super Fast',
    160: 'Insane Speed',
    180: 'Hyper Speed',
    200: 'Almost Max',
    220: 'Max Speed',
  });

  const handleSpeedChange = (index, value) => {
    const updatedSpeedometers = [...speedometers];
    updatedSpeedometers[index] = value;
    setSpeedometers(updatedSpeedometers);
  };

  const addSpeedometer = () => {
    setSpeedometers([...speedometers, 0]);
  };

  const removeSpeedometer = (index) => {
    const updatedSpeedometers = speedometers.filter((_, i) => i !== index);
    setSpeedometers(updatedSpeedometers);
  };

  return (
    <div>
      <button onClick={addSpeedometer}>Add Speedometer</button>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {speedometers.map((progress, index) => (
          <div key={index} style={{ margin: '20px', textAlign: 'center' }}>
            <Speedometer progress={progress} nameMap={speedMap} />
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleSpeedChange(index, parseInt(e.target.value))}
              style={{ width: '300px', marginTop: '10px' }}
            />
            <br />
            <button onClick={() => removeSpeedometer(index)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeedometerApp;
