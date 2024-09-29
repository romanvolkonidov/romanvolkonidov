import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

// Performance Bar Components
const StudentPerformanceBar = ({ performanceData, studentName, subject }) => {
  if (!performanceData || performanceData.length === 0) return <div>No performance data available.</div>;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>{`${studentName}'s ${subject} Performance`}</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Schedule Components
const StudentSchedule = ({ scheduleData, studentName }) => {
  if (!scheduleData || scheduleData.length === 0) return <div>No schedule data available.</div>;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>{`${studentName}'s Schedule`}</CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {scheduleData.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.time}</span>
              <span>{item.subject}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

// Teacher Recommendation Components
const TeacherRecommendation = ({ recommendations, teacherName, category }) => {
  if (!recommendations || recommendations.length === 0) return <div>No recommendations available.</div>;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>{`${teacherName}'s ${category} Recommendations`}</CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recommendations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

// Parent Component with manual data entry
const CustomizableSubjectProgressTracker = () => {
  // State for student data
  const [studentName, setStudentName] = useState('John Doe');
  const [subject, setSubject] = useState('Math');
  const [performanceData, setPerformanceData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);

  // State for teacher data
  const [teacherName, setTeacherName] = useState('Ms. Smith');
  const [recommendationCategory, setRecommendationCategory] = useState('reading');
  const [recommendations, setRecommendations] = useState([]);

  // Handler to add performance data manually
  const addPerformanceData = () => {
    const date = prompt('Enter the date (YYYY-MM-DD):');
    const score = prompt('Enter the score:');
    setPerformanceData([...performanceData, { date, score: parseInt(score) }]);
  };

  // Handler to add schedule data manually
  const addScheduleData = () => {
    const time = prompt('Enter the time (e.g., 09:00 AM):');
    const subject = prompt('Enter the subject:');
    setScheduleData([...scheduleData, { time, subject }]);
  };

  // Handler to add recommendations manually
  const addRecommendation = () => {
    const recommendation = prompt('Enter a recommendation:');
    setRecommendations([...recommendations, recommendation]);
  };

  return (
    <div>
      {/* Student Performance Section */}
      <StudentPerformanceBar performanceData={performanceData} studentName={studentName} subject={subject} />
      <button onClick={addPerformanceData}>Add Performance Data</button>

      {/* Student Schedule Section */}
      <StudentSchedule scheduleData={scheduleData} studentName={studentName} />
      <button onClick={addScheduleData}>Add Schedule Data</button>

      {/* Teacher Recommendations Section */}
      <TeacherRecommendation recommendations={recommendations} teacherName={teacherName} category={recommendationCategory} />
      <button onClick={addRecommendation}>Add Recommendation</button>

      {/* Manual inputs to change student or teacher */}
      <div>
        <h3>Update Student Information</h3>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Enter student name"
        />
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject"
        />
      </div>

      <div>
        <h3>Update Teacher Information</h3>
        <input
          type="text"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          placeholder="Enter teacher name"
        />
        <input
          type="text"
          value={recommendationCategory}
          onChange={(e) => setRecommendationCategory(e.target.value)}
          placeholder="Enter recommendation category"
        />
      </div>
    </div>
  );
};

export default CustomizableSubjectProgressTracker;
