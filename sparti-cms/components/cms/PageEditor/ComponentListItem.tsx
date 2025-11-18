import React, { memo } from 'react';
import { Button } from '../../../../src/components/ui/button';
import { Badge } from '../../../../src/components/ui/badge';
import { GripVertical, Trash2 } from 'lucide-react';
import { ComponentSchema } from '../../../types/schema';
import { getComponentTypeDisplayName, getComponentIcon, getComponentPreview } from '../../../utils/componentHelpers';

interface ComponentListItemProps {
  component: ComponentSchema;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
}

export const ComponentListItem = memo<ComponentListItemProps>(({
  component,
  index,
  isSelected,
  onSelect,
  onRemove,
}) => {
  const handleClick = () => {
    onSelect(index);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(index);
  };

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-muted/50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {getComponentIcon(component.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">
                {getComponentTypeDisplayName(component.type)}
              </p>
              <Badge variant="outline" className="text-xs">
                {component.items?.length || 0}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {component.key}
            </p>
            <p className="text-xs text-gray-500 truncate mt-1">
              {getComponentPreview(component)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive flex-shrink-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});

ComponentListItem.displayName = 'ComponentListItem';

