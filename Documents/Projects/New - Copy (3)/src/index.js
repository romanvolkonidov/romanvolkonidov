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

console.log('Checking service worker support...');

if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported');

  window.addEventListener('load', function() {
    console.log('Window loaded, attempting to register service worker...');

    navigator.serviceWorker.register('/service-worker.js').then(
      function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content is available and will be used when all tabs for this page are closed.');
                // You can optionally add logic here to notify the user about the update
              } else {
                console.log('Content is cached for offline use.');
              }
            }
          };
        };

        serviceWorkerRegistration.register({
          onUpdate: registration => {
            console.log('Service Worker update found!');
            const waitingServiceWorker = registration.waiting;
            if (waitingServiceWorker) {
              waitingServiceWorker.addEventListener("statechange", event => {
                if (event.target.state === "activated") {
                  console.log('New Service Worker activated, reloading page...');
                  window.location.reload();
                }
              });
              waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
            }
          },
          onSuccess: registration => {
            console.log('Service Worker registered successfully!');
          },
        });
      },
      function(err) {
        console.error('ServiceWorker registration failed: ', err);
      }
    ).catch(function(error) {
      console.error('Service worker registration error:', error);
    });
  });

} else {
  console.log('Service Worker is not supported');
}

// Function to check if service worker is controlling the page
const checkServiceWorkerStatus = () => {
  if (navigator.serviceWorker.controller) {
    console.log('This page is currently controlled by:', navigator.serviceWorker.controller);
  } else {
    console.log('This page is not currently controlled by a service worker.');
  }
};

// You can use this function to check service worker status at any time
window.checkSWStatus = checkServiceWorkerStatus;

// Additional debugging helpers
window.unregisterServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
        console.log('Service worker unregistered');
      } 
    });
  }
};

window.checkServiceWorkerRegistration = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(function(registration) {
      console.log('Current service worker:', registration);
    });
  }
};