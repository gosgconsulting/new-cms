import React from 'react';
import { ComponentSchema, SchemaItem } from '../../types/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { SchemaItemEditor } from './SchemaItemRenderer';

interface ComponentEditorProps {
  schema: ComponentSchema;
  onChange?: (data: ComponentSchema) => void;
  className?: string;
}


export const ComponentEditor: React.FC<ComponentEditorProps> = ({
  schema,
  onChange,
  className = ''
}) => {
  
  // Ensure schema has items property
  const safeSchema = {
    ...schema,
    items: schema.items || []
  };
  
  const handleItemChange = (path: (string | number)[], updatedItem: SchemaItem) => {
    const updatedItems = [...safeSchema.items];

    let currentLevel: any = { items: updatedItems };

    for (let i = 0; i < path.length - 1; i++) {
      const keyOrIndex = path[i];
      if (typeof keyOrIndex === 'string') {
        currentLevel = currentLevel.items.find((item: SchemaItem) => item.key === keyOrIndex);
      } else {
        currentLevel = currentLevel.items[keyOrIndex];
      }
      if (!currentLevel) {
        console.error('[ComponentEditor] Invalid path, could not find item at:', path.slice(0, i + 1));
        return;
      }
    }

    const lastKeyOrIndex = path[path.length - 1];
    if (typeof lastKeyOrIndex === 'string') {
      const itemIndex = currentLevel.items.findIndex((item: SchemaItem) => item.key === lastKeyOrIndex);
      if (itemIndex !== -1) {
        currentLevel.items[itemIndex] = updatedItem;
      }
    } else {
      currentLevel.items[lastKeyOrIndex] = updatedItem;
    }

    const updatedSchema = { ...safeSchema, items: updatedItems };
    onChange?.(updatedSchema);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{safeSchema.type}</Badge>
            {safeSchema.name && <span className="text-sm text-gray-600">({safeSchema.name})</span>}
            Component Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeSchema.items && safeSchema.items.length > 0 ? safeSchema.items.map((item, index) => (
              <div key={`${item.key}-${index}`} className="border rounded-lg p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.type}
                  </Badge>
                  <span className="ml-2 text-sm text-gray-600">
                    {item.key}
                  </span>
                </div>
                <SchemaItemEditor 
                  item={item} 
                  onChange={(updatedItem) => handleItemChange([index], updatedItem)} 
                  path={[index]} 
                />
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No items in this component</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentEditor;
