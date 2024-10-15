importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB_VsLZaaQ_m3WNVlPjfhy715BXo8ax004",
  authDomain: "tracking-budget-app.firebaseapp.com",
  projectId: "tracking-budget-app",
  storageBucket: "tracking-budget-app.appspot.com",
  messagingSenderId: "912992088190",
  appId: "1:912992088190:web:d5ea1a3157722b8feb282f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});