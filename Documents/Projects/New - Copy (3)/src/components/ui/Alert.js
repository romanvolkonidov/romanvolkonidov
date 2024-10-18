import React from 'react';

export const Alert = ({ children, type = 'info' }) => {
  const alertTypeClasses = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  };

  return (
    <div className={`p-4 rounded-md ${alertTypeClasses[type]}`}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children }) => (
  <h4 className="font-bold text-lg mb-2">
    {children}
  </h4>
);

export const AlertDescription = ({ children }) => (
  <p className="text-gray-600">
    {children}
  </p>
);

export default Alert;