import React from 'react';
import { Card } from '@/components/ui/card';

interface LeadContactManagerProps {
  leadId: string;
  className?: string;
}

export const LeadContactManager: React.FC<LeadContactManagerProps> = ({ 
  leadId, 
  className 
}) => {
  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Contact Manager</h3>
        <p className="text-muted-foreground">
          Lead contact management features are temporarily disabled while updating database schema.
        </p>
      </div>
    </Card>
  );
};

export default LeadContactManager;