// src/components/ui/Tooltip.js
import React from 'react';
import PropTypes from 'prop-types';
import './Tooltip.css'; // Ensure you have the corresponding CSS file

const Tooltip = ({ content, children }) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip-content">
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