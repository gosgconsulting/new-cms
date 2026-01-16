import React from 'react';
import './theme.css';
import LandingTheme from '../landingpage';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

/**
 * STR theme that duplicates the ACATR landing page.
 * It simply reuses the ACATR theme component but mounts under the 'str' slug.
 */
const STRTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'ACATR Business Services',
  tenantSlug = 'str',
  tenantId
}) => {
  return (
    <LandingTheme
      tenantName={tenantName}
      tenantSlug={tenantSlug}
      tenantId={tenantId}
    />
  );
};

export default STRTheme;