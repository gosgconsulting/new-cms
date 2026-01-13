// Universal Sparti Builder Plugin - Works on any website
import React, { ReactNode, useEffect } from 'react';
import { SpartiBuilderProvider } from './SpartiBuilderProvider';
import { SpartiToolbar } from './SpartiToolbar';
import { EditingOverlay } from './EditingOverlay';
import { ElementSelector } from './ElementSelector';
import { ContentEditPanel } from './ContentEditPanel';
import { SpartiBuilderConfig } from '../types';
import { UniversalElementDetector } from '../core/universal-detector';
import { SpartiStyleManager } from '../styles/sparti-styles';

interface SpartiBuilderProps {
  children: ReactNode;
  config?: SpartiBuilderConfig;
}

export const SpartiBuilder: React.FC<SpartiBuilderProps> = ({ 
  children, 
  config = { enabled: true, toolbar: true, autoDetect: true }
}) => {
  
  useEffect(() => {
    // Initialize universal compatibility
    const framework = UniversalElementDetector.detectFramework();
    console.log(`Sparti Builder initialized on ${framework} framework`);
    
    // Inject CSS styles directly into DOM for universal compatibility
    SpartiStyleManager.injectStyles();

    // Cleanup on unmount
    return () => {
      SpartiStyleManager.removeStyles();
    };
  }, []);

  if (!config.enabled) {
    return <>{children}</>;
  }

  return (
    <SpartiBuilderProvider config={config}>
      <div className="sparti-builder-wrapper">
        <SpartiToolbar />
        <div className="sparti-content-area">
          <ElementSelector>
            {children}
          </ElementSelector>
          <EditingOverlay />
          <ContentEditPanel />
        </div>
      </div>
    </SpartiBuilderProvider>
  );
};