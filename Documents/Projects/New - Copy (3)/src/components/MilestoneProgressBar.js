import React, { useState, useEffect, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Slider } from "./ui/Slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { Checkbox } from './ui/Checkbox'; // Ensure Checkbox is imported


const MilestoneProgressBar = () => {
  const { setBroadcastedCharts } = useContext(GlobalStateContext);
  const [milestones, setMilestones] = useState([
    { description: "Start", reached: true, date: "2024-01-01" },
    { description: "Lesson 1", reached: false, date: "2024-02-01" },
    { description: "Lesson 2", reached: false, date: "2024-03-01" },
  ]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState("");
  const [horizontalProgress, setHorizontalProgress] = useState(0);
  const [horizontalProgressName, setHorizontalProgressName] = useState("Overall Progress");
  const [showHorizontalBar, setShowHorizontalBar] = useState(true);
  const [showMilestoneBar, setShowMilestoneBar] = useState(true);
  const [broadcastHorizontal, setBroadcastHorizontal] = useState(false);
  const [broadcastMilestone, setBroadcastMilestone] = useState(false);
  const [broadcastChart, setBroadcastChart] = useState(false);

  const handleMilestoneClick = (index) => {
    const updatedMilestones = milestones.map((milestone, i) => ({
      ...milestone,
      reached: i <= index
    }));
    setMilestones(updatedMilestones);
  };

  const addMilestone = (description, date) => {
    setMilestones([...milestones, { description, reached: false, date }]);
  };

  const handleEditMilestone = (index) => {
    setEditingIndex(index);
    setNewDescription(milestones[index].description);
    setNewDate(milestones[index].date);
  };

  const handleSaveMilestone = () => {
    const updatedMilestones = milestones.map((milestone, index) =>
      index === editingIndex ? { ...milestone, description: newDescription, date: newDate } : milestone
    );
    setMilestones(updatedMilestones);
    setEditingIndex(null);
    setNewDescription("");
    setNewDate("");
  };

  const handleHorizontalProgressChange = (value) => {
    setHorizontalProgress(value[0]);
  };

  const lastReachedIndex = milestones.reduce((lastIndex, milestone, index) => 
    milestone.reached ? index : lastIndex, -1
  );

  const fillPercentage = lastReachedIndex === -1 ? 0 : (lastReachedIndex / (milestones.length - 1)) * 100;

  const chartData = milestones.map((milestone, index) => ({
    name: milestone.description,
    progress: (index / (milestones.length - 1)) * 100,
    date: milestone.date,
  }));

  const handleBroadcastChange = (type, value) => {
    if (type === 'horizontal') {
      setBroadcastHorizontal(value);
    } else if (type === 'milestone') {
      setBroadcastMilestone(value);
    } else if (type === 'chart') {
      setBroadcastChart(value);
    }

    setBroadcastedCharts({
      horizontal: broadcastHorizontal ? { name: horizontalProgressName, progress: horizontalProgress } : null,
      milestone: broadcastMilestone ? { milestones, fillPercentage } : null,
      chart: broadcastChart ? chartData : null,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Milestone Progress Tracker</h1>

      <div className="mb-8">
        <Button 
          onClick={() => setShowHorizontalBar(!showHorizontalBar)}
          className="mb-4"
        >
          {showHorizontalBar ? "Hide" : "Show"} Overall Progress
          {showHorizontalBar ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
        </Button>
        
        {showHorizontalBar && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <Input
              value={horizontalProgressName}
              onChange={(e) => setHorizontalProgressName(e.target.value)}
              placeholder="Progress Name"
              className="mb-4"
            />
            <Slider
              value={[horizontalProgress]}
              onValueChange={handleHorizontalProgressChange}
              max={100}
              step={1}
              className="mb-2"
            />
            <div className="h-6 bg-gray-300 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${horizontalProgress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2">{horizontalProgress}% Complete</p>
            <Checkbox
              checked={broadcastHorizontal}
              onChange={(e) => handleBroadcastChange('horizontal', e.target.checked)}
              className="mt-2"
            >
              Broadcast
            </Checkbox>
          </div>
        )}
      </div>

      <div className="mb-8">
        <Button
          onClick={() => setShowMilestoneBar(!showMilestoneBar)}
          className="mb-4"
        >
          {showMilestoneBar ? "Hide" : "Show"} Milestone Progress
          {showMilestoneBar ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
        </Button>

        {showMilestoneBar && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="relative h-8 bg-gray-300 rounded-full mb-4">
              <div 
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${fillPercentage}%` }}
              ></div>
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="absolute top-1/2 transform -translate-y-1/2 cursor-pointer"
                  style={{ left: `${(index / (milestones.length - 1)) * 100}%` }}
                  onClick={() => handleMilestoneClick(index)}
                >
                  <div className={`w-6 h-6 rounded-full ${milestone.reached ? 'bg-green-500' : 'bg-red-500'} transition-all duration-300 ease-in-out hover:scale-110`}></div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md opacity-0 transition-opacity duration-300 pointer-events-none">
                    {milestone.description}
                    <br />
                    {milestone.date}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="New milestone description"
                className="mb-2"
              />
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="mb-2"
              />
              <Button onClick={() => addMilestone(newDescription, newDate)}>
                Add Milestone
              </Button>
            </div>

            <div>
              <Select onValueChange={(value) => handleEditMilestone(parseInt(value, 10))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select milestone to edit" />
                </SelectTrigger>
                <SelectContent>
                  {milestones.map((milestone, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {milestone.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {editingIndex !== null && (
                <div className="mt-4">
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Edit description"
                    className="mb-2"
                  />
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="mb-2"
                  />
                  <Button onClick={handleSaveMilestone}>Save Changes</Button>
                </div>
              )}
            </div>
            <Checkbox
              checked={broadcastMilestone}
              onChange={(e) => handleBroadcastChange('milestone', e.target.checked)}
              className="mt-2"
            >
              Broadcast
            </Checkbox>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Progress Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="progress" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
        <Checkbox
          checked={broadcastChart}
          onChange={(e) => handleBroadcastChange('chart', e.target.checked)}
          className="mt-2"
        >
          Broadcast
        </Checkbox>
      </div>
    </div>
  );
};

export default MilestoneProgressBar;