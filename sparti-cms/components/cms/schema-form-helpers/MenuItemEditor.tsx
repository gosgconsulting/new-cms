import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Input } from '../../../../src/components/ui/input';
import { Label } from '../../../../src/components/ui/label';
import { Button } from '../../../../src/components/ui/button';
import { X, GripVertical } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  link: string;
}

interface MenuItemEditorProps {
  item: MenuItem;
  index: number;
  onChange: (index: number, item: MenuItem) => void;
  onRemove: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const MenuItemEditor: React.FC<MenuItemEditorProps> = ({
  item,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false
}) => {
  const handleFieldChange = (field: keyof MenuItem, value: string) => {
    onChange(index, { ...item, [field]: value });
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            Menu Item #{index + 1}
          </CardTitle>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveUp(index)}
                disabled={!canMoveUp}
                className="h-6 w-6 p-0"
              >
                ↑
              </Button>
            )}
            {onMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveDown(index)}
                disabled={!canMoveDown}
                className="h-6 w-6 p-0"
              >
                ↓
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">ID</Label>
          <Input
            value={item.id}
            onChange={(e) => handleFieldChange('id', e.target.value)}
            placeholder="e.g., home, about, contact"
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Label</Label>
          <Input
            value={item.label}
            onChange={(e) => handleFieldChange('label', e.target.value)}
            placeholder="e.g., Home, About Us, Contact"
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Link</Label>
          <Input
            value={item.link}
            onChange={(e) => handleFieldChange('link', e.target.value)}
            placeholder="e.g., /, /about, /contact"
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface MenuItemsListProps {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  title?: string;
  addButtonText?: string;
}

export const MenuItemsList: React.FC<MenuItemsListProps> = ({
  items = [], // Add default empty array for safety
  onChange,
  title = "Menu Items",
  addButtonText = "Add Menu Item"
}) => {
  const addItem = () => {
    const newItem: MenuItem = {
      id: `item_${Date.now()}`,
      label: 'New Item',
      link: '/'
    };
    onChange([...(items || []), newItem]);
  };

  const updateItem = (index: number, updatedItem: MenuItem) => {
    const newItems = [...(items || [])];
    newItems[index] = updatedItem;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = (items || []).filter((_, i) => i !== index);
    onChange(newItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...(items || [])];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{title} ({items?.length || 0})</h4>
        <Button onClick={addItem} size="sm" variant="outline">
          {addButtonText}
        </Button>
      </div>
      
      <div className="space-y-3">
        {(items || []).map((item, index) => (
          <MenuItemEditor
            key={`${item.id}-${index}`}
            item={item}
            index={index}
            onChange={updateItem}
            onRemove={removeItem}
            onMoveUp={index > 0 ? (idx) => moveItem(idx, idx - 1) : undefined}
            onMoveDown={index < (items?.length || 0) - 1 ? (idx) => moveItem(idx, idx + 1) : undefined}
            canMoveUp={index > 0}
            canMoveDown={index < (items?.length || 0) - 1}
          />
        ))}
      </div>
      
      {(items?.length === 0 || !items) && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm">No {title.toLowerCase()} added yet</p>
          <Button onClick={addItem} size="sm" variant="outline" className="mt-2">
            {addButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};
