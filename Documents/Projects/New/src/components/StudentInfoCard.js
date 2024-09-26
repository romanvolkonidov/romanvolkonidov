// StudentInfoCard.js
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const StudentInfoCard = ({ title, value, currency }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={() => setIsVisible(!isVisible)} className="text-gray-500">
          {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
      {isVisible && (
        <p className="text-2xl">
          {currency && `${currency} `}{value}
        </p>
      )}
    </div>
  );
};
export default StudentInfoCard;