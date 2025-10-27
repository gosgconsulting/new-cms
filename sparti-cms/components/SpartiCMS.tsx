import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CMSSettingsProvider } from '../context/CMSSettingsContext';
import ProtectedRoute from './auth/ProtectedRoute';
import CMSDashboard from './admin/CMSDashboard';

export const SpartiCMS: React.FC = () => {
  return (
    <CMSSettingsProvider>
      <Routes>
        {/* Root path shows dashboard for authenticated users */}
        <Route path="/" element={
          <ProtectedRoute>
            <CMSDashboard />
          </ProtectedRoute>
        } />
        
        {/* All other paths redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CMSSettingsProvider>
  );
};

export default SpartiCMS;