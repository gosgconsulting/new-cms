import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Badge } from '../../../src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../src/components/ui/select';
import { X, Plus, Mail, User, MessageSquare, Type, Trash2, Edit3 } from 'lucide-react';
import { SchemaItem } from '../../types/schema';

interface ContactFormEditorProps {
  item: SchemaItem;
  onChange: (item: SchemaItem) => void;
  onRemove?: () => void;
}

interface FormField {
  key: string;
  type: 'input' | 'textarea';
  content: string | { en: string; fr: string };
  required: boolean;
}

const ContactFormEditor: React.FC<ContactFormEditorProps> = ({ 
  item, 
  onChange, 
  onRemove 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // The item itself is the ContactForm, so we work with its items directly
  const formFields = item.items || [];
  
  const updateItem = (updatedItem: SchemaItem) => {
    onChange(updatedItem);
  };

  const updateContactFormTitle = (title: string) => {
    const updatedItems = formFields.map(subItem => {
      if (subItem.key === 'title') {
        return { ...subItem, content: title };
      }
      return subItem;
    });
    
    updateItem({ ...item, items: updatedItems });
  };

  const addFormField = () => {
    const fieldsItem = formFields.find(item => item.key === 'fields');
    if (!fieldsItem) return;
    
    const newField: SchemaItem = {
      key: `field_${Date.now()}`,
      type: 'input',
      content: 'New Field',
      required: false
    };
    
    const updatedFields = [...(fieldsItem.items || []), newField];
    const updatedFieldsItem = { ...fieldsItem, items: updatedFields };
    
    const updatedItems = formFields.map(item => 
      item.key === 'fields' ? updatedFieldsItem : item
    );
    
    updateItem({ ...item, items: updatedItems });
  };

  const updateFormField = (fieldIndex: number, updatedField: SchemaItem) => {
    const fieldsItem = formFields.find(item => item.key === 'fields');
    if (!fieldsItem) return;
    
    const updatedFields = fieldsItem.items?.map((field, index) => 
      index === fieldIndex ? updatedField : field
    ) || [];
    
    const updatedFieldsItem = { ...fieldsItem, items: updatedFields };
    
    const updatedItems = formFields.map(item => 
      item.key === 'fields' ? updatedFieldsItem : item
    );
    
    updateItem({ ...item, items: updatedItems });
  };

  const removeFormField = (fieldIndex: number) => {
    const fieldsItem = formFields.find(item => item.key === 'fields');
    if (!fieldsItem) return;
    
    const updatedFields = fieldsItem.items?.filter((_, index) => index !== fieldIndex) || [];
    const updatedFieldsItem = { ...fieldsItem, items: updatedFields };
    
    const updatedItems = formFields.map(item => 
      item.key === 'fields' ? updatedFieldsItem : item
    );
    
    updateItem({ ...item, items: updatedItems });
  };

  const updateFieldContent = (fieldIndex: number, content: string) => {
    const field = formFields[fieldIndex];
    if (!field) return;
    
    updateFormField(fieldIndex, { ...field, content });
  };

  const updateFieldType = (fieldIndex: number, type: 'input' | 'textarea') => {
    const field = formFields[fieldIndex];
    if (!field) return;
    
    updateFormField(fieldIndex, { ...field, type });
  };

  const updateFieldRequired = (fieldIndex: number, required: boolean) => {
    const field = formFields[fieldIndex];
    if (!field) return;
    
    updateFormField(fieldIndex, { ...field, required });
  };

  const updateFieldKey = (fieldIndex: number, key: string) => {
    const field = formFields[fieldIndex];
    if (!field) return;
    
    updateFormField(fieldIndex, { ...field, key });
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '▼' : '▶'}
            </Button>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Form
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {formFields.find(item => item.key === 'fields')?.items?.length || 0} field{(formFields.find(item => item.key === 'fields')?.items?.length || 0) !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">ContactForm</Badge>
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Contact Form Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Form Title</Label>
            <Input
              value={formFields.find(item => item.key === 'title')?.content as string || ''}
              onChange={(e) => updateContactFormTitle(e.target.value)}
              placeholder="Enter form title..."
              className="text-sm"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Form Fields</Label>
              <Button size="sm" onClick={addFormField}>
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            </div>

            {formFields.find(item => item.key === 'fields')?.items?.map((field, index) => (
              <Card key={field.key || index} className="bg-muted/40">
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {field.type === 'input' ? (
                        <Type className="h-4 w-4 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                      <span className="text-sm font-medium">{field.key}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFormField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Field Key</Label>
                      <Input
                        value={field.key}
                        onChange={(e) => updateFieldKey(index, e.target.value)}
                        placeholder="e.g., name, email"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(type) => updateFieldType(index, type as 'input' | 'textarea')}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="input">Input Field</SelectItem>
                          <SelectItem value="textarea">Textarea Field</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Field Label</Label>
                    <Input
                      value={typeof field.content === 'string' ? field.content : (field.content as any)?.en || ''}
                      onChange={(e) => updateFieldContent(index, e.target.value)}
                      placeholder="Enter field label..."
                      className="text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${field.key}-${index}`}
                      checked={field.required || false}
                      onChange={(e) => updateFieldRequired(index, e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor={`required-${field.key}-${index}`} className="text-sm">
                      Required field
                    </Label>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(formFields.find(item => item.key === 'fields')?.items?.length || 0) === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No form fields added yet</p>
                <p className="text-xs">Click "Add Field" to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ContactFormEditor;