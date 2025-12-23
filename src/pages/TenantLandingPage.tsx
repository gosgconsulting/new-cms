import React from 'react';
import { useParams } from 'react-router-dom';
import TenantLanding from '../../sparti-cms/theme/landingpage';

/**
 * Client-side React component for tenant landing pages
 * Hardcoded landing page - no database connection
 */
const TenantLandingPage: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  
  // Hardcoded values - no database connection
  const tenantName = 'Landing Page';
  const slug = tenantSlug || 'landingpage';

  return (
    <TenantLanding 
      tenantName={tenantName} 
      tenantSlug={slug} 
    />
  );
};

export default TenantLandingPage;

