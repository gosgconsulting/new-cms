import React, { useState } from 'react';
import { ComponentSchema, SchemaItem } from '../../types/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Button } from '../../../src/components/ui/button';
import { SchemaItemEditor } from './SchemaItemRenderer';
import { 
  ChevronDown, 
  ChevronRight, 
  Type, 
  Image, 
  Video, 
  Grid3X3, 
  RotateCcw, 
  Square, 
  Link, 
  MessageSquare, 
  Star, 
  Award, 
  Mail, 
  Clock,
  MapPin,
  Phone,
  HelpCircle,
  GripVertical
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
  
  // Ensure schema has items property
  const safeSchema = {
    ...schema,
    items: schema.items || []
  };

  // Get icon for item type
  const getItemIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'heading': <Type className="h-4 w-4 text-blue-500" />,
      'text': <Type className="h-4 w-4 text-gray-500" />,
      'image': <Image className="h-4 w-4 text-green-500" />,
      'video': <Video className="h-4 w-4 text-purple-500" />,
      'gallery': <Grid3X3 className="h-4 w-4 text-orange-500" />,
      'carousel': <RotateCcw className="h-4 w-4 text-cyan-500" />,
      'button': <Square className="h-4 w-4 text-indigo-500" />,
      'link': <Link className="h-4 w-4 text-blue-500" />,
      'input': <Type className="h-4 w-4 text-gray-600" />,
      'textarea': <MessageSquare className="h-4 w-4 text-gray-600" />,
      'review': <Star className="h-4 w-4 text-yellow-500" />,
      'feature': <Award className="h-4 w-4 text-pink-500" />,
      'faq': <HelpCircle className="h-4 w-4 text-teal-500" />,
      'officeHours': <Clock className="h-4 w-4 text-orange-500" />,
      'contactInfo': <MapPin className="h-4 w-4 text-red-500" />,
      'ContactForm': <Mail className="h-4 w-4 text-blue-500" />,
      'array': <Grid3X3 className="h-4 w-4 text-gray-500" />
    };
    return iconMap[type] || <Square className="h-4 w-4 text-gray-400" />;
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

  // Get preview text for item
  const getItemPreview = (item: SchemaItem): string => {
    switch (item.type) {
      case 'heading':
      case 'text':
        return item.content ? item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '') : 'No content';
      case 'image':
        return item.src ? `Image: ${item.alt || 'Untitled'}` : 'No image';
      case 'video':
        return item.src ? `Video: ${item.alt || 'Untitled'}` : 'No video';
      case 'button':
        return item.content ? `Button: ${item.content}` : 'No button text';
      case 'link':
        return item.link ? `Link: ${item.label || item.link}` : 'No link';
      case 'input':
      case 'textarea':
        return item.content ? `Field: ${item.content}` : 'No label';
      case 'review':
        return item.props?.name ? `Review by ${item.props.name}` : 'Review';
      case 'feature':
        return item.props?.title ? `Feature: ${item.props.title}` : 'Feature';
      case 'faq':
        return item.props?.question ? `Q: ${item.props.question.substring(0, 30)}...` : 'FAQ';
      case 'officeHours':
        return item.items?.length ? `${item.items.length} hours entries` : 'No hours';
      case 'contactInfo':
        const parts: string[] = [];
        if (item.address) parts.push('Address');
        if (item.phone) parts.push('Phone');
        if (item.email) parts.push('Email');
        if (item.hours?.length) parts.push('Hours');
        return parts.length ? parts.join(', ') : 'No contact info';
      case 'gallery':
        return item.value?.length ? `${item.value.length} images` : 'No images';
      case 'carousel':
        return item.images?.length ? `${item.images.length} slides` : 'No slides';
      case 'array':
        return item.items?.length ? `${item.items.length} items` : 'Empty array';
      default:
        return 'No preview available';
    }
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
            <span className="text-sm text-gray-500">
              • {safeSchema.items.length} item{safeSchema.items.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeSchema.items && safeSchema.items.length > 0 ? safeSchema.items.map((item, index) => (
              <div key={`${item.key}-${index}`} className="border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => toggleItem(index)}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {getItemIcon(item.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        <span className="text-sm font-medium text-gray-700">
                          {item.key}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getItemPreview(item)}
                      </div>
                    </div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentEditor;
