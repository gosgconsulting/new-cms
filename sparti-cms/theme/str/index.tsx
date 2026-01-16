import React from 'react';
import './theme.css';
import LandingTheme from '../landingpage';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

const STRTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'ACATR Business Services',
  tenantSlug = 'str',
  tenantId
}) => {
  return (
    <div className="str-theme min-h-screen bg-background text-foreground">
      <div className="fixed top-0 left-0 right-0 h-1 bg-primary z-50" />
      <LandingTheme
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        tenantId={tenantId}
      />
    </div>
  );
};

export default STRTheme;