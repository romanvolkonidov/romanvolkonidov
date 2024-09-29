import React from 'react';
import { useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

// Performance Bar Components
const StudentPerformanceBar = ({ studentId, subject }) => {
  const data = useSelector(state => state.data);
  const studentData = data ? data.students.find(s => s.id === studentId) : null;
  
  if (!studentData) return <div>Loading...</div>;

  const performanceData = studentData.performance[subject];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>{`${studentData.name}'s ${subject} Performance`}</CardHeader>
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

export const JohnMathPerformance = () => (
  <StudentPerformanceBar studentId="john123" subject="math" />
);

export const EmilySciencePerformance = () => (
  <StudentPerformanceBar studentId="emily456" subject="science" />
);

// Schedule Components
const StudentSchedule = ({ studentId }) => {
  const data = useSelector(state => state.data);
  const studentData = data ? data.students.find(s => s.id === studentId) : null;
  
  if (!studentData) return <div>Loading...</div>;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>{`${studentData.name}'s Schedule`}</CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {studentData.schedule.map((item, index) => (
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

export const JohnSchedule = () => (
  <StudentSchedule studentId="john123" />
);

export const EmilySchedule = () => (
  <StudentSchedule studentId="emily456" />
);

// Teacher Recommendation Components
const TeacherRecommendation = ({ teacherId, category }) => {
  const data = useSelector(state => state.data);
  const teacherData = data ? data.teachers.find(t => t.id === teacherId) : null;
  
  if (!teacherData) return <div>Loading...</div>;

  const recommendations = teacherData.recommendations[category];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>{`${teacherData.name}'s ${category} Recommendations`}</CardHeader>
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

export const MsSmithReadingRecommendations = () => (
  <TeacherRecommendation teacherId="smith789" category="reading" />
);

export const MrJonesListeningRecommendations = () => (
  <TeacherRecommendation teacherId="jones101" category="listening" />
);

export const MsBrownOtherRecommendations = () => (
  <TeacherRecommendation teacherId="brown202" category="other" />
);