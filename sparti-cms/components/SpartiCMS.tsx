import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { CMSSettingsProvider } from '../context/CMSSettingsContext';
import AuthPage from './auth/AuthPage';
import ProtectedRoute from './auth/ProtectedRoute';
import CMSDashboard from './admin/CMSDashboard';

export const SpartiCMS: React.FC = () => {
  return (
    <CMSSettingsProvider>
      <AuthProvider>
        <Routes>
          {/* Auth route - shows login if not authenticated */}
          <Route path="/" element={<AuthPage />} />
          
          {/* Protected admin routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <CMSDashboard />
            </ProtectedRoute>
          } />
          
          {/* Default redirect to dashboard for authenticated users */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </CMSSettingsProvider>
  );
};

export default SpartiCMS;