import React from 'react';
import { Button } from '../../../../src/components/ui/button';
import { Settings } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon }) => {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
      <div className="text-center">
        {icon || <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />}
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  );
};

interface ComponentsErrorStateProps {
  onReset: () => void;
}

export const ComponentsErrorState: React.FC<ComponentsErrorStateProps> = ({ onReset }) => {
  return (
    <div className="text-center py-8 text-destructive">
      <p className="text-sm">Error: Components data is not an array</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={onReset}
      >
        Reset Components
      </Button>
    </div>
  );
};

interface ComponentsEmptyStateProps {
  message?: string;
  description?: string;
}

export const ComponentsEmptyState: React.FC<ComponentsEmptyStateProps> = ({ 
  message = 'No components available',
  description = 'This page has no components to edit'
}) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-sm">{message}</p>
      <p className="text-xs">{description}</p>
    </div>
  );
};

