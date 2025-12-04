import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader.jsx';

const RouteGuard = ({ children, requireAuth = true }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated (optional redirect)
  // For now, just render children

  return children;
};

export default RouteGuard;