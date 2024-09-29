import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Tooltip.css'; // Ensure you have the corresponding CSS file


const Tooltip = ({ content, children }) => {
  const [tooltipStyle, setTooltipStyle] = useState({});

  const handleMouseEnter = (e) => {
    const { clientX, clientY } = e;
    setTooltipStyle({
      top: clientY + 10 + 'px', // Adjust the offset as needed
      left: clientX + 10 + 'px', // Adjust the offset as needed
    });
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseEnter}
    >
      {children}
      <div
        className="fixed z-10 hidden w-auto max-w-xs p-2 text-sm text-white bg-black rounded-md shadow-md group-hover:block"
        style={tooltipStyle}
      >
        {content}
      </div>
    </div>
  );
};

Tooltip.propTypes = {
  content: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Tooltip;