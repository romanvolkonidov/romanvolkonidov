import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalStateContext';
import { VisibilityProvider } from './context/VisibilityContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppContent from './components/AppContent';
import './styles/App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
function App() {
  return (
    <ErrorBoundary>
      <GlobalStateProvider>
        <VisibilityProvider>
          <Router>
            <AppContent />

          </Router>
        </VisibilityProvider>
      </GlobalStateProvider>
    </ErrorBoundary>
  );
}

export default App;