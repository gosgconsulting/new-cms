import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ComponentSchema, SchemaItem } from '../../types/schema';
import { Button } from '../../../src/components/ui/button';
import { Label } from '../../../src/components/ui/label';
import { ItemEditor } from './ItemEditors';
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
import { Textarea } from '../../../src/components/ui/textarea';
import { uploadFile } from '../../utils/uploadToBlob';

interface ComponentEditorProps {
  schema: ComponentSchema;
  onChange?: (data: ComponentSchema) => void;
  className?: string;
}


// Global map to store expandedItems per component key (survives remounts)
const expandedItemsMap = new Map<string, Set<number>>();
const activeArrayTabMap = new Map<string, Record<number, number>>();
const expandedKeysMap = new Map<string, Set<string>>();

export const ComponentEditor: React.FC<ComponentEditorProps> = ({
  schema,
  onChange,
  className = ''
}) => {
  // Use a stable key based on schema.key to persist state across remounts
  const componentKey = `component-${schema.key}`;
  
  // Initialize from global map or create new
  const [expandedItems, setExpandedItems] = useState<Set<number>>(() => {
    return expandedItemsMap.get(componentKey) || new Set();
  });
  const [activeArrayTab, setActiveArrayTab] = useState<Record<number, number>>(() => {
    return activeArrayTabMap.get(componentKey) || {};
  });
  
  // Store original schema structure to preserve field structure when array is empty
  const originalSchemaRef = useRef<ComponentSchema | null>(null);
  // Track the schema key to preserve expandedItems when only content changes
  const schemaKeyRef = useRef<string>(schema.key);
  // Track expanded items by key (not just index) to preserve across updates
  const expandedKeysRef = useRef<Set<string>>(expandedKeysMap.get(componentKey) || new Set());
  
  // Initialize expandedKeysMap if needed
  if (!expandedKeysMap.has(componentKey)) {
    expandedKeysMap.set(componentKey, expandedKeysRef.current);
  }

  // Sync state to global map whenever it changes
  useEffect(() => {
    expandedItemsMap.set(componentKey, expandedItems);
  }, [componentKey, expandedItems]);

  useEffect(() => {
    activeArrayTabMap.set(componentKey, activeArrayTab);
  }, [componentKey, activeArrayTab]);

  useEffect(() => {
    expandedKeysMap.set(componentKey, expandedKeysRef.current);
  }, [componentKey]);

  // Track previous item keys to detect structure changes
  const previousItemKeysRef = useRef<string>('');

  // Store original schema structure on first mount and when schema key changes
  useEffect(() => {
    // Update original schema if it's not set, or if the schema key has changed (new component)
    const currentSchemaKey = schema.key;
    
    // If schema key changed, reset expanded items (new component selected)
    if (currentSchemaKey !== schemaKeyRef.current) {
      const newComponentKey = `component-${currentSchemaKey}`;
      expandedItemsMap.set(newComponentKey, new Set());
      activeArrayTabMap.set(newComponentKey, {});
      expandedKeysMap.set(newComponentKey, new Set());
      setExpandedItems(new Set());
      setActiveArrayTab({});
      expandedKeysRef.current = new Set();
      schemaKeyRef.current = currentSchemaKey;
      const currentItems = schema.items || [];
      previousItemKeysRef.current = currentItems.map(item => item.key).join(',');
      originalSchemaRef.current = JSON.parse(JSON.stringify(schema));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema.key]); // Only depend on schema.key

  // Initialize previousItemKeysRef on mount
  useEffect(() => {
    if (previousItemKeysRef.current === '') {
      const currentItems = schema.items || [];
      previousItemKeysRef.current = currentItems.map(item => item.key).join(',');
    }
  }, []);

  // Toggle item expansion
  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    const items = schema.items || [];
    const item = items[index];
    
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
      if (item?.key) {
        expandedKeysRef.current.delete(item.key);
      }
    } else {
      newExpanded.add(index);
      if (item?.key) {
        expandedKeysRef.current.add(item.key);
      }
    }
    // Update both state and global map (so it persists even if component remounts)
    setExpandedItems(newExpanded);
    expandedItemsMap.set(componentKey, newExpanded);
    expandedKeysMap.set(componentKey, expandedKeysRef.current);
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
  
  // Ensure schema has items property - memoize to prevent unnecessary re-renders
  // Only recalculate when item keys change, not on every content update
  // Calculate item keys string first (stable reference)
  const itemKeysString = (schema.items || []).map(i => i.key).join(',');
  const safeSchema = useMemo(() => ({
    ...schema,
    items: schema.items || []
  }), [schema.key, itemKeysString, schema.items?.length]);

  // No toggle functionality - items are always expanded

  
  const handleItemChange = useCallback((path: (string | number)[], updatedItem: SchemaItem) => {
    console.log('[testing] handleItemChange called:', { path, updatedItem: { key: updatedItem.key, type: updatedItem.type, content: updatedItem.content } });
    
    // Deep clone the updated item to ensure it's a new object reference
    const updatedItemClone = JSON.parse(JSON.stringify(updatedItem));
    
    // Handle simple case: direct item update (path is just [index])
    if (path.length === 1) {
      const index = path[0] as number;
      if (index >= 0 && index < safeSchema.items.length) {
        // Create new array with updated item at index
        // Deep clone all items to ensure new references
        const updatedItems = safeSchema.items.map((item, i) => 
          i === index ? updatedItemClone : JSON.parse(JSON.stringify(item))
        );
        // Create completely new schema object
        const updatedSchema: ComponentSchema = {
          ...safeSchema,
          items: updatedItems
        };
        console.log('[testing] Simple update - calling onChange with:', { 
          itemsCount: updatedItems.length,
          updatedItemIndex: index,
          updatedItemKey: updatedItem.key,
          updatedItemContent: updatedItem.content
        });
        onChange?.(updatedSchema);
        return;
      }
    }

    // Handle nested case: traverse path and update, creating new arrays at each level
    const updateNestedItem = (
      items: SchemaItem[], 
      pathIndex: number, 
      updatedItemToUse: SchemaItem
    ): SchemaItem[] => {
      if (pathIndex >= path.length) {
        return items;
      }

      const keyOrIndex = path[pathIndex];
      const isLast = pathIndex === path.length - 1;

      return items.map((item, idx) => {
        // Check if this is the item we're looking for
        const matches = typeof keyOrIndex === 'string' 
          ? item.key === keyOrIndex 
          : idx === keyOrIndex;

        if (!matches) {
          // Not this item, but might need to recurse if it has nested items
          if (item.items && pathIndex < path.length - 1) {
            return {
              ...item,
              items: updateNestedItem(item.items, pathIndex + 1, updatedItemToUse)
            };
          }
          return item;
        }

        // This is the item we're looking for
        if (isLast) {
          // Last in path - replace with updated item
          return updatedItemToUse;
        } else {
          // Not last - recurse into nested items
          if (item.items) {
            return {
              ...item,
              items: updateNestedItem(item.items, pathIndex + 1, updatedItemToUse)
            };
          }
          return item;
        }
      });
    };

    // Use the already cloned item for nested updates
    const updatedItems = updateNestedItem(safeSchema.items, 0, updatedItemClone);
    // Create completely new schema object
    const updatedSchema: ComponentSchema = {
      ...safeSchema,
      items: updatedItems
    };
    console.log('[testing] Nested update - calling onChange with:', { 
      itemsCount: updatedItems.length,
      path: path,
      updatedItemKey: updatedItem.key
    });
    onChange?.(updatedSchema);
  }, [safeSchema, onChange]);

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

  // Keys to preserve when copying array items (structural fields needed for ItemEditor routing)
  const PRESERVE_WHEN_COPYING = ['type', 'key'];

  // Add array item
  const addArrayItem = (itemIndex: number, arrayProp: string) => {
    const updatedItems = [...safeSchema.items];
    const item = updatedItems[itemIndex];
    const currentArray = (item as unknown as Record<string, unknown>)[arrayProp] as unknown[] || [];
    
    // Create a default item based on existing items or original schema structure
    let defaultItem: Record<string, unknown> = {};
    const clearValuesButPreserveStructure = (obj: Record<string, unknown>) => {
      const result = { ...obj };
      Object.keys(result).forEach(key => {
        if (PRESERVE_WHEN_COPYING.includes(key)) {
          // Preserve type; for key, generate unique value
          if (key === 'type') return; // keep as-is
          if (key === 'key') {
            result[key] = `${arrayProp === 'slides' || arrayProp === 'images' ? 'slide' : 'item'}_${Date.now()}`;
            return;
          }
        }
        if (typeof result[key] === 'string') result[key] = '';
        else if (typeof result[key] === 'number') result[key] = 0;
        else if (typeof result[key] === 'boolean') result[key] = false;
        else if (Array.isArray(result[key])) result[key] = [];
        else if (typeof result[key] === 'object' && result[key] !== null) {
          result[key] = typeof (result[key] as Record<string, unknown>) === 'object' && !Array.isArray(result[key])
            ? { ...(result[key] as Record<string, unknown>) }
            : {};
        }
      });
      return result;
    };

    if (currentArray.length > 0) {
      // Use existing item structure
      defaultItem = clearValuesButPreserveStructure(currentArray[0] as Record<string, unknown>);
    } else {
      // Array is empty - try to get structure from original schema
      if (originalSchemaRef.current) {
        const originalItems = originalSchemaRef.current.items || [];
        const originalItem = originalItems[itemIndex];
        if (originalItem) {
          const originalArray = (originalItem as unknown as Record<string, unknown>)[arrayProp] as unknown[] || [];
          if (originalArray.length > 0) {
            // Use original schema structure
            defaultItem = clearValuesButPreserveStructure(originalArray[0] as Record<string, unknown>);
          }
        }
      }
      
      // Fallback to default structures if original schema doesn't have the structure
      if (Object.keys(defaultItem).length === 0 || !defaultItem.type) {
        if (arrayProp === 'slides' || arrayProp === 'images') {
          defaultItem = {
            type: 'image',
            key: `slide_${Date.now()}`,
            src: '',
            url: '',
            alt: '',
            title: '',
            settings: { layout: 'full' }
          };
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
    // Check if it has image properties (url, src, or image field)
    const hasImageField = !!(arrayItem.url || arrayItem.src || arrayItem.image);
    // Also check if the item has type "image" or key contains "image"
    const isImageType = arrayItem.type === 'image' || 
                       (typeof arrayItem.key === 'string' && arrayItem.key.toLowerCase().includes('image'));
    return hasImageField || isImageType;
  };

  // Function to detect and add missing fields to items
  const detectAndFixMissingFields = (schemaToCheck: ComponentSchema): ComponentSchema => {
    const updatedItems = [...(schemaToCheck.items || [])];
    let hasChanges = false;

    updatedItems.forEach((item, itemIndex) => {
      if (hasArrayProperties(item)) {
        const arrayItems = getArrayItems(item);
        const arrayProp = getArrayPropertyName(item);
        
        const updatedArrayItems = arrayItems.map((arrayItem: any) => {
          // Check if it's an image item
          if (isImageItem(arrayProp, arrayItem)) {
            const hasTitle = arrayItem.title !== undefined;
            const hasText = arrayItem.text !== undefined;
            const hasContent = arrayItem.content !== undefined;
            
            // If image item is missing text/title field, add it
            if (!hasTitle && !hasText && !hasContent) {
              hasChanges = true;
              return { ...arrayItem, title: '' };
            }
          }
          return arrayItem;
        });
        
        if (hasChanges) {
          const updatedItem = { ...item, [arrayProp]: updatedArrayItems };
          updatedItems[itemIndex] = updatedItem;
        }
      }
    });

    return hasChanges ? { ...schemaToCheck, items: updatedItems } : schemaToCheck;
  };

  // Auto-fix missing fields on mount and when schema key changes (not on every content update)
  // This prevents the editor from closing when typing
  useEffect(() => {
    // Only run auto-fix when schema key changes (new component) or on initial mount
    // Don't run on every content update to avoid closing editors
    const fixedSchema = detectAndFixMissingFields(schema);
    // Use JSON.stringify to properly compare objects
    // Only call onChange if structure actually changed (not just content)
    const currentStructure = JSON.stringify(fixedSchema.items?.map(i => ({ key: i.key, type: i.type })));
    const originalStructure = JSON.stringify(schema.items?.map(i => ({ key: i.key, type: i.type })));
    
    if (currentStructure !== originalStructure && onChange) {
      onChange(fixedSchema);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema.key]); // Only depend on schema.key, not the entire schema

  // Helper function to handle image upload
  const handleImageUpload = async (itemIndex: number, arrayProp: string, arrayItemIndex: number, file: File) => {
    try {
      const result = await uploadFile(file);
      const newUrl = result.url;
      if (!newUrl) {
        console.error('Upload response missing url');
        alert('Failed to upload image. Please try again.');
        return;
      }
      const items = safeSchema.items || [];
      const parentItem = items[itemIndex] as unknown as Record<string, unknown>;
      const currentArray = (parentItem[arrayProp] as Record<string, unknown>[]) || [];
      const currentItem = { ...(currentArray[arrayItemIndex] as Record<string, unknown>) };
      const updatedItem = { ...currentItem, src: newUrl };
      setArrayItemObject(itemIndex, arrayProp, arrayItemIndex, updatedItem);
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
            onClick={(e) => {
              // Only toggle if clicking on the header itself, not on child elements
              // Check if the click target is the header div or its direct children (icon, text, badge, button)
              const target = e.target as HTMLElement;
              const currentTarget = e.currentTarget as HTMLElement;
              
              // Allow clicks on interactive elements (buttons, inputs, selects) to work normally
              if (target.tagName === 'BUTTON' || 
                  target.tagName === 'INPUT' || 
                  target.tagName === 'SELECT' || 
                  target.tagName === 'TEXTAREA' ||
                  target.closest('button') ||
                  target.closest('input') ||
                  target.closest('select') ||
                  target.closest('textarea') ||
                  target.closest('[role="combobox"]') ||
                  target.closest('[role="listbox"]')) {
                return; // Don't toggle, let the element handle the click
              }
              
              // Only toggle if clicking on the header area itself
              if (target === currentTarget || target.parentElement === currentTarget) {
                toggleItem(index);
              }
            }}
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
            <div 
              className="p-4 bg-white space-y-4"
              onClick={(e) => {
                // Stop propagation to prevent parent onClick from firing
                // This allows inputs, dropdowns, and buttons inside to work normally
                e.stopPropagation();
              }}
            >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        addArrayItem(index, arrayProp);
                      }}
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
                      const makeTab = (label: string, isActive: boolean, onClick: () => void, tabKey: string | number) => (
                        <button
                          key={tabKey}
                          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                            isActive 
                              ? 'border-blue-500 text-blue-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent parent onClick from firing
                            onClick();
                          }}
                        >
                          {label}
                        </button>
                      );
                      return arrayItems.map((arrItem, tabIndex) =>
                        makeTab(
                          arrayProp === 'slides' || arrayProp === 'images' ? `Slide ${tabIndex + 1}` : `Item ${tabIndex + 1}`,
                          currentTab === tabIndex,
                          () => setActiveArrayTab(prev => ({ ...prev, [index]: tabIndex })),
                          (arrItem as { key?: string })?.key ?? `${index}-${tabIndex}`
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
                            onClick={(e) => {
                              e.stopPropagation();
                              addArrayItem(index, arrayProp);
                            }}
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
                      <div 
                        className="p-4 bg-white pb-6"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {isImageItem(arrayProp, currentArrayItem) ? (
                          (() => {
                            const imgUrl = (currentArrayItem as any).src ?? '';
                            // Get all fields that should be displayed
                            const item = currentArrayItem as any;
                            // Check if fields exist (even if empty string - they're still valid fields)
                            const hasTitle = 'title' in item && item.title !== undefined;
                            const hasText = 'text' in item && item.text !== undefined;
                            const hasContent = 'content' in item && item.content !== undefined;
                            // Prioritize: title > text > content > default to 'content' for image items
                            const textKey = hasTitle ? 'title' : (hasText ? 'text' : (hasContent ? 'content' : 'content'));
                            const hasLink = 'link' in item && item.link !== undefined;
                            const hasAlt = 'alt' in item && item.alt !== undefined;
                            
                            // Ensure content field exists if item has type "image" and no text fields
                            if (item.type === 'image' && !hasTitle && !hasText && !hasContent) {
                              // Auto-add content field if missing
                              updateArrayItem(index, arrayProp, currentTab, 'content', '');
                            }
                            
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
                                      key={`src-${index}-${arrayProp}-${currentTab}`}
                                      type="url"
                                      defaultValue={imgUrl}
                                      onBlur={(e) => updateArrayItem(index, arrayProp, currentTab, 'src', e.target.value)}
                                      className="w-full p-2 rounded-md border"
                                      placeholder="Enter image URL"
                                    />
                                  </div>
                                  {/* Always show Text/Title/Content field - always visible for image items */}
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">
                                      {hasTitle ? 'Title' : (hasText ? 'Text' : (hasContent ? 'Content' : 'Content'))}
                                    </Label>
                                    <input
                                      key={`text-${index}-${arrayProp}-${currentTab}-${textKey}`}
                                      type="text"
                                      defaultValue={item[textKey] || ''}
                                      onBlur={(e) => updateArrayItem(index, arrayProp, currentTab, textKey, e.target.value)}
                                      className="w-full p-2 rounded-md border"
                                      placeholder="Enter text or title"
                                    />
                                  </div>
                                  {/* Show Link field if it exists */}
                                  {hasLink && (
                                    <div>
                                      <Label className="text-sm font-medium mb-2 block">Link URL</Label>
                                      <input
                                        key={`link-${index}-${arrayProp}-${currentTab}`}
                                        type="url"
                                        defaultValue={item.link || ''}
                                        onBlur={(e) => updateArrayItem(index, arrayProp, currentTab, 'link', e.target.value)}
                                        className="w-full p-2 rounded-md border"
                                        placeholder="Enter link URL"
                                      />
                                    </div>
                                  )}
                                  {/* Show Alt Text field if it exists */}
                                  {hasAlt && (
                                    <div>
                                      <Label className="text-sm font-medium mb-2 block">Alt Text</Label>
                                      <input
                                        key={`alt-${index}-${arrayProp}-${currentTab}`}
                                        type="text"
                                        defaultValue={item.alt || ''}
                                        onBlur={(e) => updateArrayItem(index, arrayProp, currentTab, 'alt', e.target.value)}
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeArrayItem(index, arrayProp, currentTab);
                                      }}
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
                                          (key === 'content' || key === 'description' || key === 'text' || (typeof value === 'string' && value.length > 100)) ? (
                                            <Textarea
                                              value={value || ''}
                                              onChange={(e) => updateArrayItem(index, arrayProp, currentTab, key, e.target.value)}
                                              className="w-full border border-gray-300 rounded-md bg-white"
                                              placeholder={`Enter ${key === 'content' ? 'text' : key}`}
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
                  onClick={(e) => {
                    // Only toggle if clicking on the header itself, not on child elements
                    const target = e.target as HTMLElement;
                    
                    // Don't toggle if clicking on interactive elements or their children
                    if (target.closest('button') || 
                        target.closest('input') || 
                        target.closest('select') || 
                        target.closest('textarea') ||
                        target.closest('[role="combobox"]') ||
                        target.closest('[role="listbox"]') ||
                        target.closest('[role="menu"]') ||
                        target.closest('[role="menuitem"]') ||
                        target.closest('a') ||
                        target.closest('label')) {
                      // Let the interactive element handle the click
                      return;
                    }
                    
                    // Only toggle if clicking directly on the header or its non-interactive children
                    toggleItem(index);
                  }}
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
                  <div 
                    className="p-4 bg-white"
                    onClick={(e) => {
                      // Stop propagation to prevent parent onClick from firing
                      e.stopPropagation();
                    }}
                  >
                    <ItemEditor 
                      key={`item-editor-${item.key}-${index}`}
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