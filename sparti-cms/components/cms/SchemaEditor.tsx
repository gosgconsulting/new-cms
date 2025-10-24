import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Badge } from '../../../src/components/ui/badge';
import { Plus, Trash2, ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ComponentSchema, SchemaItem } from '../../types/schema';
import { ItemEditor, InputEditor, TextareaEditor, ReviewEditor, FeatureEditor } from './ItemEditors';
import ContactFormEditor from './ContactFormEditor';
import { validatePageSchema, getValidationSummary } from '../../utils/schema-validator';

interface SchemaEditorProps {
  components: ComponentSchema[];
  onChange: (components: ComponentSchema[]) => void;
  onSave: () => void;
  showHeader: boolean;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ components, onChange, onSave, showHeader = false }) => {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [expandedComponents, setExpandedComponents] = useState<Set<number>>(new Set([0]));
  const [needsMigrationFlag, setNeedsMigrationFlag] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Update JSON input when components change
  useEffect(() => {
    setJsonInput(JSON.stringify({ components }, null, 2));
  }, [components]);

  // Validate schema whenever it changes
  useEffect(() => {
    const currentSchema = { components };
    const validation = validatePageSchema(currentSchema);
    const summary = getValidationSummary(currentSchema);
    setValidationResult({ ...validation, summary });
  }, [components]);

  const toggleComponent = (index: number) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedComponents(newExpanded);
  };

  const removeComponent = (index: number) => {
    const newComponents = components.filter((_, i) => i !== index);
    onChange(newComponents);
    toast.success('Component removed');
  };

  const updateComponent = (index: number, updatedComponent: ComponentSchema) => {
    const newComponents = [...components];
    newComponents[index] = updatedComponent;
    onChange(newComponents);
  };

  const removeItemFromComponent = (componentIndex: number, itemIndex: number) => {
    const currentComponent = components[componentIndex];
    const currentItems = currentComponent.items || [];
    
    const updatedComponent = {
      ...currentComponent,
      items: currentItems.filter((_, i) => i !== itemIndex)
    };
    updateComponent(componentIndex, updatedComponent);
  };

  const updateItemInComponent = (componentIndex: number, itemIndex: number, updatedItem: SchemaItem) => {
    const currentComponent = components[componentIndex];
    const currentItems = currentComponent.items || [];
    
    const updatedComponent = {
      ...currentComponent,
      items: currentItems.map((item, i) => 
        i === itemIndex ? updatedItem : item
      )
    };
    updateComponent(componentIndex, updatedComponent);
  };

  const migrateToV3Format = () => {
    // Migration functionality removed - schema is already in v3 format
    toast.info('Schema is already in v3 format');
  };

  return (
    <div className="space-y-4">
      {needsMigrationFlag && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Schema Migration Available</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              This page uses an old schema format. Migrate to v3 format for enhanced component editing with key-based structure.
            </p>
            <Button size="sm" onClick={migrateToV3Format} className="mt-2">
              Migrate to V3 Format
            </Button>
          </CardContent>
        </Card>
      )}

      {/* <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Page Components</h3>
        <div className="flex items-center gap-2">
          {validationResult && (
            <div className="flex items-center gap-1 text-sm">
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                {validationResult.summary?.totalComponents || 0} components, {validationResult.summary?.totalItems || 0} items
              </span>
            </div>
          )}
        </div>
      </div> */}

      {components.map((component, index) => {
        // Handle v3 schema format
        const componentName = component.type;
        const componentKey = component.key;
        const items = component.items;
        
        // ContactForm is now handled at the item level in ItemEditor
        
        return (
          <Card key={index} className="border-l-4 border-l-blue-500">
            {showHeader && (
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComponent(index)}
                    >
                      {expandedComponents.has(index) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="text-base">{componentName}</CardTitle>
                      <CardDescription>
                        {componentKey} • {items?.length || 0} items
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{componentName}</Badge>
                    <Badge variant="outline">v3</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeComponent(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            )}

          {expandedComponents.has(index) && (
            <CardContent className="space-y-4 mt-4">
              {/* Component Key */}
              <div className="space-y-2">
                <Label>Component Key</Label>
                <Input
                  value={componentKey}
                  onChange={(e) => updateComponent(index, { ...component, key: e.target.value })}
                  placeholder="Component key"
                />
              </div>
              
              {/* Component Type */}
              <div className="space-y-2">
                <Label>Component Type</Label>
                <Input
                  value={componentName}
                  onChange={(e) => updateComponent(index, { ...component, type: e.target.value })}
                  placeholder="Component type"
                />
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Items ({items?.length || 0})</Label>
                </div>
                
                {items?.map((item, itemIndex) => {
                  // Render v3 item editors
                  switch (item.type) {
                    case 'input':
                      return (
                        <InputEditor
                          key={itemIndex}
                          item={item}
                          onChange={(updatedItem) => updateItemInComponent(index, itemIndex, updatedItem)}
                          onRemove={() => removeItemFromComponent(index, itemIndex)}
                        />
                      );
                    case 'textarea':
                      return (
                        <TextareaEditor
                          key={itemIndex}
                          item={item}
                          onChange={(updatedItem) => updateItemInComponent(index, itemIndex, updatedItem)}
                          onRemove={() => removeItemFromComponent(index, itemIndex)}
                        />
                      );
                    case 'review':
                      return (
                        <ReviewEditor
                          key={itemIndex}
                          item={item}
                          onChange={(updatedItem) => updateItemInComponent(index, itemIndex, updatedItem)}
                          onRemove={() => removeItemFromComponent(index, itemIndex)}
                        />
                      );
                    case 'feature':
                      return (
                        <FeatureEditor
                          key={itemIndex}
                          item={item}
                          onChange={(updatedItem) => updateItemInComponent(index, itemIndex, updatedItem)}
                          onRemove={() => removeItemFromComponent(index, itemIndex)}
                        />
                      );
                    case 'ContactForm' as any:
                      // Handle ContactForm as a special component type
                      // This is actually a nested component, so we need to handle it specially
                      return (
                        <div key={itemIndex} className="border-l-4 border-l-blue-500 p-4 bg-blue-50 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Contact Form Component</span>
                            <Badge variant="secondary">ContactForm</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            This is a nested ContactForm component. Use the main component editor to modify it.
                          </p>
                        </div>
                      );
                    default:
                      // For other types, show a generic editor
                      return (
                        <ItemEditor
                          key={itemIndex}
                          item={item}
                          onChange={(updatedItem) => updateItemInComponent(index, itemIndex, updatedItem)}
                          onRemove={() => removeItemFromComponent(index, itemIndex)}
                        />
                      );
                  }
                })}
              </div>
            </CardContent>
          )}
        </Card>
      );
    })}

      {components.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No components added yet. Click "Add Component" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default SchemaEditor;
