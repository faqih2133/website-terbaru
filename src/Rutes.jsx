import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import Login from './pages/login';
import ResetPassword from './pages/login/ResetPassword';
import AdminDashboard from './pages/admin-dashboard';
import BehavioralAssessment from './pages/behavioral-assessment';
import SupervisorApproval from './pages/supervisor-approval';
import EvaluatorDashboard from './pages/evaluator-dashboard';
import NotFound from './pages/NotFound';

// Import components
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
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
        path="/evaluator-dashboard"
        element={
          <ProtectedRoute allowedRoles={['evaluator']}>
            <EvaluatorDashboard />
          </ProtectedRoute>
        }
      />
      
    <Route
      path="/behavioral-assessment/:employeeId"
      element={
        <ProtectedRoute allowedRoles={['evaluator', 'admin']}>
          <BehavioralAssessment />
        </ProtectedRoute>
      }
    />
      
      <Route
        path="/supervisor-approval"
        element={
          <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
            <SupervisorApproval />
          </ProtectedRoute>
        }
      />
      
      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
