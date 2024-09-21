import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Label from '../ui/Label'; 
import { Star, Trophy, Flag } from 'lucide-react';

const KidsProgressTracker = ({ viewOnly }) => {
  const [progress, setProgress] = useState(() => {
    const savedProgress = localStorage.getItem('kidsProgress');
    return savedProgress ? JSON.parse(savedProgress) : 0;
  });

  const [milestones, setMilestones] = useState(() => {
    const savedMilestones = localStorage.getItem('kidsMilestones');
    return savedMilestones ? JSON.parse(savedMilestones) : 5;
  });

  const [stars, setStars] = useState(0);

  useEffect(() => {
    const newStars = Math.floor(progress / (100 / milestones));
    setStars(newStars);
  }, [progress, milestones]);

  useEffect(() => {
    localStorage.setItem('kidsProgress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('kidsMilestones', JSON.stringify(milestones));
  }, [milestones]);

  const handleProgressChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setProgress(value);
    }
  };

  const handleMilestonesChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 10) {
      setMilestones(value);
    }
  };

  const renderStars = () => {
    return Array(milestones).fill().map((_, i) => (
      <Star 
        key={i} 
        className={`transition-all duration-300 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        size={24} 
      />
    ));
  };

  const renderMilestones = () => {
    return Array(milestones).fill().map((_, i) => {
      const milestoneProgress = ((i + 1) / milestones) * 100;
      return (
        <Flag 
          key={i}
          className={`absolute transition-all duration-300 ${progress >= milestoneProgress ? 'text-green-500' : 'text-gray-300'}`}
          style={{ left: `${milestoneProgress}%`, transform: 'translateX(-50%)' }}
          size={20}
        />
      );
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-white">My Learning Adventure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-pink-600">
                Progress
              </div>
              <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-white">
                {progress}%
              </div>
            </div>
            <div className="overflow-hidden h-6 mb-4 text-xs flex rounded bg-pink-200 relative">
              <div 
                style={{ width: `${progress}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500 transition-all duration-500"
              ></div>
              {renderMilestones()}
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            {renderStars()}
          </div>

          {!viewOnly && (
            <>
              <div className="space-y-2">
                <Label htmlFor="progress" className="text-white">Your Progress:</Label>
                <Input
                  id="progress"
                  type="number"
                  value={progress}
                  onChange={handleProgressChange}
                  min="0"
                  max="100"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="milestones" className="text-white">Number of Milestones:</Label>
                <Input
                  id="milestones"
                  type="number"
                  value={milestones}
                  onChange={handleMilestonesChange}
                  min="1"
                  max="10"
                  className="text-lg"
                />
              </div>
            </>
          )}

          {progress >= 100 && (
            <div className="text-center animate-bounce">
              <Trophy className="inline-block text-yellow-400" size={48} />
              <p className="text-xl font-bold text-white">Congratulations! You've reached your goal!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KidsProgressTracker;
