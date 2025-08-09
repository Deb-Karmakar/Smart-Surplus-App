import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // If user is not logged in, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If the route requires specific roles, check if the user has one of them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user's role is not allowed, redirect them to the home page (or an "unauthorized" page)
    return <Navigate to="/" replace />;
  }

  // If everything is fine, render the requested component
  return children;
};

export default ProtectedRoute;