import React, { memo } from 'react';
import { GripVertical } from 'lucide-react';
import { ComponentSchema } from '../../../types/schema';
import { getComponentTypeDisplayName } from '../../../utils/componentHelpers';

interface ComponentListItemProps {
  component: ComponentSchema;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

export const ComponentListItem = memo<ComponentListItemProps>(({
  component,
  index,
  isSelected,
  onSelect,
}) => {
  const handleClick = () => {
    onSelect(index);
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
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <p className="font-medium text-sm truncate">
          {getComponentTypeDisplayName(component.type)}
        </p>
      </div>
    </div>
  );
});

ComponentListItem.displayName = 'ComponentListItem';

