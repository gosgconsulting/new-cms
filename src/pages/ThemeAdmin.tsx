import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../sparti-cms/components/auth/AuthProvider";
import { SpartiCMS } from "../../sparti-cms";

/**
 * Theme-specific Admin page
 * Ensures user can only access tenants that use the specified theme
 */
const ThemeAdmin: React.FC = () => {
  const { themeSlug } = useParams<{ themeSlug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // If user is not authenticated, redirect to auth
    if (!user) {
      navigate(`/theme/${themeSlug}/auth`, { replace: true });
      return;
    }

    // If user is authenticated, verify their tenant uses this theme
    const validateThemeAccess = async () => {
      if (!themeSlug) {
        setIsValidating(false);
        return;
      }

      // Super admins can access any theme
      if (user.is_super_admin) {
        setIsValidating(false);
        return;
      }

      // For non-super-admin users, verify their tenant uses this theme
      if (user.tenant_id) {
        try {
          const API_BASE_URL = import.meta.env.DEV 
            ? '' 
            : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173');
          
          const token = localStorage.getItem('sparti-user-session') 
            ? JSON.parse(localStorage.getItem('sparti-user-session') || '{}').token 
            : null;

          const response = await fetch(`${API_BASE_URL}/api/tenants/by-theme/${themeSlug}`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const tenants = data.tenants || [];
            
            // Check if user's tenant is in the list of tenants using this theme
            const userTenantUsesTheme = tenants.some(
              (tenant: any) => tenant.id === user.tenant_id
            );

            if (!userTenantUsesTheme) {
              console.error(`[testing] Access denied: User tenant ${user.tenant_id} does not use theme ${themeSlug}`);
              setAccessDenied(true);
            } else {
              console.log(`[testing] Theme access validated: User tenant ${user.tenant_id} uses theme ${themeSlug}`);
            }
          } else {
            // If API call fails, deny access to be safe
            console.error(`[testing] Failed to validate theme access: ${response.status}`);
            setAccessDenied(true);
          }
        } catch (error) {
          console.error('[testing] Error validating theme access:', error);
          setAccessDenied(true);
        }
      } else {
        // User has no tenant_id - deny access
        console.error('[testing] Access denied: User has no tenant_id');
        setAccessDenied(true);
      }

      setIsValidating(false);
    };

    validateThemeAccess();
  }, [user, themeSlug, navigate]);

  // Show loading state while validating
  if (isValidating) {
    return <div />;
  }

  // Show access denied message
  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your tenant does not use the theme "{themeSlug}". You can only access themes assigned to your tenant.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Main Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the regular admin - tenant filtering happens at API level
  return <SpartiCMS themeSlug={themeSlug} />;
};

export default ThemeAdmin;

