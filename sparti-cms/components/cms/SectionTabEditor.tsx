import React, { useState } from 'react';
import { Card, CardContent } from '../../../src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../src/components/ui/tabs';
import { componentRegistry } from '../../registry';
import RichTextEditor from './RichTextEditor';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Switch } from '../../../src/components/ui/switch';
import { Button } from '../../../src/components/ui/button';
import { Image, Plus, Trash } from 'lucide-react';

interface SectionTabEditorProps {
  section: any;
  onUpdate: (field: string, value: any) => void;
  onUpdateNestedData: (arrayName: string, index: number, field: string, value: any) => void;
}

const SectionTabEditor: React.FC<SectionTabEditorProps> = ({ 
  section, 
  onUpdate,
  onUpdateNestedData 
}) => {
  const [activeTab, setActiveTab] = useState('content');
  
  // Get component schema from registry
  const getComponentSchema = (type: string) => {
    // Try to get component directly by type
    let component = componentRegistry.get(type);
    
    if (!component) {
      // If not found, try to search by name or similar ID
      const components = componentRegistry.getAll();
      const matchingComponent = components.find(c => 
        c.id.includes(type) || 
        type.includes(c.id) || 
        c.name.toLowerCase().includes(type.toLowerCase())
      );
      
      if (matchingComponent) {
        component = matchingComponent;
      }
    }
    
    return component;
  };
  
  const schema = getComponentSchema(section.type);
  
  // Determine available tabs based on section data
  const getTabs = () => {
    const tabs = ['content'];
    
    // Add tabs for arrays like items, services, testimonials, etc.
    if (section.data) {
      Object.entries(section.data).forEach(([key, value]) => {
        // Include all arrays, regardless of content type
        if (Array.isArray(value) && value.length > 0) {
          tabs.push(key);
        }
      });
    }
    
    return tabs;
  };
  
  // Render editor for different property types
  const renderPropertyEditor = (property: any, propertyName: string, path: string[] = []) => {
    const currentValue = path.length === 0 
      ? section.data[propertyName] 
      : path.reduce((obj, key, i) => {
          if (i === path.length - 1) {
            return obj[key][propertyName];
          }
          return obj[key];
        }, section.data);

    switch (property.type) {
      case 'string':
        if (propertyName.toLowerCase().includes('description') && property.default?.startsWith('<')) {
          // Rich text editor for HTML content
          return (
            <div className="space-y-2">
              <Label>{property.description}</Label>
              <RichTextEditor
                content={currentValue || ''}
                onChange={(value) => {
                  if (path.length === 0) {
                    onUpdate(propertyName, value);
                  } else {
                    // Handle nested updates
                    const arrayName = path[0];
                    const index = parseInt(path[1]);
                    onUpdateNestedData(arrayName, index, propertyName, value);
                  }
                }}
              />
            </div>
          );
        }
        
        if (propertyName.toLowerCase().includes('image') || propertyName.toLowerCase().includes('src')) {
          // Image URL input
          return (
            <div className="space-y-2">
              <Label>{property.description}</Label>
              <div className="flex gap-2">
                <Input
                  value={currentValue || ''}
                  onChange={(e) => {
                    if (path.length === 0) {
                      onUpdate(propertyName, e.target.value);
                    } else {
                      const arrayName = path[0];
                      const index = parseInt(path[1]);
                      onUpdateNestedData(arrayName, index, propertyName, e.target.value);
                    }
                  }}
                  placeholder="Image URL"
                />
                <Button variant="outline" size="icon">
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              {currentValue && (
                <div className="mt-2 border rounded p-2">
                  <img 
                    src={currentValue} 
                    alt="Preview" 
                    className="max-h-24 mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          );
        }
        
        // Default string input
        return (
          <div className="space-y-2">
            <Label>{property.description}</Label>
            <Input
              value={currentValue || ''}
              onChange={(e) => {
                if (path.length === 0) {
                  onUpdate(propertyName, e.target.value);
                } else {
                  const arrayName = path[0];
                  const index = parseInt(path[1]);
                  onUpdateNestedData(arrayName, index, propertyName, e.target.value);
                }
              }}
              placeholder={property.default || ''}
            />
          </div>
        );
        
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <Label>{property.description}</Label>
            <Switch
              checked={currentValue || false}
              onCheckedChange={(checked) => {
                if (path.length === 0) {
                  onUpdate(propertyName, checked);
                } else {
                  const arrayName = path[0];
                  const index = parseInt(path[1]);
                  onUpdateNestedData(arrayName, index, propertyName, checked);
                }
              }}
            />
          </div>
        );
        
      case 'number':
        return (
          <div className="space-y-2">
            <Label>{property.description}</Label>
            <Input
              type="number"
              value={currentValue || 0}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (path.length === 0) {
                  onUpdate(propertyName, value);
                } else {
                  const arrayName = path[0];
                  const index = parseInt(path[1]);
                  onUpdateNestedData(arrayName, index, propertyName, value);
                }
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Render content tab
  const renderContentTab = () => {
    if (!schema) {
      // Fallback for when schema is not found
      return (
        <div className="space-y-4">
          {Object.entries(section.data).map(([key, value]) => {
            // Skip arrays (they get their own tabs)
            if (Array.isArray(value)) {
              return null;
            }
            
            // Create a mock property based on value type
            const mockProp = {
              type: typeof value,
              description: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
              default: value
            };
            
            return (
              <div key={key}>
                {renderPropertyEditor(mockProp, key)}
              </div>
            );
          })}
        </div>
      );
    }
    
    // Use schema to render properties
    return (
      <div className="space-y-4">
        {Object.entries(schema.properties).map(([key, prop]) => {
          // Skip arrays (they get their own tabs)
          if (prop.type === 'array') {
            return null;
          }
          
          return (
            <div key={key}>
              {renderPropertyEditor(prop, key)}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render array tab
  const renderArrayTab = (arrayName: string) => {
    const items = section.data[arrayName] || [];
    
    return (
      <div className="space-y-4">
        {items.map((item: any, index: number) => {
          // Handle primitive types (strings, numbers, etc.)
          if (typeof item !== 'object' || item === null) {
            return (
              <Card key={index} className="overflow-hidden">
                <div className="bg-secondary/20 p-3 border-b flex justify-between items-center">
                  <h4 className="text-sm font-medium">
                    {`${arrayName.charAt(0).toUpperCase() + arrayName.slice(1)} ${index + 1}`}
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const updatedItems = items.filter((_: any, i: number) => i !== index);
                      onUpdate(arrayName, updatedItems);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      value={item || ''}
                      onChange={(e) => {
                        const updatedItems = [...items];
                        updatedItems[index] = e.target.value;
                        onUpdate(arrayName, updatedItems);
                      }}
                      placeholder={`Enter ${arrayName.slice(0, -1)} value...`}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          }
          
          // Handle object types
          return (
            <Card key={index} className="overflow-hidden">
              <div className="bg-secondary/20 p-3 border-b flex justify-between items-center">
                <h4 className="text-sm font-medium">
                  {item.title || item.name || item.label || `Item ${index + 1}`}
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const updatedItems = items.filter((_: any, i: number) => i !== index);
                    onUpdate(arrayName, updatedItems);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4 space-y-4">
                {Object.entries(item).map(([key, value]) => {
                  // Create a mock property for the item field
                  const itemProperty = {
                    type: typeof value,
                    description: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                    default: value
                  };
                  
                  return (
                    <div key={key}>
                      {renderPropertyEditor(itemProperty, key, [arrayName, index.toString()])}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
        
        {/* Add new item button */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                // Determine what type of item to add based on existing items
                let newItem;
                if (items.length > 0) {
                  const firstItem = items[0];
                  if (typeof firstItem === 'object' && firstItem !== null) {
                    // Create a new object with empty values based on the first item's structure
                    newItem = Object.keys(firstItem).reduce((acc, key) => {
                      acc[key] = typeof firstItem[key] === 'string' ? '' : 
                                typeof firstItem[key] === 'number' ? 0 : 
                                typeof firstItem[key] === 'boolean' ? false : '';
                      return acc;
                    }, {} as any);
                  } else {
                    // Add primitive type
                    newItem = typeof firstItem === 'string' ? '' : 
                             typeof firstItem === 'number' ? 0 : '';
                  }
                } else {
                  // Default to empty string for new arrays
                  newItem = '';
                }
                
                const updatedItems = [...items, newItem];
                onUpdate(arrayName, updatedItems);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {arrayName.slice(0, -1)}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const tabs = getTabs();
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full mb-4">
        {tabs.map(tab => (
          <TabsTrigger key={tab} value={tab} className="flex-1 capitalize">
            {tab === 'content' ? 'General' : tab}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="content" className="space-y-4">
        {renderContentTab()}
      </TabsContent>
      
      {tabs.filter(tab => tab !== 'content').map(tab => (
        <TabsContent key={tab} value={tab} className="space-y-4">
          {renderArrayTab(tab)}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default SectionTabEditor;
