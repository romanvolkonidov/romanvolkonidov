// src/components/ui/Label.js
import React from 'react';

const Label = ({ text, htmlFor }) => {
  const labelStyle = {
    fontSize: '14px',
    color: '#333',
  };

  return (
    <label htmlFor={htmlFor} style={labelStyle}>
      {text}
    </label>
  );
};

export default Label;
