import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import { AlertCircle, Send, Bell } from 'lucide-react';
import { Alert, AlertDescription } from './ui/Alert';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, messaging, requestNotificationPermission } from '../firebase';
import { toast } from 'react-toastify';

const NotificationManager = ({ studentId, isAdminView }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState({
    enabled: false,
    loading: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    console.log(`NotificationManager mounted. studentId: ${studentId}, isAdminView: ${isAdminView}`);
    
    if (!studentId) {
      console.error('No studentId provided to NotificationManager');
      setError('No student ID provided');
      setNotificationStatus({ enabled: false, loading: false });
      return;
    }

    let unsubscribe;

    const fetchData = async () => {
      try {
        const docRef = doc(db, 'students', studentId);
        unsubscribe = onSnapshot(docRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const isEnabled = !!data.pushNotificationsEnabled;
            console.log(`Firestore update for student ${studentId}: pushNotificationsEnabled = ${isEnabled} (isAdminView: ${isAdminView})`);
            setNotificationStatus({
              enabled: isEnabled,
              loading: false,
            });
            setError('');
          } else {
            console.error(`Student document not found for ID: ${studentId}`);
            setError('Student document not found');
            setNotificationStatus({ enabled: false, loading: false });
          }
        }, (err) => {
          console.error(`Error setting up real-time listener for student ${studentId}:`, err);
          setError(`Failed to listen for notification status updates: ${err.message}`);
          setNotificationStatus({ enabled: false, loading: false });
        });
      } catch (err) {
        console.error(`Error in fetchData for student ${studentId}:`, err);
        setError(`Failed to set up notification status listener: ${err.message}`);
        setNotificationStatus({ enabled: false, loading: false });
      }
    };

    fetchData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [studentId, isAdminView]);

  const toggleNotifications = async () => {
    if (!studentId) {
      setError('No student ID provided');
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'students', studentId);
      
      const newStatus = !notificationStatus.enabled;
      
      if (newStatus) {
        // Enabling notifications
        const token = await requestNotificationPermission();
        if (!token) {
          throw new Error('Failed to obtain notification permission');
        }
        await updateDoc(docRef, {
          fcmToken: token,
          pushNotificationsEnabled: true
        });
      } else {
        // Disabling notifications
        await updateDoc(docRef, {
          fcmToken: null,
          pushNotificationsEnabled: false
        });
      }
      
      console.log(`Notifications ${newStatus ? 'enabled' : 'disabled'} for student ${studentId}`);
      toast.success(`Push notifications ${newStatus ? 'enabled' : 'disabled'} successfully!`);
      setError('');
    } catch (error) {
      console.error(`Error toggling notifications for student ${studentId}:`, error);
      setError(`Failed to ${notificationStatus.enabled ? 'disable' : 'enable'} notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!studentId) {
      setError('No student ID provided');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch('https://sendnotification-35666ugduq-uc.a.run.app', {
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
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }
  
      const result = await response.json();
      console.log(`Notification sent to student ${studentId}. Result:`, result);
  
      toast.success('Notification sent successfully!');
      setTitle('');
      setBody('');
      setError('');
    } catch (err) {
      console.error(`Error sending notification to student ${studentId}:`, err);
      setError(`Error sending notification: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  console.log(`Rendering NotificationManager for student ${studentId}. Notifications enabled: ${notificationStatus.enabled} (isAdminView: ${isAdminView})`);

  if (!studentId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No student ID provided. Unable to manage notifications.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-6">
      <CardHeader>
        <h2 className="text-2xl font-bold">
          {isAdminView ? `Send Push Notification (Student ID: ${studentId})` : 'Notification Settings'}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isAdminView && (
            <Alert variant="info">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Admin view for student ID: {studentId}
              </AlertDescription>
            </Alert>
          )}
          {isAdminView && notificationStatus.enabled && (
            <>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification Title"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Notification Message"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </>
          )}
          <Alert variant={notificationStatus.enabled ? "success" : "warning"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {notificationStatus.loading 
                ? "Checking notification status..." 
                : `Push notifications are ${notificationStatus.enabled ? 'enabled' : 'not enabled'} for this user.`
              }
            </AlertDescription>
          </Alert>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isAdminView ? (
          notificationStatus.enabled && (
            <Button
              onClick={sendNotification}
              disabled={loading || !title || !body}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Notification'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          )
        ) : (
          <Button 
            onClick={toggleNotifications} 
            disabled={loading || notificationStatus.loading} 
            className="w-full"
          >
            {loading ? 'Updating...' : (notificationStatus.enabled ? 'Disable' : 'Enable') + ' Push Notifications'}
            <Bell className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default NotificationManager;