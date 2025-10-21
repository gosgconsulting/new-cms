import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Tenant configuration
const TENANT_CONFIG = {
  id: 'current-tenant-id',
  name: 'Main Website',
  plan: 'Standard',
  status: 'active',
  createdAt: '2023-10-15',
};

interface PostgresIntegrationProps {
  onViewClick?: () => void;
}

/**
 * PostgreSQL Integration component that displays tenant information
 */
export const PostgresIntegration: React.FC<PostgresIntegrationProps> = ({ onViewClick }) => {
  const navigate = useNavigate();
  
  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick();
    } else {
      navigate('/database-viewer');
    }
  };
  
  return (
    <div className="border rounded-lg p-4 flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">PostgreSQL Database</h3>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
              Tenant: {TENANT_CONFIG.name}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Main database for storing project data, user information, and content
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Type: Database</span>
            <span>Provider: Railway</span>
            <span>Plan: {TENANT_CONFIG.plan}</span>
            <span>Status: Active</span>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleViewClick}>
        View
      </Button>
    </div>
  );
};

/**
 * PostgreSQL Integration list item for modals
 */
export const PostgresIntegrationListItem: React.FC = () => {
  return (
    <li>• PostgreSQL Database (Active - Tenant: {TENANT_CONFIG.name})</li>
  );
};

export default PostgresIntegration;
