import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const StudentProgressBar = ({ viewOnly, studentId }) => {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'studentProgress', studentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setBars(docSnap.data().bars);
      } else {
        const defaultBars = [{
          name: 'Default Bar',
          milestones: [],
          progress: 50,
          color: '#40E0D0',
          milestoneColor: '#000000',
          emptyBarColor: '#E0E0E0',
          progressedBarColor: '#40E0D0',
          showComments: true
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
    setBars(prevBars => [...prevBars, {
      name: 'New Bar',
      milestones: [],
      progress: 50,
      color: '#40E0D0',
      milestoneColor: '#000000',
      emptyBarColor: '#E0E0E0',
      progressedBarColor: '#40E0D0',
      showComments: true
    }]);
  };

  const removeBar = (index) => {
    setBars(prevBars => prevBars.filter((_, i) => i !== index));
  };

  const handleMilestonesChange = (index, milestones) => {
    setBars(prevBars => {
      const newBars = [...prevBars];
      newBars[index].milestones = Array.from({ length: milestones }, (_, i) => ({
        name: `Milestone ${i + 1}`,
      }));
      return newBars;
    });
  };

  const handleProgressChange = (index, value) => {
    setBars(prevBars => {
      const newBars = [...prevBars];
      newBars[index].progress = Math.max(0, Math.min(100, value));
      return newBars;
    });
  };

  const handleColorChange = (index, color, field) => {
    setBars(prevBars => {
      const newBars = [...prevBars];
      newBars[index][field] = color;
      return newBars;
    });
  };

  const handleBarNameChange = (index, name) => {
    setBars(prevBars => {
      const newBars = [...prevBars];
      newBars[index].name = name;
      return newBars;
    });
  };

  const handleCommentToggle = (index) => {
    console.log('Toggle function called for index:', index);
    setBars(prevBars => {
      const newBars = [...prevBars];
      newBars[index] = {
        ...newBars[index],
        showComments: !newBars[index].showComments
      };
      console.log('New state for bar:', newBars[index]);
      return newBars;
    });
  };

  useEffect(() => {
    console.log('Bars state updated:', bars);
  }, [bars]);

  const getEncouragingComment = (progress) => {
    if (progress < 25) return "Есть над чем поработать. Не отчаивайтесь!";
    if (progress < 50) return "Неплохое начало. Продолжайте стараться!";
    if (progress < 75) return "Хороший результат! Вы на верном пути.";
    if (progress < 100) return "Отличная работа! Почти идеально!";
    return "Великолепно! Максимальный балл!";
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <ToastContainer />
      <h2 className="text-3xl font-bold mb-6 text-center text-black">Ваши достижения</h2>
      {!viewOnly && (
        <button 
          onClick={addBar} 
          className="mb-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          Add Bar
        </button>
      )}
      <div className="space-y-8">
        <AnimatePresence>
          {bars.map((bar, index) => (
            <motion.div
              key={index}
              className="bg-gray-100 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {!viewOnly && (
                <div className="flex flex-wrap items-center justify-between mb-4 space-y-2">
                  <input
                    type="text"
                    value={bar.name}
                    onChange={(e) => handleBarNameChange(index, e.target.value)}
                    className="w-full md:w-auto mb-2 px-2 py-1 border border-gray-300 rounded text-black"
                    placeholder="Bar Name"
                  />
                  <input
                    type="number"
                    value={bar.milestones.length}
                    onChange={(e) => handleMilestonesChange(index, parseInt(e.target.value) || 0)}
                    className="w-20 mb-2 px-2 py-1 border border-gray-300 rounded text-black"
                    min="0"
                  />
                  <div className="flex flex-wrap items-center space-x-2 mb-2">
                    {['color', 'milestoneColor', 'emptyBarColor', 'progressedBarColor'].map((field) => (
                      <div key={field} className="flex flex-col items-center">
                        <label className="text-xs mb-1 text-black">{field}</label>
                        <input
                          type="color"
                          value={bar[field]}
                          onChange={(e) => handleColorChange(index, e.target.value, field)}
                          className="w-8 h-8"
                        />
                      </div>
                    ))}
                  </div>
                  <input
  type="checkbox"
  checked={bar.showComments}
  onChange={() => {
    console.log('Checkbox clicked, current state:', bar.showComments);
    handleCommentToggle(index);
  }}
  className="mr-2"
/>
                  <button 
                    onClick={() => removeBar(index)} 
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition w-full md:w-auto"
                  >
                    Remove Bar
                  </button>
                </div>
              )}
              <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-black mb-2 md:mb-0">{bar.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-black">Прогресс:</span>
                  <span className="text-lg font-bold text-black">{bar.progress}%</span>
                </div>
              </div>
              <div className="relative pt-1 w-full">
                {!viewOnly && (
                  <input
                    type="range"
                    value={bar.progress}
                    onChange={(e) => handleProgressChange(index, parseInt(e.target.value))}
                    min="0"
                    max="100"
                    step="1"
                    className="w-full mb-4"
                  />
                )}
                <div className="relative overflow-hidden h-6 mb-4 text-xs flex rounded-full" style={{ backgroundColor: bar.emptyBarColor }}>
                  <motion.div
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                    style={{ width: `${bar.progress}%`, backgroundColor: bar.progressedBarColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  {bar.milestones.map((milestone, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-0.5"
                      style={{
                        left: `${(i + 1) * (100 / (bar.milestones.length + 1))}%`,
                        backgroundColor: bar.milestoneColor,
                      }}
                      title={milestone.name}
                    >
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: bar.milestoneColor }} />
                    </div>
                  ))}
                </div>
              </div>
              <AnimatePresence>
                {bar.showComments && (
                  <motion.p
                    className="text-center text-black mt-4 italic"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {getEncouragingComment(bar.progress)}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default StudentProgressBar;