import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the default service worker for PWA functionality
serviceWorkerRegistration.register();

// Function to check if service worker is controlling the page
const checkServiceWorkerStatus = () => {
  if (navigator.serviceWorker.controller) {
    console.log('This page is currently controlled by:', navigator.serviceWorker.controller);
  } else {
    console.log('This page is not currently controlled by a service worker.');
  }
};

// Register the Firebase Cloud Messaging service worker only in production
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Firebase Cloud Messaging SW registered with scope:', registration.scope);
        checkServiceWorkerStatus();
      })
      .catch((error) => {
        console.error('Firebase Cloud Messaging SW registration failed:', error);
      });
  });
} else {
  console.log('Firebase Cloud Messaging SW not registered (development environment or service workers not supported)');
}

// You can use this function to check service worker status at any time
window.checkSWStatus = checkServiceWorkerStatus;