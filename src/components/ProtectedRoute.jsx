import React from 'react';
import { Navigate } from 'react-router-dom';
import TermsAndConditions from './TermsAndConditions';
import { getAuthToken } from '../utils/authUtils';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated using the same method as PrivateRoute
  const token = getAuthToken();
  const storedUser = localStorage.getItem("user");
  
  // If not authenticated, redirect to login
  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if terms have been accepted
  const termsAccepted = localStorage.getItem('termsAccepted');

  // If authenticated but terms not accepted, show terms page
  if (!termsAccepted) {
    return <TermsAndConditions />;
  }

  // If authenticated and terms accepted, show the protected content
  return children;
};

export default ProtectedRoute; 
