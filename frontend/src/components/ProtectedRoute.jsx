// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function ProtectedRoute({ children }) {
  const { authUser, isLoading } = useAuth();

  if (isLoading) {
    // You can show a spinner here if you want:
    return <></>
    // or simply return null to render nothing until loading is done.
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
