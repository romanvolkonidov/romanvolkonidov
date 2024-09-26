import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/Slider";
import { collection, getDocs, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';

const StudentProgressBar = ({ viewOnly, studentId }) => {
  const [bars, setBars] = useState([]);
  const [milestoneName, setMilestoneName] = useState('');
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(null);
  const [barNameInput, setBarNameInput] = useState('');

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const barsSnapshot = await getDocs(collection(db, 'studentProgressBars', studentId, 'bars'));
        const barsData = barsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBars(barsData);
      } catch (error) {
        console.error("Error fetching bars:", error);
      }
    };

    fetchBars();
  }, [studentId]);

  useEffect(() => {
    const saveBars = async () => {
      try {
        const batch = writeBatch(db);
        bars.forEach(bar => {
          const barRef = bar.id ? doc(db, 'studentProgressBars', studentId, 'bars', bar.id) : doc(collection(db, 'studentProgressBars', studentId, 'bars'));
          batch.set(barRef, bar);
        });
        await batch.commit();
      } catch (error) {
        console.error("Error saving bars:", error);
      }
    };

    if (bars.length > 0) {
      saveBars();
    }
  }, [bars, studentId]);

  const addBar = () => {
    const newBars = [...bars, { name: '', milestones: [], progress: 50, color: '#40E0D0', barColor: '#b2f5ea', dotColor: '#000000' }];
    setBars(newBars);
  };

  const removeBar = async (index) => {
    const barToRemove = bars[index];
    if (barToRemove.id) {
      await deleteDoc(doc(db, 'studentProgressBars', studentId, 'bars', barToRemove.id));
    }
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
    newBars[index].progress = value[0];
    if (newBars[index].progress < 0) newBars[index].progress = 0;
    if (newBars[index].progress > 100) newBars[index].progress = 100;
    setBars(newBars);
  };

  const handleColorChange = (index, color) => {
    const newBars = [...bars];
    newBars[index].color = color;
    setBars(newBars);
  };

  const handleBarColorChange = (index, color) => {
    const newBars = [...bars];
    newBars[index].barColor = color;
    setBars(newBars);
  };

  const handleDotColorChange = (index, color) => {
    const newBars = [...bars];
    newBars[index].dotColor = color;
    setBars(newBars);
  };

  const handleMilestoneNameChange = (barIndex, milestoneIndex, name) => {
    const newBars = [...bars];
    newBars[barIndex].milestones[milestoneIndex].name = name;
    setBars(newBars);
  };

  const handleUpdateMilestoneName = (index) => {
    if (selectedMilestoneIndex !== null) {
      handleMilestoneNameChange(index, selectedMilestoneIndex, milestoneName);
      setMilestoneName('');
    }
  };

  const handleBarNameChange = (index, name) => {
    const newBars = [...bars];
    newBars[index].name = name;
    setBars(newBars);
  };

  const handleUpdateBarName = (index) => {
    handleBarNameChange(index, barNameInput);
    setBarNameInput('');
  };

  return (
    <div style={{ width: '100%', padding: '16px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', color: '#2d3748' }}>Успехи</h2>
      {!viewOnly && (
        <>
          <button onClick={addBar} style={{ marginBottom: '16px', padding: '8px', backgroundColor: '#4299e1', color: 'white', borderRadius: '8px' }}>Add Bar</button>
        </>
      )}
      {bars.map((bar, index) => (
        <div key={index} style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center', color: '#2d3748' }}>{bar.name || 'Unnamed Bar'}</h3>
          {!viewOnly && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ marginBottom: '8px', fontWeight: 'bold' }}>Bar Name:</label>
              <input
                type="text"
                placeholder="Bar Name"
                value={barNameInput}
                onChange={(e) => setBarNameInput(e.target.value)}
                style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px', width: '100%' }}
              />
              <button onClick={() => handleUpdateBarName(index)} style={{ padding: '8px', backgroundColor: '#48bb78', color: 'white', borderRadius: '8px', marginBottom: '8px' }}>Update</button>
              <input
                type="number"
                value={bar.milestones.length}
                onChange={(e) => handleMilestonesChange(index, parseInt(e.target.value))}
                style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px' }}
                min="0"
              />
              <Slider
                defaultValue={[bar.progress]}
                max={100}
                step={1}
                onValueChange={(value) => handleProgressChange(index, value)}
                style={{ marginBottom: '8px' }}
              />
              <input
                type="color"
                value={bar.color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px' }}
              />
              <input
                type="color"
                value={bar.barColor}
                onChange={(e) => handleBarColorChange(index, e.target.value)}
                style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px' }}
              />
              <input
                type="color"
                value={bar.dotColor}
                onChange={(e) => handleDotColorChange(index, e.target.value)}
                style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px' }}
              />
              <button onClick={() => removeBar(index)} style={{ padding: '8px', backgroundColor: '#f56565', color: 'white', borderRadius: '8px' }}>Remove Bar</button>
            </div>
          )}
          <div style={{ position: 'relative', paddingTop: '4px', width: '100%' }}>
            <div style={{ display: 'flex', marginBottom: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', display: 'inline-block', padding: '4px 8px', borderRadius: '12px', color: '#319795', backgroundColor: '#b2f5ea' }}>
                  Progress
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', display: 'inline-block', color: '#319795' }}>
                  {bar.progress}%
                </span>
              </div>
            </div>
            <div style={{ overflow: 'hidden', height: '8px', marginBottom: '16px', fontSize: '12px', display: 'flex', borderRadius: '8px', backgroundColor: bar.barColor, position: 'relative', width: '100%' }}>
              <div
                style={{ width: `${bar.progress}%`, backgroundColor: bar.color, boxShadow: 'none', display: 'flex', flexDirection: 'column', textAlign: 'center', whiteSpace: 'nowrap', color: 'white', justifyContent: 'center', transition: 'all 0.5s ease-in-out' }}
              ></div>
              {bar.milestones.map((milestone, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '0',
                    height: '8px',
                    width: '8px',
                    backgroundColor: bar.dotColor,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    left: `${(i + 1) * (100 / (bar.milestones.length + 1))}%`,
                    transform: 'translateX(-50%)',
                  }}
                  title={milestone.name}
                  onClick={() => alert(milestone.name)}
                ></div>
              ))}
            </div>
            {!viewOnly && bar.milestones.length > 0 && (
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <select
                  onChange={(e) => {
                    const [milestoneIndex, name] = e.target.value.split('-');
                    setSelectedMilestoneIndex(parseInt(milestoneIndex));
                  }}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px', width: '100%' }}
                >
                  <option value="">Select Milestone</option>
                  {bar.milestones.map((milestone, i) => (
                    <option key={i} value={`${i}-${milestone.name}`}>
                      {milestone.name}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Rename milestone"
                    value={milestoneName}
                    onChange={(e) => setMilestoneName(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px', flex: '1' }}
                  />
                  <button
                    onClick={() => handleUpdateMilestoneName(index)}
                    style={{ padding: '8px', backgroundColor: '#48bb78', color: 'white', borderRadius: '8px', marginLeft: '8px' }}
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
          <p style={{ textAlign: 'center', color: '#718096', marginTop: '16px' }}>
            {bar.progress < 25 && "Just getting started! Keep going!"}
            {bar.progress >= 25 && bar.progress < 50 && "You're making progress! Keep it up!"}
            {bar.progress >= 50 && bar.progress < 75 && "Halfway there! You're doing great!"}
            {bar.progress >= 75 && bar.progress < 100 && "Almost there! You're nearly finished!"}
            {bar.progress === 100 && "Congratulations! You've completed the course!"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StudentProgressBar;