import React, { ReactNode } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { SpartiBuilder } from './SpartiBuilder';

interface SpartiCMSWrapperProps {
  children: ReactNode;
}

const SpartiCMSWrapperContent: React.FC<SpartiCMSWrapperProps> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return (
      <SpartiBuilder config={{ enabled: true, toolbar: true, autoDetect: true }}>
        {children}
      </SpartiBuilder>
    );
  }

  return <>{children}</>;
};

export const SpartiCMSWrapper: React.FC<SpartiCMSWrapperProps> = ({ children }) => {
  return (
    <AuthProvider>
      <SpartiCMSWrapperContent>
        {children}
      </SpartiCMSWrapperContent>
    </AuthProvider>
  );
};

export default SpartiCMSWrapper;