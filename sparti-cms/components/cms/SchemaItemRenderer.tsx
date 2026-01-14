import React from 'react';
import { Input } from '../../../src/components/ui/input';
import { Textarea } from '../../../src/components/ui/textarea';
import { Label } from '../../../src/components/ui/label';
import { Button } from '../../../src/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { SchemaItem } from '../../types/schema';

interface SchemaItemEditorProps {
  item: SchemaItem;
  onChange: (updatedItem: SchemaItem) => void;
  path?: (string | number)[];
}

export const SchemaItemEditor: React.FC<SchemaItemEditorProps> = ({ item, onChange }) => {
  const updateField = (field: keyof SchemaItem, value: any) => {
    onChange({ ...item, [field]: value });
  };

  const updateArrayItem = (index: number, key: keyof SchemaItem, value: any) => {
    const nextItems = Array.isArray(item.items) ? [...(item.items as SchemaItem[])] : [];
    const target = nextItems[index] || { key: `item-${index}`, type: 'text' };
    nextItems[index] = { ...target, [key]: value };
    onChange({ ...item, items: nextItems });
  };

  const addArrayItem = () => {
    const nextItems = Array.isArray(item.items) ? [...(item.items as SchemaItem[])] : [];
    nextItems.push({ key: `item-${nextItems.length}`, type: 'text', content: '' });
    onChange({ ...item, items: nextItems });
  };

  const removeArrayItem = (index: number) => {
    const nextItems = Array.isArray(item.items) ? [...(item.items as SchemaItem[])] : [];
    nextItems.splice(index, 1);
    onChange({ ...item, items: nextItems });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Type</Label>
          <Input value={item.type} disabled />
        </div>
        <div>
          <Label>Key</Label>
          <Input value={item.key} onChange={(e) => updateField('key', e.target.value)} />
        </div>
      </div>

      {/* Basic fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Content</Label>
          {(item.content && item.content.length > 120) ? (
            <Textarea value={item.content || ''} onChange={(e) => updateField('content', e.target.value)} />
          ) : (
            <Input value={item.content || ''} onChange={(e) => updateField('content', e.target.value)} />
          )}
        </div>
        <div>
          <Label>Image Src</Label>
          <Input value={item.src || ''} onChange={(e) => updateField('src', e.target.value)} placeholder="Image URL" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Alt</Label>
          <Input value={item.alt || ''} onChange={(e) => updateField('alt', e.target.value)} />
        </div>
        <div>
          <Label>Link</Label>
          <Input value={item.link || ''} onChange={(e) => updateField('link', e.target.value)} />
        </div>
      </div>

      {/* Nested items */}
      {Array.isArray(item.items) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Nested Items</Label>
            <Button variant="outline" size="sm" onClick={addArrayItem}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {(item.items as SchemaItem[]).map((child, idx) => (
              <div key={child.key || idx} className="p-3 rounded border bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <Label>Key</Label>
                    <Input
                      value={child.key}
                      onChange={(e) => updateArrayItem(idx, 'key', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Input value={child.type} onChange={(e) => updateArrayItem(idx, 'type', e.target.value)} />
                  </div>
                  <div className="flex items-end justify-end">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeArrayItem(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <Label>Content</Label>
                  <Input
                    value={child.content || ''}
                    onChange={(e) => updateArrayItem(idx, 'content', e.target.value)}
                    placeholder="Text or URL"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaItemEditor;