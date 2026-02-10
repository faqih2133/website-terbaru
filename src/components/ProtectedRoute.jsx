import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified (soft redirect to avoid blocking refresh during lag)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const defaultRoute = user.role === 'admin' ? '/admin-dashboard' : (user.role === 'evaluator' ? '/evaluator-dashboard' : '/');
    return <Navigate to={defaultRoute} replace />;
  }

  // Render children if authenticated and authorized
  return children;
};

export default ProtectedRoute;