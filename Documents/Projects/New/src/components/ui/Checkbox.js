import React from 'react';

export const Checkbox = ({ checked, onChange, className }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={className}
    />
  );
};