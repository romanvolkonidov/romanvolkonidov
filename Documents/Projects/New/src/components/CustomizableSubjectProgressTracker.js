import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, XCircle, Edit } from 'lucide-react'

const CustomizableSubjectProgressTracker = () => {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Math', progress: 0 }
  ]);
  const [currentSubject, setCurrentSubject] = useState(1);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);

  const handleProgressChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setSubjects(subjects.map(subject => 
        subject.id === currentSubject ? { ...subject, progress: value } : subject
      ));
    }
  };

  const addSubject = () => {
    if (newSubjectName.trim()) {
      setSubjects([...subjects, { id: Date.now(), name: newSubjectName, progress: 0 }]);
      setNewSubjectName('');
    }
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
    if (currentSubject === id && subjects.length > 1) {
      setCurrentSubject(subjects[0].id);
    }
  };

  const startEditingSubject = (id) => {
    setEditingSubject(id);
  };

  const finishEditingSubject = (id, newName) => {
    setSubjects(subjects.map(subject => 
      subject.id === id ? { ...subject, name: newName } : subject
    ));
    setEditingSubject(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Customizable Subject Progress Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select 
            value={currentSubject.toString()} 
            onValueChange={(value) => setCurrentSubject(parseInt(value, 10))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {subjects.map(subject => (
            subject.id === currentSubject && (
              <div key={subject.id} className="space-y-2">
                <Progress value={subject.progress} className="w-full h-4" />
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={subject.progress}
                    onChange={handleProgressChange}
                    min="0"
                    max="100"
                    className="w-20"
                  />
                  <span className="text-lg font-semibold">% Complete</span>
                </div>
              </div>
            )
          ))}

          <div className="space-y-2">
            <div className="font-semibold">Manage Subjects:</div>
            {subjects.map(subject => (
              <div key={subject.id} className="flex items-center space-x-2">
                {editingSubject === subject.id ? (
                  <Input
                    value={subject.name}
                    onChange={(e) => finishEditingSubject(subject.id, e.target.value)}
                    onBlur={() => setEditingSubject(null)}
                    autoFocus
                  />
                ) : (
                  <span>{subject.name}</span>
                )}
                <Button size="icon" variant="ghost" onClick={() => startEditingSubject(subject.id)}>
                  <Edit size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeSubject(subject.id)} disabled={subjects.length === 1}>
                  <XCircle size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Input
              placeholder="New subject name"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
            />
            <Button onClick={addSubject}>
              <PlusCircle size={16} className="mr-2" /> Add Subject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomizableSubjectProgressTracker;