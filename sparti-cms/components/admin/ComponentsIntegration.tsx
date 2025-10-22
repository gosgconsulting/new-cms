import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Puzzle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComponentsIntegrationProps {
  onViewClick?: () => void;
}

/**
 * Components Integration component that displays components information
 */
export const ComponentsIntegration: React.FC<ComponentsIntegrationProps> = ({ onViewClick }) => {
  const navigate = useNavigate();
  
  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick();
    } else {
      navigate('/components-viewer');
    }
  };
  
  return (
    <div className="border rounded-lg p-4 flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Puzzle className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">Components</h3>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300">
              Library
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Reusable UI components for building consistent interfaces
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Type: UI Library</span>
            <span>Provider: Internal</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleViewClick}>
          View
        </Button>
      </div>
    </div>
  );
};

/**
 * Components Integration list item for modals
 */
export const ComponentsIntegrationListItem: React.FC = () => {
  return (
    <li>• Components Library</li>
  );
};

export default ComponentsIntegration;
