import React, { useState, useEffect } from 'react';
import { ComponentSchema, SchemaItem } from '../../types/schema';
import { Button } from '../../../src/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../src/components/ui/accordion';
import { Label } from '../../../src/components/ui/label';
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
  Settings,
  Plus,
  Trash2
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
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
  
  // Auto-expand all items when schema changes
  useEffect(() => {
    if (schema.items && schema.items.length > 0) {
      const allIndices = schema.items.map((_, index) => index);
      setExpandedItems(new Set([0, ...allIndices]));
    }
  }, [schema]);
  
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

    let currentLevel: { items: SchemaItem[] } = { items: updatedItems };

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

  // Helper function to check if an item has array properties
  const hasArrayProperties = (item: SchemaItem) => {
    if (item.type === 'array') return true;
    if (item.type === 'carousel' && item.images) return true;
    if (item.type === 'gallery' && item.value) return true;
    if (item.items && Array.isArray(item.items)) return true;
    
    // Check for common array properties
    const arrayProps = ['slides', 'testimonials', 'faqs', 'teamMembers', 'clientLogos', 'ctaButtons'];
    return arrayProps.some(prop => Array.isArray((item as Record<string, unknown>)[prop]));
  };

  // Helper function to get array items from a schema item
  const getArrayItems = (item: SchemaItem) => {
    if (item.type === 'carousel' && item.images) return item.images;
    if (item.type === 'gallery' && item.value) return item.value;
    if (item.items && Array.isArray(item.items)) return item.items;
    
    // Check for common array properties
    const arrayProps = ['slides', 'testimonials', 'faqs', 'teamMembers', 'clientLogos', 'ctaButtons'];
    for (const prop of arrayProps) {
      const value = (item as Record<string, unknown>)[prop];
      if (Array.isArray(value)) return value;
    }
    
    return [];
  };

  // Helper function to get array property name
  const getArrayPropertyName = (item: SchemaItem) => {
    if (item.type === 'carousel' && item.images) return 'images';
    if (item.type === 'gallery' && item.value) return 'value';
    if (item.items && Array.isArray(item.items)) return 'items';
    
    const arrayProps = ['slides', 'testimonials', 'faqs', 'teamMembers', 'clientLogos', 'ctaButtons'];
    for (const prop of arrayProps) {
      const value = (item as Record<string, unknown>)[prop];
      if (Array.isArray(value)) return prop;
    }
    
    return 'items';
  };

  // Add array item
  const addArrayItem = (itemIndex: number, arrayProp: string) => {
    const updatedItems = [...safeSchema.items];
    const item = updatedItems[itemIndex];
    const currentArray = (item as Record<string, unknown>)[arrayProp] as unknown[] || [];
    
    // Create a default item based on existing items or common patterns
    let defaultItem: Record<string, unknown> = {};
    if (currentArray.length > 0) {
      defaultItem = { ...currentArray[0] };
      // Clear values but keep structure
      Object.keys(defaultItem).forEach(key => {
        if (typeof defaultItem[key] === 'string') defaultItem[key] = '';
        else if (typeof defaultItem[key] === 'number') defaultItem[key] = 0;
        else if (typeof defaultItem[key] === 'boolean') defaultItem[key] = false;
      });
    } else {
      // Default structures for common array types
      if (arrayProp === 'slides' || arrayProp === 'images') {
        defaultItem = { url: '', alt: '', title: '' };
      } else if (arrayProp === 'testimonials') {
        defaultItem = { name: '', content: '', role: '', company: '' };
      } else if (arrayProp === 'faqs') {
        defaultItem = { question: '', answer: '' };
      } else if (arrayProp === 'teamMembers') {
        defaultItem = { name: '', role: '', image: '', bio: '' };
      } else {
        defaultItem = { title: '', content: '' };
      }
    }
    
    const updatedArray = [...currentArray, defaultItem];
    const updatedItem = { ...item, [arrayProp]: updatedArray };
    updatedItems[itemIndex] = updatedItem;
    
    const updatedSchema = { ...safeSchema, items: updatedItems };
    onChange?.(updatedSchema);
  };

  // Remove array item
  const removeArrayItem = (itemIndex: number, arrayProp: string, arrayItemIndex: number) => {
    const updatedItems = [...safeSchema.items];
    const item = updatedItems[itemIndex];
    const currentArray = (item as Record<string, unknown>)[arrayProp] as unknown[] || [];
    
    const updatedArray = currentArray.filter((_: unknown, index: number) => index !== arrayItemIndex);
    const updatedItem = { ...item, [arrayProp]: updatedArray };
    updatedItems[itemIndex] = updatedItem;
    
    const updatedSchema = { ...safeSchema, items: updatedItems };
    onChange?.(updatedSchema);
  };

  // Update array item
  const updateArrayItem = (itemIndex: number, arrayProp: string, arrayItemIndex: number, field: string, value: unknown) => {
    const updatedItems = [...safeSchema.items];
    const item = updatedItems[itemIndex];
    const currentArray = [...((item as Record<string, unknown>)[arrayProp] as Record<string, unknown>[] || [])];
    
    const updatedArrayItem = { ...currentArray[arrayItemIndex], [field]: value };
    currentArray[arrayItemIndex] = updatedArrayItem;
    
    const updatedItem = { ...item, [arrayProp]: currentArray };
    updatedItems[itemIndex] = updatedItem;
    
    const updatedSchema = { ...safeSchema, items: updatedItems };
    onChange?.(updatedSchema);
  };


  // Render component items with enhanced array support
  const renderComponentItem = (item: SchemaItem, index: number) => {
    const isArrayItem = hasArrayProperties(item);
    
    if (isArrayItem) {
      const arrayItems = getArrayItems(item);
      const arrayProp = getArrayPropertyName(item);
      
      return (
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
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {arrayItems.length} {arrayItems.length === 1 ? 'item' : 'items'}
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
            <div className="p-4 border-t bg-white space-y-4">
              {/* Render non-array properties first */}
              <div className="space-y-4">
                <SchemaItemEditor 
                  item={item} 
                  onChange={(updatedItem) => handleItemChange([index], updatedItem)} 
                  path={[index]} 
                />
              </div>
              
              {/* Render array items */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {arrayProp === 'slides' || arrayProp === 'images' ? 'Slides' :
                     arrayProp === 'testimonials' ? 'Testimonials' :
                     arrayProp === 'faqs' ? 'FAQ Items' :
                     arrayProp === 'teamMembers' ? 'Team Members' :
                     arrayProp === 'clientLogos' ? 'Client Logos' :
                     arrayProp === 'ctaButtons' ? 'CTA Buttons' : 'Items'}
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addArrayItem(index, arrayProp)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
                
                <Accordion type="multiple" className="w-full">
                  {arrayItems.map((arrayItem: Record<string, unknown>, arrayIndex: number) => (
                    <AccordionItem key={arrayIndex} value={`array-item-${arrayIndex}`}>
                      <AccordionTrigger className="hover:bg-secondary/20 px-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {arrayItem.title || arrayItem.name || arrayItem.question || arrayItem.label || `Item ${arrayIndex + 1}`}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-secondary/10 rounded-lg mt-2">
                        <div className="space-y-4">
                          {Object.entries(arrayItem).map(([key, value]) => (
                            <div key={key} className="ml-2">
                              <Label className="text-sm font-medium mb-2 block">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </Label>
                              {typeof value === 'string' ? (
                                value.length > 100 ? (
                                  <textarea
                                    value={value}
                                    onChange={(e) => updateArrayItem(index, arrayProp, arrayIndex, key, e.target.value)}
                                    className="w-full p-2 border rounded-md resize-vertical min-h-[80px]"
                                    placeholder={`Enter ${key}`}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => updateArrayItem(index, arrayProp, arrayIndex, key, e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder={`Enter ${key}`}
                                  />
                                )
                              ) : typeof value === 'number' ? (
                                <input
                                  type="number"
                                  value={value}
                                  onChange={(e) => updateArrayItem(index, arrayProp, arrayIndex, key, Number(e.target.value))}
                                  className="w-full p-2 border rounded-md"
                                  placeholder={`Enter ${key}`}
                                />
                              ) : typeof value === 'boolean' ? (
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => updateArrayItem(index, arrayProp, arrayIndex, key, e.target.checked)}
                                    className="rounded"
                                  />
                                  <span className="text-sm">Enable {key}</span>
                                </label>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  Complex type: {typeof value}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <div className="flex justify-end pt-2 border-t">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeArrayItem(index, arrayProp, arrayIndex)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Remove
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {arrayItems.length === 0 && (
                  <div className="text-center p-4 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No items added yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => addArrayItem(index, arrayProp)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add First Item
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Regular item without arrays
    return (
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
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {safeSchema.items && safeSchema.items.length > 0 ? 
        safeSchema.items.map((item, index) => renderComponentItem(item, index)) : (
        <div className="text-center py-8 text-gray-500">
          <p>No items in this component</p>
        </div>
      )}
    </div>
  );
};

export default ComponentEditor;
