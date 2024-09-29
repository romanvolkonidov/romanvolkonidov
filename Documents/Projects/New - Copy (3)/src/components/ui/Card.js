import React from 'react';

export const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded-lg p-4">
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="border-b pb-2 mb-4">
    {children}
  </div>
);

export const CardTitle = ({ children }) => (
  <h2 className="text-xl font-semibold">
    {children}
  </h2>
);

export const CardContent = ({ children }) => (
  <div>
    {children}
  </div>
);

export const CardDescription = ({ children }) => (
  <p className="text-gray-600">
    {children}
  </p>
);

export const CardFooter = ({ children }) => (
  <div className="border-t pt-2 mt-4">
    {children}
  </div>
);