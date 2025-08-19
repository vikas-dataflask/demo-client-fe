import React from 'react';
import { Navigate } from 'react-router-dom';
import TermsAndConditions from './TermsAndConditions';
import { isAuthenticated } from '../utils/authUtils';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const authenticated = isAuthenticated();

  // Check if terms have been accepted
  const termsAccepted = localStorage.getItem('termsAccepted');

  // If not authenticated, redirect to login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but terms not accepted, show terms page
  if (!termsAccepted) {
    return <TermsAndConditions />;
  }

  // If authenticated and terms accepted, show the protected content
  return children;
};

export default ProtectedRoute; 