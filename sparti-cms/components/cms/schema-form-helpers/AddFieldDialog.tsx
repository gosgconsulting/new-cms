import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../src/components/ui/dialog';
import { Button } from '../../../../src/components/ui/button';
import { Input } from '../../../../src/components/ui/input';
import { Label } from '../../../../src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../src/components/ui/select';
import { validateFieldName, getDefaultValueForType } from '../../../utils/schemaHelpers';

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (fieldName: string, fieldType: FieldType, defaultValue: any) => void;
  knownFields: string[];
  existingFields: string[];
}

export const AddFieldDialog: React.FC<AddFieldDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  knownFields,
  existingFields,
}) => {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('string');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFieldName('');
      setFieldType('string');
      setValidationError(null);
    }
  }, [open]);

  const handleFieldNameChange = (value: string) => {
    setFieldName(value);
    
    // Validate on change
    const validation = validateFieldName(value, knownFields, existingFields);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid field name');
    } else {
      setValidationError(null);
    }
  };

  const handleAdd = () => {
    const validation = validateFieldName(fieldName, knownFields, existingFields);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid field name');
      return;
    }

    const defaultValue = getDefaultValueForType(fieldType);
    onAdd(fieldName.trim(), fieldType, defaultValue);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
          <DialogDescription>
            Add a new custom field to your schema. Choose a name and type for the field.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="field-name">Field Name</Label>
            <Input
              id="field-name"
              value={fieldName}
              onChange={(e) => handleFieldNameChange(e.target.value)}
              placeholder="e.g., customText, socialLinks, metaData"
              className="mt-1"
            />
            {validationError && (
              <p className="text-sm text-destructive mt-1">{validationError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Must be a valid JavaScript identifier (letters, numbers, _, $)
            </p>
          </div>

          <div>
            <Label htmlFor="field-type">Field Type</Label>
            <Select value={fieldType} onValueChange={(value) => setFieldType(value as FieldType)}>
              <SelectTrigger id="field-type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String (text)</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean (true/false)</SelectItem>
                <SelectItem value="array">Array (list)</SelectItem>
                <SelectItem value="object">Object (key-value pairs)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Initial value: {JSON.stringify(getDefaultValueForType(fieldType))}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!fieldName.trim() || !!validationError}
          >
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

