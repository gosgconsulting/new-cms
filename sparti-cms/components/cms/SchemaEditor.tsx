import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../src/components/ui/select';
import { Badge } from '../../../src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../src/components/ui/tabs';
import { Plus, Trash2, ChevronDown, ChevronRight, Code, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ComponentSchema, PageSchema, SchemaItem, SchemaItemType } from '../../types/schema';
import { ItemEditor, InputEditor, TextareaEditor, ReviewEditor, FeatureEditor } from './ItemEditors';
import { validatePageSchema, getValidationSummary } from '../../utils/schema-validator';
import { needsV3Migration, migrateOldSchemaToV3 } from '../../utils/schema-migration';

interface SchemaEditorProps {
  components: ComponentSchema[];
  onChange: (components: ComponentSchema[]) => void;
  onSave: () => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ components, onChange, onSave }) => {
  const [editingMode, setEditingMode] = useState<'visual' | 'json'>('visual');
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [expandedComponents, setExpandedComponents] = useState<Set<number>>(new Set([0]));
  const [needsMigrationFlag, setNeedsMigrationFlag] = useState(false);

  // Check if schema needs migration on mount
  useEffect(() => {
    const currentSchema = { components };
    setNeedsMigrationFlag(needsV3Migration(currentSchema));
    
    // Update JSON input when components change
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

  const addComponent = () => {
    const newComponent: ComponentSchema = {
      key: `component_${components.length + 1}`,
      type: 'TextBlock',
      items: [
        {
          key: 'text_1',
          type: 'text',
          content: { en: 'New text content', fr: 'Nouveau contenu texte' }
        }
      ]
    };
    onChange([...components, newComponent]);
    toast.success('Component added');
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

  const addItemToComponent = (componentIndex: number) => {
    const currentComponent = components[componentIndex];
    const newItem: SchemaItem = {
      key: `item_${currentComponent.items.length + 1}`,
      type: 'text',
      content: { en: 'New item', fr: 'Nouvel élément' }
    };
    
    const currentItems = currentComponent.items || [];
    const updatedComponent = {
      ...currentComponent,
      items: [...currentItems, newItem]
    };
    updateComponent(componentIndex, updatedComponent);
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

  const handleJsonChange = (newJson: string) => {
    setJsonInput(newJson);
    try {
      const parsed = JSON.parse(newJson);
      if (parsed.components && Array.isArray(parsed.components)) {
        onChange(parsed.components);
      }
    } catch (error) {
      // Invalid JSON, don't update components
    }
  };

  const migrateToV3Format = () => {
    try {
      // Convert v3 components to old format for migration
      const oldSchema = {
        components: components.map(comp => ({
          type: comp.type,
          props: {},
          wrapper: (comp as any).wrapper
        }))
      };
      const newSchema = migrateOldSchemaToV3(oldSchema);
      onChange(newSchema.components);
      setNeedsMigrationFlag(false);
      toast.success('Schema migrated to v3 format');
    } catch (error) {
      toast.error('Migration failed: ' + error.message);
    }
  };

  const renderVisualEditor = () => (
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

      <div className="flex items-center justify-between">
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
          <Button onClick={addComponent} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>
      </div>

             {components.map((component, index) => {
               // Handle v3 schema format
               const componentName = component.type;
               const componentKey = component.key;
               const items = component.items;
               
               return (
                 <Card key={index} className="border-l-4 border-l-blue-500">
                   <CardHeader className="pb-3">
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

                 {expandedComponents.has(index) && (
                   <CardContent className="space-y-4">
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
                         <Button size="sm" onClick={() => addItemToComponent(index)}>
                           <Plus className="h-3 w-3 mr-1" />
                           Add Item
                         </Button>
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

  const renderJsonEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">JSON Editor</h3>
        {validationResult && (
          <div className="flex items-center gap-1 text-sm">
            {validationResult.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
              {validationResult.isValid ? 'Valid' : 'Invalid'}
            </span>
          </div>
        )}
      </div>

      {validationResult && !validationResult.isValid && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Validation Errors</span>
            </div>
            <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
              {validationResult.errors.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Textarea
        value={jsonInput}
        onChange={(e) => handleJsonChange(e.target.value)}
        placeholder="Enter JSON schema..."
        rows={20}
        className="font-mono text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs value={editingMode} onValueChange={(value) => setEditingMode(value as 'visual' | 'json')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual Editor
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            JSON Editor
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual">
          {renderVisualEditor()}
        </TabsContent>
        
        <TabsContent value="json">
          {renderJsonEditor()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchemaEditor;
