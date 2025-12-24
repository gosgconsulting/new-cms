import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RunOverviewTab } from './RunOverviewTab';
import { GoogleMapsTable } from './GoogleMapsTable';
import { GoogleSearchTable } from './GoogleSearchTable';
import { GoogleSearchDebugPanel } from './GoogleSearchDebugPanel';

type RunManagementView = 'runs' | 'google_maps' | 'google_search' | 'debug' | null;

interface RunManagementDashboardProps {
  selectedRunId?: string;
  onRunSelect?: (runId: string, runType: 'google_maps' | 'google_search') => void;
}

export const RunManagementDashboard: React.FC<RunManagementDashboardProps> = ({
  selectedRunId,
  onRunSelect
}) => {
  const [activeTab, setActiveTab] = useState<RunManagementView>('runs');

  const handleBackToRuns = () => {
    setActiveTab('runs');
  };

  const handleRunClick = (runId: string, runType: 'google_maps' | 'google_search') => {
    onRunSelect?.(runId, runType);
    if (runType === 'google_maps') {
      setActiveTab('google_maps');
    } else {
      setActiveTab('google_search');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab || 'runs'} onValueChange={(value) => setActiveTab(value as RunManagementView)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="runs">Run Overview</TabsTrigger>
          <TabsTrigger value="google_maps">Google Maps Data</TabsTrigger>
          <TabsTrigger value="google_search">Google Search Data</TabsTrigger>
          <TabsTrigger value="debug">Debug Panel</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="mt-6">
          <RunOverviewTab 
            onRunClick={handleRunClick}
            selectedRunId={selectedRunId}
          />
        </TabsContent>

        <TabsContent value="google_maps" className="mt-6">
          <GoogleMapsTable 
            onBack={handleBackToRuns}
            selectedRunId={selectedRunId}
            onRunSelect={onRunSelect}
          />
        </TabsContent>

        <TabsContent value="google_search" className="mt-6">
          <GoogleSearchTable 
            onBack={handleBackToRuns}
            selectedRunId={selectedRunId}
            onRunSelect={onRunSelect}
          />
        </TabsContent>

        <TabsContent value="debug" className="mt-6">
          <GoogleSearchDebugPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};