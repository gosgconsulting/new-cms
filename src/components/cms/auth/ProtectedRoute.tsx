import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  publicRoutes?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, publicRoutes = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Check if current path is in public routes
  const isPublicRoute = window.location.pathname.startsWith('/dashboard');

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

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Require authentication for protected routes
  if (!user) {
    // Redirect to the global auth page
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;