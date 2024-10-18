import React, { useEffect, useState, useCallback } from 'react';
import { onMessageListener, requestNotificationPermission } from '../firebase';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import Navbar from './Navbar';
import Home from './Home';
import MonthlyReport from './MonthlyReport';
import StudentManagement from './StudentManagement';
import StudentPage from './StudentPage';
import SVGInvoiceGenerator from './SVGInvoiceGenerator';
import StudentDashboard from './StudentDashboard';
import Progress from './Progress';
import ViewOnlyProgressBars from './ViewOnlyProgressBars';
import Library from './Library';
import SetPassword from './SetPassword';
import Login from './Login';
import AdminLogin from './AdminLogin';
import ProtectedRoute from './ProtectedRoute';
import InstallPWA from './InstallPWA';
import { toast } from 'react-toastify';

function AppContent() {
  const { authenticatedStudent } = useGlobalState();
  const [notificationStatus, setNotificationStatus] = useState('idle');

  useEffect(() => {
    if (authenticatedStudent) {
      requestNotificationPermission(authenticatedStudent.id)
        .then((token) => {
          if (token) {
            setNotificationStatus('granted');
          } else {
            setNotificationStatus('denied');
          }
        })
        .catch((error) => {
          console.error('Error requesting notification permission:', error);
          setNotificationStatus('error');
        });
    }
  }, [authenticatedStudent]);

  const handleMessage = useCallback((payload) => {
    console.log('Received foreground message:', payload);
    toast.info(payload.notification.title, {
      body: payload.notification.body
    });
  }, []);

  useEffect(() => {
    const messageListener = onMessageListener().then(handleMessage).catch(err => {
      console.error('Failed to set up message listener:', err);
    });

    return () => {
      if (messageListener && typeof messageListener.then === 'function') {
        messageListener.then(unsubscribe => unsubscribe());
      }
    };
  }, [handleMessage]);

  return (
    <>
      <Navbar />
      <div className="app main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/dashboard/:id" element={<StudentDashboard />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/monthly-report" element={<MonthlyReport />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/student/:id" element={<StudentPage />} />
            <Route path="/invoice-generator" element={<SVGInvoiceGenerator />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/ViewOnlyProgressBars" element={<ViewOnlyProgressBars />} />
            <Route path="/Library" element={<Library />} />
            <Route path="/set-password" element={<SetPassword />} />
          </Route>
          <Route element={<ProtectedRoute adminOnly={true} />}>
            {/* Add admin-only routes here if needed */}
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        
        <InstallPWA />
      </div>
    </>
  );
}

export default AppContent;