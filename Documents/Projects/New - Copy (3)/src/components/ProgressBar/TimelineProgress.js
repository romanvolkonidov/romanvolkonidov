import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const TimelineProgress = ({ viewOnly }) => {
  const [currentStep, setCurrentStep] = useState(2);
  const steps = [
    { name: 'Enrollment', date: 'Jan 1' },
    { name: 'Foundations', date: 'Feb 15' },
    { name: 'Core Concepts', date: 'Apr 1' },
    { name: 'Advanced Topics', date: 'May 15' },
    { name: 'Final Project', date: 'Jun 30' },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Course Timeline</h2>
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.name} className="mb-8 flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
              index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
            }`}>
              {index <= currentStep ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="ml-4 flex-grow">
              <h3 className={`font-semibold ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}>{step.name}</h3>
              <p className="text-sm text-gray-500">{step.date}</p>
            </div>
          </div>
        ))}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 -z-10"></div>
      </div>
      {!viewOnly && (
        <input
          type="range"
          min="0"
          max="4"
          value={currentStep}
          onChange={(e) => setCurrentStep(parseInt(e.target.value))}
          className="w-full mt-4"
        />
      )}
    </div>
  );
};

export default TimelineProgress;