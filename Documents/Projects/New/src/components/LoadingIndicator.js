import React from 'react';

const LoadingIndicator = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <p className="text-lg font-semibold">Generating invoice...</p>
      <div className="mt-2 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

export default LoadingIndicator;