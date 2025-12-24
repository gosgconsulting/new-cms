import React, { useState } from 'react';
import { DataSourceSelector } from './DataSourceSelector';
import { GoogleMapsTable } from './GoogleMapsTable';
import { GoogleSearchTable } from './GoogleSearchTable';

type DataSource = 'google_maps' | 'google_search' | null;

export const DataDashboard: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<DataSource>(null);

  const handleSelectSource = (source: DataSource) => {
    setSelectedSource(source);
  };

  const handleBack = () => {
    setSelectedSource(null);
  };

  if (selectedSource === 'google_maps') {
    return <GoogleMapsTable onBack={handleBack} />;
  }

  if (selectedSource === 'google_search') {
    return <GoogleSearchTable onBack={handleBack} />;
  }

  return <DataSourceSelector onSelectSource={handleSelectSource} />;
};