import React, { useState, useEffect } from 'react';
import { ComponentSchema, SchemaItem } from '../../types/schema';
import { Button } from '../../../src/components/ui/button';
import { Label } from '../../../src/components/ui/label';
import { ItemEditor } from './ItemEditors';
import QuillEditor from './QuillEditor';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
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
  Trash2,
  Upload,
  X
} from 'lucide-react';
import ImageThumbnail from './ImageThumbnail';

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
  const [activeArrayTab, setActiveArrayTab] = useState<Record<number, number>>({});

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


  // No toggle functionality - items are always expanded

  
  const handleItemChange = (path: (string | number)[], updatedItem: SchemaItem) => {
    const updatedItems = [...safeSchema.items];

    let currentLevel: { items?: SchemaItem[] } | SchemaItem = { items: updatedItems };

    for (let i = 0; i < path.length - 1; i++) {
      const keyOrIndex = path[i];
      if (typeof keyOrIndex === 'string') {
        currentLevel = currentLevel.items?.find((item: SchemaItem) => item.key === keyOrIndex);
      } else {
        currentLevel = currentLevel.items?.[keyOrIndex];
      }
      if (!currentLevel) {
        console.error('[ComponentEditor] Invalid path, could not find item at:', path.slice(0, i + 1));
        return;
      }
    }

    const lastKeyOrIndex = path[path.length - 1];
    if (typeof lastKeyOrIndex === 'string') {
      const itemIndex = currentLevel.items?.findIndex((item: SchemaItem) => item.key === lastKeyOrIndex) ?? -1;
      if (itemIndex !== -1 && currentLevel.items) {
        currentLevel.items[itemIndex] = updatedItem;
      }
    } else {
      if (currentLevel.items) {
        currentLevel.items[lastKeyOrIndex] = updatedItem;
      }
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
    return arrayProps.some(prop => Array.isArray((item as unknown as Record<string, unknown>)[prop]));
  };

  // Helper function to get array items from a schema item
  const getArrayItems = (item: SchemaItem) => {
    if (item.type === 'carousel' && item.images) return item.images;
    if (item.type === 'gallery' && item.value) return item.value;
    if (item.items && Array.isArray(item.items)) return item.items;
    
    // Check for common array properties
    const arrayProps = ['slides', 'testimonials', 'faqs', 'teamMembers', 'clientLogos', 'ctaButtons'];
    for (const prop of arrayProps) {
      const value = (item as unknown as Record<string, unknown>)[prop];
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
      const value = (item as unknown as Record<string, unknown>)[prop];
      if (Array.isArray(value)) return prop;
    }
    
    return 'items';
  };

  // Add array item
  const addArrayItem = (itemIndex: number, arrayProp: string) => {
    const updatedItems = [...safeSchema.items];
    const item = updatedItems[itemIndex];
    const currentArray = (item as unknown as Record<string, unknown>)[arrayProp] as unknown[] || [];
    
    // Create a default item based on existing items or common patterns
    let defaultItem: Record<string, unknown> = {};
    if (currentArray.length > 0) {
      defaultItem = { ...(currentArray[0] as Record<string, unknown>) };
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
    
    // Set active tab to the newly added item
    setActiveArrayTab(prev => ({ ...prev, [itemIndex]: updatedArray.length - 1 }));
    
    const updatedSchema = { ...safeSchema, items: updatedItems };
    onChange?.(updatedSchema);
  };

  // Remove array item
  const removeArrayItem = (itemIndex: number, arrayProp: string, arrayItemIndex: number) => {
    const updatedItems = [...safeSchema.items];
    const item = updatedItems[itemIndex];
    const currentArray = (item as unknown as Record<string, unknown>)[arrayProp] as unknown[] || [];
    
    const updatedArray = currentArray.filter((_: unknown, index: number) => index !== arrayItemIndex);
    const updatedItem = { ...item, [arrayProp]: updatedArray };
    updatedItems[itemIndex] = updatedItem;
    
    // Adjust active tab if necessary
    const currentActiveTab = activeArrayTab[itemIndex] || 0;
    if (currentActiveTab >= updatedArray.length && updatedArray.length > 0) {
      // If the current active tab is beyond the new array length, set it to the last item
      setActiveArrayTab(prev => ({ ...prev, [itemIndex]: updatedArray.length - 1 }));
    } else if (currentActiveTab > arrayItemIndex && updatedArray.length > 0) {
      // If we removed an item before the current active tab, adjust the tab index
      setActiveArrayTab(prev => ({ ...prev, [itemIndex]: currentActiveTab - 1 }));
    } else if (updatedArray.length === 0) {
      // If no items left, reset the tab
      setActiveArrayTab(prev => ({ ...prev, [itemIndex]: 0 }));
    }
    
    const updatedSchema = { ...safeSchema, items: updatedItems };
    onChange?.(updatedSchema);
  };

  // Update array item
  const updateArrayItem = (itemIndex: number, arrayProp: string, arrayItemIndex: number, field: string, value: unknown) => {
    const updatedItems = [...safeSchema.items];
    const item = updatedItems[itemIndex];
    const currentArray = [...((item as unknown as Record<string, unknown>)[arrayProp] as Record<string, unknown>[] || [])];
    
    const updatedArrayItem = { ...currentArray[arrayItemIndex], [field]: value };
    currentArray[arrayItemIndex] = updatedArrayItem;
    
    const updatedItem = { ...item, [arrayProp]: currentArray };
    updatedItems[itemIndex] = updatedItem;
    
    const updatedSchema = { ...safeSchema, items: updatedItems };
    onChange?.(updatedSchema);
  };

  // Replace an entire array item object (used when editing schema-like or grouped items)
  const setArrayItemObject = (itemIndex: number, arrayProp: string, arrayItemIndex: number, updatedObj: Record<string, unknown>) => {
    const updatedItems = [...safeSchema.items];
    const item = updatedItems[itemIndex];
    const currentArray = [...(((item as unknown as Record<string, unknown>)[arrayProp] as Record<string, unknown>[]) || [])];
    currentArray[arrayItemIndex] = updatedObj;
    const updatedItem = { ...item, [arrayProp]: currentArray };
    updatedItems[itemIndex] = updatedItem;
    const updatedSchema = { ...safeSchema, items: updatedItems };
    onChange?.(updatedSchema);
  };

  // Helper function to check if an array item is an image/slide
  const isImageItem = (arrayProp: string, arrayItem: Record<string, unknown>) => {
    return (arrayProp === 'slides' || arrayProp === 'images') && 
           (arrayItem.url || arrayItem.src || arrayItem.image);
  };

  // Helper function to handle image upload
  const handleImageUpload = async (itemIndex: number, arrayProp: string, arrayItemIndex: number, file: File) => {
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to your image service (adjust URL as needed)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update the array item with the new image URL
        updateArrayItem(itemIndex, arrayProp, arrayItemIndex, 'url', result.url);
      } else {
        console.error('Upload failed');
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };


  // Render component items with enhanced array support
  const renderComponentItem = (item: SchemaItem, index: number) => {
    const isArrayItem = hasArrayProperties(item);
    
    if (isArrayItem) {
      const arrayItems = getArrayItems(item);
      const arrayProp = getArrayPropertyName(item);
      
      return (
        <div key={`${item.key}-${index}`} className="overflow-hidden">
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
            <div className="p-4 bg-white space-y-4">
              {/* Unified tab-based editing */}
              <div className="space-y-4 pt-4">
                {/* Tab-style interface */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium uppercase tracking-wide">
                        {arrayProp === 'slides' || arrayProp === 'images' ? 'SLIDES' :
                         arrayProp === 'testimonials' ? 'TESTIMONIALS' :
                         arrayProp === 'faqs' ? 'FAQS' :
                         arrayProp === 'teamMembers' ? 'TEAMMEMBERS' :
                         arrayProp === 'clientLogos' ? 'CLIENTLOGOS' :
                         arrayProp === 'ctaButtons' ? 'CTABUTTONS' : 'ITEMS'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {arrayItems.length} {arrayItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addArrayItem(index, arrayProp)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> 
                      Add {arrayProp === 'slides' || arrayProp === 'images' ? 'Slide' : 'Item'}
                    </Button>
                  </div>

                  {/* Tabs list without bottom border */}
                  <div className="flex gap-1 mb-4">
                    {(() => {
                      const currentTab = (activeArrayTab[index] ?? 0);
                      const makeTab = (label: string, isActive: boolean, onClick: () => void) => (
                        <button
                          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                            isActive 
                              ? 'border-blue-500 text-blue-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={onClick}
                        >
                          {label}
                        </button>
                      );
                      return arrayItems.map((_, tabIndex) =>
                        makeTab(
                          arrayProp === 'slides' || arrayProp === 'images' ? `Slide ${tabIndex + 1}` : `Item ${tabIndex + 1}`,
                          currentTab === tabIndex,
                          () => setActiveArrayTab(prev => ({ ...prev, [index]: tabIndex }))
                        )
                      );
                    })()}
                  </div>

                  {/* Tab Content */}
                  {(() => {
                    const currentTab = (activeArrayTab[index] ?? 0);
                    if (arrayItems.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <p>No items added yet</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2" 
                            onClick={() => addArrayItem(index, arrayProp)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Item
                          </Button>
                        </div>
                      );
                    }

                    // Specific array item editor (keep existing image/non-image logic)
                    const currentArrayItem = arrayItems[currentTab];
                    if (!currentArrayItem) return null;

                    return (
                      <div className="p-4 bg-white">
                        {isImageItem(arrayProp, currentArrayItem) ? (
                          (() => {
                            const imgUrl = (currentArrayItem as any).url || (currentArrayItem as any).src || (currentArrayItem as any).image || '';
                            const urlKey = (currentArrayItem as any).url !== undefined ? 'url' : ((currentArrayItem as any).src !== undefined ? 'src' : 'image');
                            return (
                              <div className="space-y-3">
                                <ImageThumbnail
                                  url={imgUrl}
                                  onFileSelected={(f) => handleImageUpload(index, arrayProp, currentTab, f)}
                                  onRemove={() => removeArrayItem(index, arrayProp, currentTab)}
                                />
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">Image URL</Label>
                                    <input
                                      type="url"
                                      value={imgUrl}
                                      onChange={(e) => updateArrayItem(index, arrayProp, currentTab, urlKey, e.target.value)}
                                      className="w-full p-2 rounded-md border"
                                      placeholder="Enter image URL"
                                    />
                                  </div>
                                  {'alt' in (currentArrayItem as any) && (
                                    <div>
                                      <Label className="text-sm font-medium mb-2 block">Alt Text</Label>
                                      <input
                                        type="text"
                                        value={(currentArrayItem as any).alt || ''}
                                        onChange={(e) => updateArrayItem(index, arrayProp, currentTab, 'alt', e.target.value)}
                                        className="w-full p-2 rounded-md border"
                                        placeholder="Describe the image"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                           (() => {
                             const obj = currentArrayItem as Record<string, unknown>;
                             const isSchemaItemLike = typeof obj?.['type'] === 'string' || typeof obj?.['key'] === 'string';
                             const hasNestedItems = Array.isArray(obj?.['items']);

                             // If the array element is itself a SchemaItem, render it with ItemEditor
                             if (isSchemaItemLike && !hasNestedItems) {
                               return (
                                <div className="space-y-4">
                                  <ItemEditor
                                    item={obj as unknown as SchemaItem}
                                    onChange={(updated) =>
                                      setArrayItemObject(index, arrayProp, currentTab, updated as unknown as Record<string, unknown>)
                                    }
                                    onRemove={() => removeArrayItem(index, arrayProp, currentTab)}
                                    allowRemove={true}
                                  />
                                </div>
                               );
                             }

                             // If the array element is a grouped item with nested 'items', render all nested components
                             if (hasNestedItems) {
                               const nestedItems = (obj['items'] as unknown as SchemaItem[]) || [];
                               return (
                                <div className="space-y-4">
                                  {nestedItems.map((nestedItem, nestedIndex) => (
                                    <div key={nestedItem.key ?? `${nestedItem.type}-${nestedIndex}`} className="rounded p-3">
                                       <ItemEditor
                                         item={nestedItem}
                                         onChange={(updatedNested) => {
                                           const updatedNestedItems = [...nestedItems];
                                           updatedNestedItems[nestedIndex] = updatedNested;
                                           setArrayItemObject(index, arrayProp, currentTab, { ...obj, items: updatedNestedItems });
                                         }}
                                         onRemove={() => {
                                           const updatedNestedItems = nestedItems.filter((_, i) => i !== nestedIndex);
                                           setArrayItemObject(index, arrayProp, currentTab, { ...obj, items: updatedNestedItems });
                                         }}
                                         allowRemove={true}
                                       />
                                     </div>
                                  ))}
                                  <div className="flex justify-end pt-2 border-t">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeArrayItem(index, arrayProp, currentTab)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                  </div>
                                </div>
                               );
                             }

                             // Fallback: simple object with primitive fields (old behavior)
                             return (
                              <div className="space-y-4">
                                {Object.entries(obj)
                                  .filter(([key]) => {
                                    const technicalFields = [
                                      'key', 'type', 'id', 'props', 'items', 'className', 
                                      'style', 'attributes', 'metadata', 'schema', 'config'
                                    ];
                                    return !technicalFields.includes(key.toLowerCase());
                                  })
                                  .map(([key, value]) => (
                                    <div key={key}>
                                      <Label className="text-sm font-medium mb-2 block">
                                        {key === 'content' ? 'Text' :
                                         key === 'link' ? 'URL' :
                                         key === 'src' ? 'Image URL' :
                                         key === 'alt' ? 'Description' :
                                         key === 'href' ? 'Link URL' :
                                         key.charAt(0).toUpperCase() + key.slice(1)}
                                      </Label>
                                      {typeof value === 'string' ? (
                                        (key.toLowerCase().includes('image') || key === 'src' || key === 'url') ? (
                                          <div className="space-y-3">
                                            <input
                                              type="url"
                                              value={value}
                                              onChange={(e) => updateArrayItem(index, arrayProp, currentTab, key, e.target.value)}
                                              className="w-full p-2 border rounded-md"
                                              placeholder="Enter image URL"
                                            />
                                          </div>
                                        ) : (
                                          key === 'content' || key === 'description' || key === 'text' || (typeof value === 'string' && value.length > 100) ? (
                                            <QuillEditor
                                              content={value || ''}
                                              onChange={(newValue) => updateArrayItem(index, arrayProp, currentTab, key, newValue)}
                                              placeholder={`Enter ${key === 'content' ? 'text' : key === 'link' || key === 'href' ? 'URL' : key}`}
                                            />
                                          ) : (
                                            <input
                                              type={key === 'link' || key === 'href' || key === 'src' ? 'url' : 'text'}
                                              value={value}
                                              onChange={(e) => updateArrayItem(index, arrayProp, currentTab, key, e.target.value)}
                                              className="w-full p-2 border border-gray-300 rounded-md bg-white"
                                              placeholder={`Enter ${key === 'content' ? 'text' : key === 'link' || key === 'href' ? 'URL' : key}`}
                                            />
                                          )
                                        )
                                      ) : typeof value === 'number' ? (
                                        <input
                                          type="number"
                                          value={value}
                                          onChange={(e) => updateArrayItem(index, arrayProp, currentTab, key, Number(e.target.value))}
                                          className="w-full p-2 border rounded-md"
                                          placeholder={`Enter ${key}`}
                                        />
                                      ) : typeof value === 'boolean' ? (
                                        <label className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => updateArrayItem(index, arrayProp, currentTab, key, e.target.checked)}
                                            className="rounded"
                                          />
                                          <span className="text-sm">Enable {key}</span>
                                        </label>
                                      ) : null}
                                    </div>
                                  ))}
                                
                                <div className="flex justify-end pt-2 border-t">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeArrayItem(index, arrayProp, currentTab)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                                  </Button>
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Regular item without arrays
  return (
              <div key={`${item.key}-${index}`} className="overflow-hidden">
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
                  <div className="p-4 bg-white">
                    <ItemEditor 
                      item={item} 
                      onChange={(updatedItem) => handleItemChange([index], updatedItem)} 
                      onRemove={() => {
                        const updatedItems = [...safeSchema.items];
                        updatedItems.splice(index, 1);
                        onChange?.({ ...safeSchema, items: updatedItems });
                      }}
                      allowRemove={false}
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