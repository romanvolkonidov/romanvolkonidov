import React, { useEffect, useState } from 'react';

const OneSignalComponent = ({ studentId, studentName }) => {
  const [status, setStatus] = useState('Loading OneSignal script...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if OneSignal is already loaded and initialized
    if (window.OneSignal && window.OneSignal.initialized) {
      console.log('OneSignal already initialized');
      setStatus('OneSignal already initialized');
      updateUserInfo(window.OneSignal, studentId, studentName);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    
    script.onload = () => {
      console.log('OneSignal script loaded successfully');
      setStatus('OneSignal script loaded, initializing...');
      
      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(async function() {
        try {
          const appId = window.location.hostname === 'localhost' 
            ? '229f6e53-3885-4a7e-9ab4-606f697390fa'
            : '3c1840ed-f029-4b13-9832-c2692abf66f4';

          await window.OneSignal.init({ appId });
          console.log('OneSignal initialized successfully');
          setStatus('OneSignal initialized');
          window.OneSignal.initialized = true;

          updateUserInfo(window.OneSignal, studentId, studentName);

          // Prompt for push notifications
          const isPushSupported = await window.OneSignal.isPushNotificationsSupported();
          if (isPushSupported) {
            const permission = await window.OneSignal.getNotificationPermission();
            if (permission !== 'granted') {
              await window.OneSignal.showSlidedownPrompt();
            }
          }
        } catch (error) {
          console.error('Error initializing OneSignal:', error);
          setStatus('Error initializing OneSignal');
          setError(error.message || 'Unknown error occurred');
        }
      });
    };

    script.onerror = (event) => {
      console.error('Failed to load OneSignal script', event);
      setStatus('Failed to load OneSignal script');
      setError('Script loading error');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [studentId, studentName]);

  const updateUserInfo = async (OneSignal, studentId, studentName) => {
    if (studentId) {
      try {
        await OneSignal.setExternalUserId(studentId);
        console.log('Set external user ID:', studentId);
        
        await OneSignal.sendTags({
          student_id: studentId,
          student_name: studentName || 'Unknown'
        });
        console.log('Set tags for student:', studentId);
      } catch (error) {
        console.error('Error updating user info:', error);
      }
    }
  };

  return (
    <div>
      <p>{status}</p>
      {error && <p>Error: {error}</p>}
      <div className="onesignal-customlink-container"></div>
    </div>
  );
};

export default OneSignalComponent;