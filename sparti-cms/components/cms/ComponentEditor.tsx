import React, { useState } from 'react';
import { ComponentSchema, SchemaItem } from '../../types/schema';
import { Button } from '../../../src/components/ui/button';
import { SchemaItemEditor } from './SchemaItemRenderer';
import { 
  ChevronDown, 
  ChevronRight, 
  GripVertical,
  Type,
  Image,
  MousePointer,
  Link,
  FileText,
  Hash,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  Grid3X3,
  Video,
  Layers,
  Settings
} from 'lucide-react';

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
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  // Function to get appropriate icon based on field key and type
  const getFieldIcon = (item: SchemaItem) => {
    const key = item.key.toLowerCase();
    const type = item.type;
    
    // Check by field type first
    if (type === 'heading') return Type;
    if (type === 'text') return FileText;
    if (type === 'image') return Image;
    if (type === 'button') return MousePointer;
    if (type === 'link') return Link;
    if (type === 'video') return Video;
    if (type === 'array') return Layers;
    if (type === 'gallery') return Grid3X3;
    if (type === 'carousel') return Grid3X3;
    
    // Check by field key patterns
    if (key.includes('title') || key.includes('heading')) return Type;
    if (key.includes('description') || key.includes('text') || key.includes('content')) return FileText;
    if (key.includes('image') || key.includes('img') || key.includes('photo')) return Image;
    if (key.includes('button') || key.includes('btn') || key.includes('cta')) return MousePointer;
    if (key.includes('link') || key.includes('url') || key.includes('href')) return Link;
    if (key.includes('email') || key.includes('mail')) return Mail;
    if (key.includes('phone') || key.includes('tel')) return Phone;
    if (key.includes('address') || key.includes('location')) return MapPin;
    if (key.includes('date') || key.includes('time')) return Calendar;
    if (key.includes('rating') || key.includes('star') || key.includes('review')) return Star;
    if (key.includes('number') || key.includes('count') || key.includes('id')) return Hash;
    if (key.includes('service') || key.includes('feature') || key.includes('item')) return Layers;
    if (key.includes('setting') || key.includes('config')) return Settings;
    
    // Default icon
    return FileText;
  };
  
  // Ensure schema has items property
  const safeSchema = {
    ...schema,
    items: schema.items || []
  };


  // Toggle item expansion
  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
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
            {safeSchema.items && safeSchema.items.length > 0 ? safeSchema.items.map((item, index) => (
              <div key={`${item.key}-${index}`} className="border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => toggleItem(index)}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {React.createElement(getFieldIcon(item), { 
                      className: "h-4 w-4 text-blue-500" 
                    })}
                    <span className="text-sm font-medium text-gray-700 uppercase">
                      {item.key}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    {expandedItems.has(index) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {expandedItems.has(index) && (
                  <div className="p-4 border-t bg-white">
                    <SchemaItemEditor 
                      item={item} 
                      onChange={(updatedItem) => handleItemChange([index], updatedItem)} 
                      path={[index]} 
                    />
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No items in this component</p>
              </div>
            )}
    </div>
  );
};

export default ComponentEditor;
