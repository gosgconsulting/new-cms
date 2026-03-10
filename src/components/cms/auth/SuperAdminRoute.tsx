import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface SuperAdminRouteProps {
  children: ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!user.is_super_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="mt-2 text-gray-500">This page is only available to superadmin users.</p>
          <a
            href="/admin"
            className="inline-flex items-center mt-6 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Go to Admin
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SuperAdminRoute;