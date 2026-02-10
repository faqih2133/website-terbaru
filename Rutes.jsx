import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import pages
import Login from './pages/login';
import EvaluatorDashboard from './pages/evaluator-dashboard';
import EvalueeDashboard from './pages/evaluee-dashboard';
import BehavioralAssessment from './pages/behavioral-assessment';
import BehavioralAssessmentModern from './pages/behavioral-assessment/components/BehavioralAssessmentModern';
import AdminDashboard from './pages/admin-dashboard';
import SupervisorApproval from './pages/supervisor-approval';
import EvaluatorProposal from './pages/evaluator-proposal';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Role-based Route Redirect
const RoleBasedRoute = ({ component: Component, ...rest }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'supervisor':
      return <Navigate to="/supervisor-approval" replace />;
    case 'evaluator':
      return <Navigate to="/evaluator-dashboard" replace />;
    case 'evaluee':
      return <Navigate to="/evaluee-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/supervisor-approval"
        element={
          <ProtectedRoute allowedRoles={['supervisor']}>
            <SupervisorApproval />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/evaluator-dashboard"
        element={
          <ProtectedRoute allowedRoles={['evaluator']}>
            <EvaluatorDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/evaluee-dashboard"
        element={
          <ProtectedRoute allowedRoles={['evaluee']}>
            <EvalueeDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/behavioral-assessment"
        element={
          <ProtectedRoute allowedRoles={['evaluator']}>
            <BehavioralAssessmentModern />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/evaluator-proposal"
        element={
          <ProtectedRoute allowedRoles={['evaluee']}>
            <EvaluatorProposal />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect based on role */}
      <Route path="/" element={<RoleBasedRoute />} />
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;