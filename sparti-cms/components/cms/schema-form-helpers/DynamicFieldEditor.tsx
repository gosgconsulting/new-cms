import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Input } from '../../../../src/components/ui/input';
import { Label } from '../../../../src/components/ui/label';
import { Textarea } from '../../../../src/components/ui/textarea';
import { Button } from '../../../../src/components/ui/button';
import { Badge } from '../../../../src/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../src/components/ui/select';
import { ToggleField } from './ToggleField';
import { X, Plus, Code, ChevronDown, ChevronUp, Key, Type } from 'lucide-react';
import { detectFieldType, getDefaultValueForType } from '../../../utils/schemaHelpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../src/components/ui/dialog';

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

interface DynamicFieldEditorProps {
  fieldName: string;
  fieldValue: any;
  fieldType?: FieldType;
  onChange: (value: any) => void;
  onRemove: () => void;
  onChangeType?: (newType: FieldType) => void;
}

// Object Key-Value Editor Component
const ObjectKeyValueEditor: React.FC<{
  obj: Record<string, any>;
  onChange: (obj: Record<string, any>) => void;
  onUseJsonEditor: () => void;
}> = ({ obj, onChange, onUseJsonEditor }) => {
  const [keys, setKeys] = useState<string[]>(Object.keys(obj || {}));

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (newKey === oldKey) return;
    const newObj = { ...obj };
    const value = newObj[oldKey];
    delete newObj[oldKey];
    newObj[newKey] = value;
    onChange(newObj);
    setKeys(Object.keys(newObj));
  };

  const handleValueChange = (key: string, value: any) => {
    onChange({ ...obj, [key]: value });
  };

  const handleAddPair = () => {
    const newKey = `key_${Date.now()}`;
    onChange({ ...obj, [newKey]: '' });
    setKeys([...keys, newKey]);
  };

  const handleRemovePair = (key: string) => {
    const newObj = { ...obj };
    delete newObj[key];
    onChange(newObj);
    setKeys(Object.keys(newObj));
  };

  const currentKeys = Object.keys(obj || {});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Object Properties</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddPair}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Property
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onUseJsonEditor}
            className="h-7 text-xs"
          >
            <Code className="h-3 w-3 mr-1" />
            JSON Editor
          </Button>
        </div>
      </div>
      
      <div className="space-y-2 border border-gray-200 rounded-md p-3 bg-gray-50">
        {currentKeys.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            No properties. Click "Add Property" to add one.
          </p>
        ) : (
          currentKeys.map((key) => {
            const value = obj[key];
            const valueType = detectFieldType(value);
            
            return (
              <div key={key} className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Key</Label>
                    <Input
                      value={key}
                      onChange={(e) => handleKeyChange(key, e.target.value)}
                      className="text-xs h-7"
                      placeholder="Property name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Value</Label>
                    {valueType === 'string' && (
                      <Input
                        value={value || ''}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        className="text-xs h-7"
                        placeholder="Value"
                      />
                    )}
                    {valueType === 'number' && (
                      <Input
                        type="number"
                        value={value ?? 0}
                        onChange={(e) => handleValueChange(key, Number(e.target.value))}
                        className="text-xs h-7"
                      />
                    )}
                    {valueType === 'boolean' && (
                      <div className="flex items-center h-7">
                        <ToggleField
                          id={`obj-${key}`}
                          label=""
                          checked={value ?? false}
                          onChange={(checked) => handleValueChange(key, checked)}
                        />
                      </div>
                    )}
                    {(valueType === 'array' || valueType === 'object') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onUseJsonEditor}
                        className="h-7 text-xs w-full"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Edit {valueType === 'array' ? 'Array' : 'Object'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const ArrayItemEditor: React.FC<{
  item: any;
  index: number;
  onChange: (value: any) => void;
  onRemove: () => void;
  onUseJsonEditor?: () => void;
}> = ({ item, index, onChange, onRemove, onUseJsonEditor }) => {
  const itemType = detectFieldType(item);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleJsonEdit = () => {
    setJsonString(JSON.stringify(item, null, 2));
    setShowJsonEditor(true);
  };

  const renderItemEditor = () => {
    switch (itemType) {
      case 'string':
        return (
          <Input
            value={item || ''}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
            placeholder="Enter text..."
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={item || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="text-sm"
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center">
            <ToggleField
              id={`array-item-${index}`}
              label="Value"
              checked={item || false}
              onChange={onChange}
            />
          </div>
        );
      case 'object':
        const obj = item || {};
        const isSimpleObject = Object.keys(obj).length <= 5 && 
          Object.values(obj).every(v => 
            typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
          );
        
        if (isSimpleObject && expanded) {
          return (
            <div className="space-y-2">
              <ObjectKeyValueEditor
                obj={obj}
                onChange={onChange}
                onUseJsonEditor={handleJsonEdit}
              />
            </div>
          );
        }
        
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="flex-1"
              >
                {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {expanded ? 'Collapse' : 'Expand'} Object ({Object.keys(obj).length} properties)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleJsonEdit}
              >
                <Code className="h-3 w-3 mr-1" />
                JSON
              </Button>
            </div>
            {!expanded && (
              <p className="text-xs text-gray-500">
                {JSON.stringify(obj).substring(0, 60)}
                {JSON.stringify(obj).length > 60 ? '...' : ''}
              </p>
            )}
          </div>
        );
      default:
        return (
          <Input
            value={String(item || '')}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
          />
        );
    }
  };

  return (
    <>
      <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors">
        <div className="flex-1 min-w-0">
          {renderItemEditor()}
        </div>
      </div>

      <Dialog open={showJsonEditor} onOpenChange={setShowJsonEditor}>
        <DialogContent className="max-w-3xl h-[75vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Array Item #{index + 1} (JSON Editor)</DialogTitle>
            <DialogDescription>
              Edit this array item as JSON. Changes will be applied when you click Done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4">
            <Textarea
              value={jsonString}
              onChange={(e) => {
                const newJsonString = e.target.value;
                setJsonString(newJsonString);
                try {
                  const parsed = JSON.parse(newJsonString);
                  onChange(parsed);
                  setJsonError(null);
                } catch (error) {
                  setJsonError('Invalid JSON format.');
                }
              }}
              className="w-full h-full font-mono text-sm resize-none"
              placeholder="Enter JSON..."
            />
            {jsonError && (
              <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                <X className="h-3 w-3" />
                {jsonError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJsonEditor(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowJsonEditor(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const DynamicFieldEditor: React.FC<DynamicFieldEditorProps> = ({
  fieldName,
  fieldValue,
  fieldType: initialFieldType,
  onChange,
  onRemove,
  onChangeType,
}) => {
  const detectedType = initialFieldType || detectFieldType(fieldValue);
  const [currentType, setCurrentType] = useState<FieldType>(detectedType);
  const [showTypeChangeWarning, setShowTypeChangeWarning] = useState(false);
  const [pendingType, setPendingType] = useState<FieldType | null>(null);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<FieldType>('string');

  const handleTypeChange = (newType: FieldType) => {
    if (newType === currentType) return;
    setPendingType(newType);
    setShowTypeChangeWarning(true);
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      const newDefaultValue = getDefaultValueForType(pendingType);
      setCurrentType(pendingType);
      onChange(newDefaultValue);
      onChangeType?.(pendingType);
    }
    setShowTypeChangeWarning(false);
    setPendingType(null);
  };

  const cancelTypeChange = () => {
    setShowTypeChangeWarning(false);
    setPendingType(null);
  };

  const detectArrayItemType = (array: any[]): FieldType | null => {
    if (array.length === 0) return null;
    const firstType = detectFieldType(array[0]);
    // Check if all items have the same type
    const allSameType = array.every(item => detectFieldType(item) === firstType);
    return allSameType ? firstType : null;
  };

  const renderFieldEditor = () => {
    switch (currentType) {
      case 'string':
        const isLongString = typeof fieldValue === 'string' && fieldValue.length > 100;
        return (
          <div className="space-y-2">
            {isLongString ? (
              <Textarea
                value={fieldValue || ''}
                onChange={(e) => onChange(e.target.value)}
                className="text-sm font-mono"
                rows={6}
                placeholder="Enter text..."
              />
            ) : (
              <Input
                value={fieldValue || ''}
                onChange={(e) => onChange(e.target.value)}
                className="text-sm"
                placeholder="Enter text..."
              />
            )}
            {isLongString && (
              <p className="text-xs text-gray-500">
                {fieldValue?.length || 0} characters
              </p>
            )}
          </div>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue ?? 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="text-sm"
            placeholder="Enter number..."
          />
        );
      
      case 'boolean':
        return (
          <div className="py-2">
            <ToggleField
              id={`field-${fieldName}`}
              label={fieldName}
              checked={fieldValue ?? false}
              onChange={onChange}
              description={fieldValue ? 'Enabled' : 'Disabled'}
            />
          </div>
        );
      
      case 'array':
        const arrayValue = Array.isArray(fieldValue) ? fieldValue : [];
        const detectedItemType = detectArrayItemType(arrayValue);
        
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-end pb-2 border-b border-gray-200">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddItemDialog(true)}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {arrayValue.map((item: any, index: number) => (
                <ArrayItemEditor
                  key={`${index}-${JSON.stringify(item).substring(0, 20)}`}
                  item={item}
                  index={index}
                  onChange={(newValue) => {
                    const newArray = [...arrayValue];
                    newArray[index] = newValue;
                    onChange(newArray);
                  }}
                  onRemove={() => {
                    const newArray = arrayValue.filter((_: any, i: number) => i !== index);
                    onChange(newArray);
                  }}
                />
              ))}
              {arrayValue.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm mb-1">No items in array</p>
                  <p className="text-xs">Click "Add Item" to add your first item</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'object':
        const obj = fieldValue || {};
        const isSimpleObject = Object.keys(obj).length <= 8 && 
          Object.values(obj).every(v => 
            typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ||
            (Array.isArray(v) && v.length === 0)
          );
        
        if (isSimpleObject) {
          return (
            <div className="space-y-3">
              <ObjectKeyValueEditor
                obj={obj}
                onChange={onChange}
                onUseJsonEditor={() => {
                  setJsonString(JSON.stringify(obj, null, 2));
                  setShowJsonEditor(true);
                }}
              />
            </div>
          );
        }
        
        return (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setJsonString(JSON.stringify(obj, null, 2));
                setShowJsonEditor(true);
              }}
              className="w-full"
            >
              <Code className="h-4 w-4 mr-2" />
              Edit Object (JSON Editor)
            </Button>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-xs text-gray-600 mb-1 font-medium">Preview:</p>
              <p className="text-xs text-gray-500 font-mono break-all">
                {JSON.stringify(obj).substring(0, 150)}
                {JSON.stringify(obj).length > 150 ? '...' : ''}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {Object.keys(obj).length} properties
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <Input
            value={String(fieldValue || '')}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
          />
        );
    }
  };

  const getTypeColor = (type: FieldType) => {
    switch (type) {
      case 'string': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'number': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'boolean': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'array': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'object': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'string': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '✓';
      case 'array': return '📋';
      case 'object': return '🗂️';
      default: return '📄';
    }
  };

  return (
    <>
      <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{getTypeIcon(currentType)}</span>
                <CardTitle className="text-sm font-semibold text-gray-900">{fieldName}</CardTitle>
              </div>
              <Badge className={`text-xs font-medium border ${getTypeColor(currentType)}`}>
                {currentType}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {onChangeType && (
                <Select value={currentType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">📝 String</SelectItem>
                    <SelectItem value="number">🔢 Number</SelectItem>
                    <SelectItem value="boolean">✓ Boolean</SelectItem>
                    <SelectItem value="array">📋 Array</SelectItem>
                    <SelectItem value="object">🗂️ Object</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          {renderFieldEditor()}
        </CardContent>
      </Card>

      {/* Add Array Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Array Item</DialogTitle>
            <DialogDescription>
              Choose the type for the new array item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Item Type</Label>
              <Select value={newItemType} onValueChange={(v) => setNewItemType(v as FieldType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">📝 String</SelectItem>
                  <SelectItem value="number">🔢 Number</SelectItem>
                  <SelectItem value="boolean">✓ Boolean</SelectItem>
                  <SelectItem value="object">🗂️ Object</SelectItem>
                  <SelectItem value="array">📋 Array</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const defaultValue = getDefaultValueForType(newItemType);
                const arrayValue = Array.isArray(fieldValue) ? fieldValue : [];
                onChange([...arrayValue, defaultValue]);
                setShowAddItemDialog(false);
              }}
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* JSON Editor Dialog */}
      <Dialog open={showJsonEditor} onOpenChange={setShowJsonEditor}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Object: {fieldName}</DialogTitle>
            <DialogDescription>
              Edit the object as JSON. Be careful with this editor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4">
            <Textarea
              value={jsonString}
              onChange={(e) => {
                const newJsonString = e.target.value;
                setJsonString(newJsonString);
                try {
                  const parsed = JSON.parse(newJsonString);
                  onChange(parsed);
                  setJsonError(null);
                } catch (error) {
                  setJsonError('Invalid JSON format.');
                }
              }}
              className="w-full h-full font-mono text-sm resize-none"
              placeholder="Enter object as JSON..."
            />
            {jsonError && (
              <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                <X className="h-3 w-3" />
                {jsonError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJsonEditor(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowJsonEditor(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Type Change Warning Dialog */}
      <Dialog open={showTypeChangeWarning} onOpenChange={setShowTypeChangeWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Field Type?</DialogTitle>
            <DialogDescription>
              Changing the field type from "{currentType}" to "{pendingType}" will reset the current value.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelTypeChange}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmTypeChange}>
              Change Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};