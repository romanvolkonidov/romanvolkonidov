import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import MonthlyReport from './components/MonthlyReport';
import StudentManagement from './components/StudentManagement';
import StudentPage from './components/StudentPage';
import EventsPage from './components/EventsPage';
import Navbar from './components/Navbar';
import { GlobalStateProvider } from './context/GlobalStateContext';
import { VisibilityProvider } from './context/VisibilityContext'; // Import the VisibilityProvider
import SVGInvoiceGenerator from './components/SVGInvoiceGenerator';
import StudentDashboard from './components/StudentDashboard';
import Progress from './components/Progress';
import Test from './components/Test';
import ViewOnlyProgressBars from './components/ViewOnlyProgressBars';
import Library from './components/Library';
import SetPassword from './components/SetPassword';
import Login from './components/Login'; // Import the Login component
import AdminLogin from './components/AdminLogin'; // Import the AdminLogin component
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import ErrorBoundary from './components/ErrorBoundary'

import './styles/App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      const installButton = document.getElementById('install-button');
      installButton.style.display = 'block';

      installButton.addEventListener('click', () => {
        installButton.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
          deferredPrompt = null;
        });
      });
    });
  }, []);

  return (
    <ErrorBoundary>
    <GlobalStateProvider>
      <VisibilityProvider>
        <Router>
          <Navbar />
          <div className="app main-content">
            <Routes>
              <Route path="/login" element={<Login />} /> {/* Student Login route */}
              <Route path="/admin-login" element={<AdminLogin />} /> {/* Admin Login route */}
              <Route path="/dashboard" element={<StudentDashboard />} /> {/* Student Dashboard route */}
              <Route path="/dashboard/:id" element={<StudentDashboard />} /> {/* Student Dashboard route */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/monthly-report" element={<MonthlyReport />} />
                <Route path="/students" element={<StudentManagement />} />
                <Route path="/student/:id" element={<StudentPage />} />
                <Route path="/student-events" element={<EventsPage />} />
                <Route path="/invoice-generator" element={<SVGInvoiceGenerator />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/test" element={<Test />} />
                <Route path="/ViewOnlyProgressBars" element={<ViewOnlyProgressBars />} />
                <Route path="/Library" element={<Library />} />
                <Route path="/set-password" element={<SetPassword />} />
              </Route>
              <Route element={<ProtectedRoute adminOnly={true} />}>
              </Route>
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <button id="install-button" className="hidden">Install</button>
          </div>
        </Router>
      </VisibilityProvider>
    </GlobalStateProvider>
    </ErrorBoundary>
  );
}

export default App;