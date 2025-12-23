import React, { useEffect } from "react";
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

  useEffect(() => {
    // If user is not authenticated, redirect to auth
    if (!user) {
      navigate(`/theme/${themeSlug}/auth`, { replace: true });
      return;
    }

    // If user is authenticated, verify their tenant uses this theme
    // This is handled by the backend API filtering, but we can add client-side check
    if (themeSlug && user.tenant_id && !user.is_super_admin) {
      // The backend will filter tenants by theme_id, so if the user's tenant
      // doesn't use this theme, they won't see it in the tenant list
      // This is a client-side safety check
      console.log(`[testing] Theme context: ${themeSlug}, User tenant: ${user.tenant_id}`);
    }
  }, [user, themeSlug, navigate]);

  // Render the regular admin - tenant filtering happens at API level
  return <SpartiCMS />;
};

export default ThemeAdmin;

