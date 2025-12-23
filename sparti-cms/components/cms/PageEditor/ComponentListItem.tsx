import React, { memo } from 'react';
import { GripVertical, Send } from 'lucide-react';
import { ComponentSchema } from '../../../types/schema';
import { getComponentTypeDisplayName } from '../../../utils/componentHelpers';
import { Button } from '../../../../src/components/ui/button';

interface ComponentListItemProps {
  component: ComponentSchema;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onSendToAI?: (component: ComponentSchema) => void;
}

export const ComponentListItem = memo<ComponentListItemProps>(({
  component,
  index,
  isSelected,
  onSelect,
  onSendToAI,
}) => {
  const handleClick = () => {
    onSelect(index);
  };

  const handleSendToAI = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the select action
    if (onSendToAI) {
      onSendToAI(component);
    }
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="font-medium text-sm truncate">
            {getComponentTypeDisplayName(component.type)}
          </p>
        </div>
        {onSendToAI && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleSendToAI}
            title="Send component to Editor"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
});

ComponentListItem.displayName = 'ComponentListItem';

