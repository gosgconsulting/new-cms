import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComponentsIntegrationProps {
  onViewClick?: () => void;
}

/**
 * Design Systems integration entry.
 *
 * This is a lightweight shortcut to the Design Systems reference page.
 */
export const ComponentsIntegration: React.FC<ComponentsIntegrationProps> = ({ onViewClick }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick();
    } else {
      navigate('/design-systems');
    }
  };

  return (
    <div className="border rounded-lg p-4 flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Layers className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">Design Systems</h3>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300">
              Reference
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Central reference for installed UI/design systems (e.g. Flowbite)
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Type: Design System</span>
            <span>Provider: Internal</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleViewClick}>
          Open
        </Button>
      </div>
    </div>
  );
};

/**
 * Design Systems list item for modals
 */
export const ComponentsIntegrationListItem: React.FC = () => {
  return (
    <li>• Design Systems (Flowbite)</li>
  );
};

export default ComponentsIntegration;