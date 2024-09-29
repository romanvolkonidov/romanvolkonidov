import React, { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const MilestoneProgress = ({ viewOnly }) => {
  const [currentStep, setCurrentStep] = useState(2);
  const steps = ['Basics', 'Intermediate', 'Advanced', 'Expert', 'Master'];

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Learning Journey</h2>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            {index <= currentStep ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : (
              <Circle className="w-10 h-10 text-gray-300" />
            )}
            <span className={`mt-2 text-sm ${index <= currentStep ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
      {!viewOnly && (
        <div className="mt-8">
          <input
            type="range"
            min="0"
            max="4"
            value={currentStep}
            onChange={(e) => setCurrentStep(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}
      <p className="mt-4 text-center text-gray-600">
        You're at the <strong>{steps[currentStep]}</strong> level. Keep going!
      </p>
    </div>
  );
};

export default MilestoneProgress;