import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import Label from './ui/Label';
import Textarea from './ui/Textarea';
import { Button } from './ui/Button';
import Alert, { AlertDescription } from './ui/Alert';





const StudentFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('request');

  const addFeedback = () => {
    if (newFeedback.trim()) {
      setFeedbacks([...feedbacks, { id: Date.now(), type: feedbackType, text: newFeedback }]);
      setNewFeedback('');
    }
  };

  const deleteFeedback = (id) => {
    setFeedbacks(feedbacks.filter(feedback => feedback.id !== id));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Отзывы и пожелания студентов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="feedback-type">Тип сообщения</Label>
            <select
              id="feedback-type"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="request">Пожелание</option>
              <option value="review">Отзыв</option>
            </select>
          </div>
          <div>
            <Label htmlFor="new-feedback">Ваше сообщение</Label>
            <Textarea
              id="new-feedback"
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder={feedbackType === 'request' ? "Введите ваше пожелание..." : "Введите ваш отзыв..."}
              rows={4}
            />
          </div>
          <Button onClick={addFeedback} className="w-full">Отправить</Button>
        </div>

        {feedbacks.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Ваши сообщения:</h3>
            {feedbacks.map((feedback) => (
              <Alert key={feedback.id} className="flex justify-between items-start">
                <AlertDescription>
                  <strong>{feedback.type === 'request' ? 'Пожелание: ' : 'Отзыв: '}</strong>
                  {feedback.text}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteFeedback(feedback.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentFeedback;