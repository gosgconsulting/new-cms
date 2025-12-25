import React from 'react';
import { SpartiCMSWrapper } from '../../sparti-cms';

const ComponentsViewer: React.FC = () => {
  return (
    <SpartiCMSWrapper>
      <div className="flex min-h-screen bg-background">
        {/* Left Sidebar (empty) */}
        <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 hidden md:block">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Library</h2>
          </div>
          <div className="p-3">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Categories</h3>
            <div className="text-sm text-gray-500">No categories available</div>
          </div>
          <div className="mt-auto p-3 border-t border-gray-200 text-sm text-gray-400">
            Components list is empty
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Components Viewer</h1>
            <p className="text-gray-600">This viewer is currently empty. No components are listed.</p>
          </div>
        </div>
      </div>
    </SpartiCMSWrapper>
  );
};

export default ComponentsViewer;