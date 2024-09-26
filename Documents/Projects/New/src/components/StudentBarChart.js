// StudentBarChart.js
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Eye, EyeOff } from 'lucide-react';

const StudentBarChart = ({ data, options }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="my-8">
      <div className="flex justify-end mb-2">
        <button onClick={() => setIsVisible(!isVisible)} className="text-gray-500">
          {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
      {isVisible && <Bar data={data} options={options} />}
    </div>
  );
};
export default StudentBarChart;