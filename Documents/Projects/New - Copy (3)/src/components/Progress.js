import React, { useState, useContext } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';

function Progress() {
  const { students, saveStudentProgress } = useContext(GlobalStateContext);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isTeacherView, setIsTeacherView] = useState(true);
  const [selectedProgressBars, setSelectedProgressBars] = useState([]);
  const [progressValues, setProgressValues] = useState({});

  // Function to handle progress bar selection
  const handleProgressBarSelection = (barId) => {
    setSelectedProgressBars((prevBars) => {
      if (prevBars.includes(barId)) {
        return prevBars.filter((id) => id !== barId);
      } else {
        return [...prevBars, barId];
      }
    });
  };

  // Function to handle progress value input
  const handleProgressValueChange = (barId, value) => {
    setProgressValues((prevValues) => ({
      ...prevValues,
      [barId]: value,
    }));
  };

  // Function to handle saving progress data
  const handleSaveProgress = () => {
    if (!selectedStudent) {
      console.log('Please select a student.');
      return;
    }

    saveStudentProgress({
      studentId: selectedStudent,
      progressBars: selectedProgressBars,
      progressValues: progressValues,
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <button
          onClick={() => setIsTeacherView(true)}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            marginRight: '8px',
          }}
        >
          Teacher View
        </button>
        <button
          onClick={() => setIsTeacherView(false)}
          style={{
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Student View
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="studentSelect" style={{ display: 'block', marginBottom: '4px' }}>
          Select Student:
        </label>
        <select
          id="studentSelect"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      {isTeacherView && selectedStudent && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Teacher View</h2>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'semibold', marginBottom: '8px' }}>Progress Bar Selection</h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
              {progressBars.map((bar) => (
                <li key={bar.id} style={{ marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    id={`bar-${bar.id}`}
                    checked={selectedProgressBars.includes(bar.id)}
                    onChange={() => handleProgressBarSelection(bar.id)}
                    style={{ marginRight: '4px' }}
                  />
                  <label htmlFor={`bar-${bar.id}`}>{bar.name}</label>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'semibold', marginBottom: '8px' }}>Enter Progress Values</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #ccc' }}>Progress Bar</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {selectedProgressBars.map((barId) => {
                  const bar = progressBars.find((bar) => bar.id === barId);
                  return (
                    <tr key={bar.id}>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{bar.name}</td>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={progressValues[barId] || ''}
                          onChange={(e) => handleProgressValueChange(barId, e.target.value)}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSaveProgress}
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Save Progress & Bars
          </button>
        </div>
      )}

      {!isTeacherView && selectedStudent && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Student View</h2>
          {/* Display student progress using selected progress bars */}
          {/* ... (code for displaying progress bars) */}
        </div>
      )}
    </div>
  );
}

export default Progress;