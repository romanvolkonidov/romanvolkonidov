import React from 'react';

const Upload = ({ onChange }) => {
  return (
    <input type="file" onChange={onChange} />
  );
};

export default Upload;