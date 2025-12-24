import React from 'react';
import { Card } from '@/components/ui/card';

const DatabaseLeadsTable = () => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Database Leads</h3>
        <p className="text-muted-foreground">
          Database leads functionality is temporarily disabled while updating schema compatibility.
        </p>
      </div>
    </Card>
  );
};

export default DatabaseLeadsTable;