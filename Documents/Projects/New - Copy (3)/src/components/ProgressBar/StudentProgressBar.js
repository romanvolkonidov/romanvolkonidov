import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/Slider";
import { db } from '../../firebase'; // Adjust this import based on your Firebase configuration file location
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentProgressBar = ({ viewOnly, studentId }) => {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'studentProgress', studentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setBars(docSnap.data().bars);
      } else {
        // Initialize with default data if no document exists
        const defaultBars = [{
          name: 'Default Bar',
          milestones: [],
          progress: 50,
          color: '#40E0D0',
          milestoneColor: '#000000',
          emptyBarColor: '#E0E0E0',
          progressedBarColor: '#40E0D0'
        }];
        await setDoc(docRef, { bars: defaultBars });
        setBars(defaultBars);
      }
    };

    fetchData();
  }, [studentId]);

  useEffect(() => {
    const saveData = async () => {
      const docRef = doc(db, 'studentProgress', studentId);
      await setDoc(docRef, { bars }, { merge: true });
    };

    if (bars.length > 0) {
      saveData();
    }
  }, [bars, studentId]);

  const addBar = () => {
    setBars([...bars, {
      name: 'New Bar',
      milestones: [],
      progress: 50,
      color: '#40E0D0',
      milestoneColor: '#000000',
      emptyBarColor: '#E0E0E0',
      progressedBarColor: '#40E0D0'
    }]);
  };

  const removeBar = (index) => {
    const newBars = bars.filter((_, i) => i !== index);
    setBars(newBars);
  };

  const handleMilestonesChange = (index, milestones) => {
    const newBars = [...bars];
    newBars[index].milestones = Array.from({ length: milestones }, (_, i) => ({
      name: `Milestone ${i + 1}`,
    }));
    setBars(newBars);
  };

  const handleProgressChange = (index, value) => {
    const newBars = [...bars];
    newBars[index].progress = Math.max(0, Math.min(100, value[0])); // Clamp the progress between 0 and 100
    setBars(newBars);
  };

  const handleColorChange = (index, color, field) => {
    const newBars = [...bars];
    newBars[index][field] = color;
    setBars(newBars);
  };

  const handleBarNameChange = (index, name) => {
    const newBars = [...bars];
    newBars[index].name = name;
    setBars(newBars);
  };

  const handleMilestoneNameChange = (barIndex, milestoneIndex, name) => {
    const newBars = [...bars];
    newBars[barIndex].milestones[milestoneIndex].name = name;
    setBars(newBars);
  };

  const handleSaveMilestoneName = () => {
    toast.success('Milestone name saved!');
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-md">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Ваши достижения</h2>
      {!viewOnly && (
        <button onClick={addBar} className="mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          Add Bar
        </button>
      )}
      {bars.map((bar, index) => (
        <div key={index} className="mb-4 border rounded-lg p-4 shadow-sm">
          {!viewOnly && (
            <div className="flex flex-wrap items-center justify-between mb-2 space-y-2">
              <input
                type="text"
                value={bar.name}
                onChange={(e) => handleBarNameChange(index, e.target.value)}
                className="p-2 border rounded w-full md:w-auto mb-2"
                placeholder="Bar Name"
                aria-label={`Bar Name ${index + 1}`}
              />
              <input
                type="number"
                value={bar.milestones.length}
                onChange={(e) => handleMilestonesChange(index, parseInt(e.target.value) || 0)}
                className="p-2 border rounded w-20 mb-2"
                min="0"
                aria-label={`Number of milestones for ${bar.name}`}
              />
              <div className="flex flex-wrap items-center space-x-2 mb-2">
                {['color', 'milestoneColor', 'emptyBarColor', 'progressedBarColor'].map((field) => (
                  <input
                    key={field}
                    type="color"
                    value={bar[field]}
                    onChange={(e) => handleColorChange(index, e.target.value, field)}
                    className="p-1 border rounded"
                    aria-label={`Select ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} for ${bar.name}`}
                  />
                ))}
              </div>
              <button onClick={() => removeBar(index)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition w-full md:w-auto">
                Remove Bar
              </button>
            </div>
          )}
          <div className="relative pt-1 w-full">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                  {bar.name} 
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-teal-600">
                  {bar.progress}%
                </span>
              </div>
            </div>
            {!viewOnly && (
              <div className="w-full mb-4"> {/* Increased margin-bottom to 4 */}
                <Slider
                  defaultValue={[bar.progress]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleProgressChange(index, value)}
                  aria-label={`Progress for ${bar.name}`}
                  className="w-full"
                />
              </div>
            )}
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded relative w-full" style={{ background: bar.emptyBarColor }}>
              <div
                style={{ width: `${bar.progress}%`, background: bar.progressedBarColor }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ease-in-out"
              ></div>
              {bar.milestones.map((milestone, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-2 w-2 rounded-full cursor-pointer"
                  style={{
                    background: bar.milestoneColor,
                    left: `${(i + 1) * (100 / (bar.milestones.length + 1))}%`,
                    transform: 'translateX(-50%)',
                  }}
                  title={milestone.name}
                  onClick={() => alert(milestone.name)}
                  aria-label={`Milestone ${milestone.name}`}
                ></div>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">
            {bar.progress < 25 && "Сделали первый шаг на пути к успеху!"}
            {bar.progress >= 25 && bar.progress < 50 && "Вы делаете успехи! Продолжайте в том же духе!"}
            {bar.progress >= 50 && bar.progress < 75 && "Вы уже на полпути! Отлично справляетесь"}
            {bar.progress >= 75 && bar.progress < 100 && "Вы почти там! Финишная прямая!"}
            {bar.progress === 100 && "Поздравляю! Вы завершили курс!"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default StudentProgressBar;