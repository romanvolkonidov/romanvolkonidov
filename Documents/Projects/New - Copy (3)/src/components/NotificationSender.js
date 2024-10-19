import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { requestNotificationPermission, updateUserFCMToken } from '../firebase';

const NotificationSender = ({ studentId }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = () => {
      const isAdminUser = localStorage.getItem('isAdmin') === 'true';
      setIsAdmin(isAdminUser);
    };

    const fetchNotificationStatus = async () => {
      try {
        const docRef = doc(db, 'students', studentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNotificationsEnabled(docSnap.data().pushNotificationsEnabled || false);
        }
      } catch (error) {
        console.error('Error fetching notification status:', error);
      }
    };

    checkAdminStatus();
    fetchNotificationStatus();
  }, [studentId]);

  const handleToggleNotifications = async () => {
    try {
      const newStatus = !notificationsEnabled;
      setNotificationsEnabled(newStatus);
      
      if (newStatus) {
        const token = await requestNotificationPermission(studentId);
        if (token) {
          await updateUserFCMToken(studentId, token);
        } else {
          throw new Error('Не удалось получить разрешение на уведомления');
        }
      }

      await updateDoc(doc(db, 'students', studentId), {
        pushNotificationsEnabled: newStatus
      });

      setError('');
    } catch (error) {
      console.error('Error toggling notifications:', error);
      setError('Не удалось обновить настройки уведомлений');
      setNotificationsEnabled(!newStatus); // Revert the toggle if there's an error
    }
  };

  const handleSendNotification = async () => {
    if (!title || !body) {
      setError('Пожалуйста, заполните заголовок и текст уведомления');
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch('https://us-central1-tracking-budget-app.cloudfunctions.net/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: studentId,
          title,
          body,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTitle('');
        setBody('');
      } else {
        throw new Error(result.error || 'Не удалось отправить уведомление');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setSending(false);
    }
  };

  // Check if the current path starts with "/student/"
  const isAdminView = location.pathname.startsWith('/student/');

  if (isAdmin && isAdminView) {
    return (
      <>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Отправить уведомление студенту</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Заголовок уведомления"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Текст уведомления"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
              />
              <Button onClick={handleSendNotification} disabled={sending}>
                {sending ? 'Отправка...' : 'Отправить уведомление'}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Уведомления</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>{notificationsEnabled ? 'Включены' : 'Выключены'}</span>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
              />
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
        </Card>
      </>
    );
  }

  return null; // Return null for admin on non-student pages
};

export default NotificationSender;