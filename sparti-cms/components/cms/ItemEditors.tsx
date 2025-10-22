// Specialized editors for each item type in the new schema structure

import React from 'react';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../src/components/ui/select';
import { Badge } from '../../../src/components/ui/badge';
import { X, Plus, Image as ImageIcon, Link as LinkIcon, Type, MousePointer } from 'lucide-react';
import { SchemaItem, MultiLanguageValue } from '../../types/schema';

interface ItemEditorProps {
  item: SchemaItem;
  onChange: (item: SchemaItem) => void;
  onRemove: () => void;
}

interface MultiLanguageInputProps {
  value: MultiLanguageValue;
  onChange: (value: MultiLanguageValue) => void;
  placeholder?: string;
  multiline?: boolean;
}

// Multi-language input component
const MultiLanguageInput: React.FC<MultiLanguageInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Enter text...",
  multiline = false
}) => {
  const updateLanguage = (lang: 'en' | 'fr', text: string) => {
    onChange({
      ...value,
      [lang]: text
    });
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">English</Label>
          <InputComponent
            value={value.en}
            onChange={(e) => updateLanguage('en', e.target.value)}
            placeholder={placeholder}
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">French</Label>
          <InputComponent
            value={value.fr}
            onChange={(e) => updateLanguage('fr', e.target.value)}
            placeholder={placeholder}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

// Heading item editor
export const HeadingEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const headingItem = item as any; // Type assertion for heading item

  const updateValue = (value: MultiLanguageValue) => {
    onChange({
      ...item,
      value
    });
  };

  const updateLevel = (level: string) => {
    onChange({
      ...item,
      level: parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6
    });
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Heading
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Heading Level</Label>
          <Select value={headingItem.level?.toString() || '1'} onValueChange={updateLevel}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
              <SelectItem value="4">H4</SelectItem>
              <SelectItem value="5">H5</SelectItem>
              <SelectItem value="6">H6</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Heading Text</Label>
          <MultiLanguageInput
            value={item.value}
            onChange={updateValue}
            placeholder="Enter heading text..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Text item editor
export const TextEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateValue = (value: MultiLanguageValue) => {
    onChange({
      ...item,
      value
    });
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Text
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label className="text-xs">Text Content</Label>
          <MultiLanguageInput
            value={item.value}
            onChange={updateValue}
            placeholder="Enter text content..."
            multiline
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Image item editor
export const ImageEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const imageItem = item as any; // Type assertion for image item

  const updateValue = (value: string) => {
    onChange({
      ...item,
      value
    });
  };

  const updateAlt = (alt: MultiLanguageValue) => {
    onChange({
      ...item,
      alt
    });
  };

  const updateCaption = (caption: MultiLanguageValue) => {
    onChange({
      ...item,
      caption
    });
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Image URL</Label>
          <Input
            value={item.value}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="/path/to/image.jpg"
            className="text-sm"
          />
        </div>
        {item.value && (
          <div className="border rounded p-2">
            <img 
              src={item.value} 
              alt="Preview" 
              className="max-w-full h-32 object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div>
          <Label className="text-xs">Alt Text</Label>
          <MultiLanguageInput
            value={imageItem.alt || { en: '', fr: '' }}
            onChange={updateAlt}
            placeholder="Describe the image..."
          />
        </div>
        <div>
          <Label className="text-xs">Caption (Optional)</Label>
          <MultiLanguageInput
            value={imageItem.caption || { en: '', fr: '' }}
            onChange={updateCaption}
            placeholder="Image caption..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Link item editor
export const LinkEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const linkItem = item as any; // Type assertion for link item

  const updateValue = (value: MultiLanguageValue) => {
    onChange({
      ...item,
      value
    });
  };

  const updateLabel = (label: MultiLanguageValue) => {
    onChange({
      ...item,
      label
    });
  };

  const updateTarget = (target: string) => {
    onChange({
      ...item,
      target: target as '_blank' | '_self'
    });
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Link
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Link URLs</Label>
          <MultiLanguageInput
            value={item.value}
            onChange={updateValue}
            placeholder="/en-url or /fr-url"
          />
        </div>
        <div>
          <Label className="text-xs">Link Labels</Label>
          <MultiLanguageInput
            value={linkItem.label || { en: '', fr: '' }}
            onChange={updateLabel}
            placeholder="Click here"
          />
        </div>
        <div>
          <Label className="text-xs">Target</Label>
          <Select value={linkItem.target || '_self'} onValueChange={updateTarget}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_self">Same Window</SelectItem>
              <SelectItem value="_blank">New Window</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

// Button item editor
export const ButtonEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const buttonItem = item as any; // Type assertion for button item

  const updateValue = (value: MultiLanguageValue) => {
    onChange({
      ...item,
      value
    });
  };

  const updateAction = (action: string) => {
    onChange({
      ...item,
      action
    });
  };

  const updateStyle = (style: string) => {
    onChange({
      ...item,
      style: style as 'primary' | 'secondary' | 'outline'
    });
  };

  const updateTarget = (target: string) => {
    onChange({
      ...item,
      target: target as '_blank' | '_self'
    });
  };

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Button
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Button Text</Label>
          <MultiLanguageInput
            value={item.value}
            onChange={updateValue}
            placeholder="Button text..."
          />
        </div>
        <div>
          <Label className="text-xs">Action URL</Label>
          <Input
            value={buttonItem.action || ''}
            onChange={(e) => updateAction(e.target.value)}
            placeholder="/action-url"
            className="text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Style</Label>
            <Select value={buttonItem.style || 'primary'} onValueChange={updateStyle}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Target</Label>
            <Select value={buttonItem.target || '_self'} onValueChange={updateTarget}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">Same Window</SelectItem>
                <SelectItem value="_blank">New Window</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Array item editor
export const ArrayEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const arrayItem = item as any; // Type assertion for array item

  const updateValue = (value: any[]) => {
    onChange({
      ...item,
      value
    });
  };

  const updateItemType = (itemType: string) => {
    onChange({
      ...item,
      itemType
    });
  };

  const addItem = () => {
    const newValue = [...(arrayItem.value || []), {}];
    updateValue(newValue);
  };

  const removeItem = (index: number) => {
    const newValue = arrayItem.value.filter((_: any, i: number) => i !== index);
    updateValue(newValue);
  };

  const updateItem = (index: number, updatedItem: any) => {
    const newValue = [...arrayItem.value];
    newValue[index] = updatedItem;
    updateValue(newValue);
  };

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge className="h-4 w-4" />
            Array ({arrayItem.value?.length || 0} items)
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Item Type</Label>
          <Input
            value={arrayItem.itemType || ''}
            onChange={(e) => updateItemType(e.target.value)}
            placeholder="e.g., showcase-item, review"
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Items</Label>
            <Button size="sm" onClick={addItem}>
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>
          </div>
          {arrayItem.value?.map((arrayItem: any, index: number) => (
            <div key={index} className="border rounded p-2 flex items-center gap-2">
              <Input
                value={JSON.stringify(arrayItem)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateItem(index, parsed);
                  } catch {
                    // Invalid JSON, keep the string value
                  }
                }}
                placeholder="JSON object"
                className="text-sm flex-1"
              />
              <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main item editor that routes to the appropriate editor
export const ItemEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  switch (item.type) {
    case 'heading':
      return <HeadingEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'text':
      return <TextEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'image':
      return <ImageEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'link':
      return <LinkEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'button':
      return <ButtonEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'array':
      return <ArrayEditor item={item} onChange={onChange} onRemove={onRemove} />;
    default:
      return (
        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Unknown Item Type: {item.type}</CardTitle>
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This item type is not supported yet.
            </p>
          </CardContent>
        </Card>
      );
  }
};
