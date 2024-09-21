// src/components/ui/Checkbox.js

import React from 'react';

const Checkbox = ({ checked, onChange, className }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={className}
    />
  );
};

export default Checkbox;