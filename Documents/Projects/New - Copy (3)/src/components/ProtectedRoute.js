import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { GlobalStateContext } from '../context/GlobalStateContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { authenticatedStudent } = useContext(GlobalStateContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const isAdmin = localStorage.getItem('isAdmin') === 'true';

      setIsAuthenticated(isAuthenticated);
      setIsAdmin(isAdmin);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={`/dashboard/${authenticatedStudent?.id}`} />;
  }

  if (!isAdmin && window.location.pathname !== `/dashboard/${authenticatedStudent?.id}`) {
    return <Navigate to={`/dashboard/${authenticatedStudent?.id}`} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;