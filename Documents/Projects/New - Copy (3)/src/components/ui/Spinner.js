// src/components/ui/Spinner.js
import React from 'react';

const Spinner = () => {
  const spinnerStyle = {
    width: '40px',
    height: '40px',
    position: 'relative',
    margin: 'auto'
  };

  const dotStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#333',
    animation: 'dot1 2s infinite ease-in-out'
  };

  const dot2Style = {
    ...dotStyle,
    animationDelay: '-1s'
  };

  return (
    <div style={spinnerStyle}>
      <div style={dotStyle}></div>
      <div style={dot2Style}></div>
      <style>
        {`
          @keyframes dot1 {
            0%, 100% {
              transform: scale(0.1);
            }
            50% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Spinner;
