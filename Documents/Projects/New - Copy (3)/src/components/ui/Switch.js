// src/components/ui/Switch.js
import React from 'react';

const Switch = ({ isOn, handleToggle }) => {
  const switchStyle = {
    width: '60px',
    height: '30px',
    background: isOn ? '#4caf50' : '#ccc',
    borderRadius: '15px',
    cursor: 'pointer',
    position: 'relative',
    display: 'inline-block',
  };

  const sliderStyle = {
    width: '30px',
    height: '30px',
    background: 'white',
    borderRadius: '15px',
    position: 'absolute',
    top: '0',
    left: isOn ? '30px' : '0',
    transition: 'all 0.3s',
  };

  return (
    <div style={switchStyle} onClick={handleToggle}>
      <div style={sliderStyle}></div>
    </div>
  );
};

export default Switch;
