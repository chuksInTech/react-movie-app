import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Spinner from './Spinner';

export const ProtectedRoute = ({children}) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <Spinner />;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
      }
    
  return children;
};