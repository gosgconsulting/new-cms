import React from 'react';
import { IntegrationTest } from '@/components/IntegrationTest';

const IntegrationTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <IntegrationTest />
      </div>
    </div>
  );
};

export default IntegrationTestPage;
