// src/components/ui/Textarea.js

import React from 'react';

const Textarea = ({ value, onChange, placeholder }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 border rounded text-gray-700 resize-none"
      rows="4"
    ></textarea>
  );
};

export default Textarea;
