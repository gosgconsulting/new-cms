import React from 'react';
import { Shield, Box } from 'lucide-react';
import { SpartiCMSWrapper } from '../../sparti-cms';

const ComponentsViewer: React.FC = () => {
  return (
    <SpartiCMSWrapper>
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Box className="h-8 w-8 text-gray-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Components Viewer</h1>
          <p className="text-gray-600">
            This viewer is currently empty. No components are listed here.
          </p>
        </div>
      </div>
    </SpartiCMSWrapper>
  );
};

export default ComponentsViewer;