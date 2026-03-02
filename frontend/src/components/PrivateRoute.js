import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role === 'supervisor' ? '/supervisor' : '/dashboard'} replace />;

  return children;
}
