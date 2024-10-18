// public/service-worker.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyB_VsLZaaQ_m3WNVlPjfhy715BXo8ax004",
  authDomain: "tracking-budget-app.firebaseapp.com",
  projectId: "tracking-budget-app",
  storageBucket: "tracking-budget-app.appspot.com",
  messagingSenderId: "912992088190",
  appId: "1:912992088190:web:d5ea1a3157722b8feb282f"
});

const messaging = firebase.messaging();

const CACHE_NAME = 'student-dashboard-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-512x512.png',
  // Add other static assets your app uses
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Ensure the new service worker takes over immediately
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // If cached, return the cached version
        }
        return fetch(event.request).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response as it's a stream and can only be consumed once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.notification.body,
      icon: '/icons/icon-512x512.png',
      badge: '/icons/icon-512x512.png',
      data: {
        url: data.data?.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.notification.title, options)
    );
  } else {
    console.log('Push event received but no data.');
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-512x512.png',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

console.log('Service Worker loaded successfully.');