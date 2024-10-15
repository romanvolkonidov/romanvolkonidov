import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

// Import the main Homework component
import Homework from './homeworks/Homework';

// Import question sets
import ReviewWhQ from './homeworks/ReviewWhQ';
import SimplePresent from './homeworks/SimplePresent';
import HowLong from './homeworks/HowLong';
import ColorMarkers from './homeworks/ColorMarkers';

const HomeworkManagement = ({ onSelectHomework, onLaunchHomework, onCancel, mode = 'select' }) => {
  const [selectedHomework, setSelectedHomework] = useState('');
  const [homeworkList, setHomeworkList] = useState([]);

  useEffect(() => {
    // Now we're setting up the list with question sets instead of components
    setHomeworkList([
      { name: 'SimplePresent', questions: SimplePresent },
      { name: 'ReviewWhQ', questions: ReviewWhQ },
      { name: 'HowLong', questions: HowLong },
      { name: 'ColorMarkers', questions: ColorMarkers },
      // Add other homework question sets here
    ]);
  }, []);

  const handleSelectHomework = (value) => {
    setSelectedHomework(value);
  };

  const handleAddHomework = () => {
    const selected = homeworkList.find(hw => hw.name === selectedHomework);
    if (selected) {
      onSelectHomework(selected);
    }
  };

  const handleLaunchHomework = (homework) => {
    if (onLaunchHomework) {
      // Pass the Homework component and the selected questions to the parent
      onLaunchHomework({ component: Homework, props: { questions: homework.questions } });
    }
  };

  // Rest of the component remains the same...

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">
        {mode === 'select' ? 'Select Homework' : 'Launch Homework'}
      </h2>
      {mode === 'select' && (
        <>
          <Select onValueChange={handleSelectHomework} value={selectedHomework}>
            <SelectTrigger className="w-full mb-4" style={{backgroundColor: 'black'}}>
              <SelectValue style={{backgroundColor: 'black'}} placeholder="Choose a homework" />
            </SelectTrigger>
            <SelectContent>
              {homeworkList.map(hw => (
                <SelectItem key={hw.name} value={hw.name}>{hw.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-between">
            <Button onClick={handleAddHomework} disabled={!selectedHomework}>
              Add Selected Homework
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </>
      )}
      {mode === 'launch' && (
        <div className="space-y-2">
          {homeworkList.map(hw => (
            <div key={hw.name} className="flex justify-between items-center">
              <span>{hw.name}</span>
              <Button onClick={() => handleLaunchHomework(hw)}>
                Launch
              </Button>
            </div>
          ))}
          <Button onClick={onCancel} variant="outline" className="w-full mt-4">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default HomeworkManagement;