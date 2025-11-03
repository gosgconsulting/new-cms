import React, { useState } from 'react';
import { Card, CardContent } from '../../../../src/components/ui/card';
import { Button } from '../../../../src/components/ui/button';
import { Plus, Sparkles, Info } from 'lucide-react';
import { DynamicFieldEditor, FieldType } from './DynamicFieldEditor';
import { AddFieldDialog } from './AddFieldDialog';
import { getUnknownFields, detectFieldType } from '../../../utils/schemaHelpers';

interface DynamicFieldsSectionProps {
  schema: Record<string, any>;
  knownFields: string[];
  onUpdateSchema: (updates: Record<string, any>) => void;
  title?: string;
}

export const DynamicFieldsSection: React.FC<DynamicFieldsSectionProps> = ({
  schema,
  knownFields,
  onUpdateSchema,
  title = 'Custom Fields',
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const unknownFields = getUnknownFields(schema, knownFields);
  const customFieldNames = Object.keys(unknownFields);

  const handleAddField = (fieldName: string, fieldType: FieldType, defaultValue: any) => {
    onUpdateSchema({ [fieldName]: defaultValue } as any);
  };

  const handleUpdateField = (fieldName: string, newValue: any) => {
    onUpdateSchema({ [fieldName]: newValue } as any);
  };

  const handleRemoveField = (fieldName: string) => {
    // Pass undefined to signal deletion
    onUpdateSchema({ [fieldName]: undefined } as any);
  };

  const handleChangeFieldType = (fieldName: string, newType: FieldType) => {
    // Type change is handled within DynamicFieldEditor
    // This callback can be used for additional logic if needed
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-start justify-between pb-3 border-b border-gray-200">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {customFieldNames.length > 0 && (
              <span className="text-sm text-gray-500 font-normal">
                ({customFieldNames.length} {customFieldNames.length === 1 ? 'field' : 'fields'})
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add custom fields to extend your schema beyond the standard fields
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)} 
          size="sm" 
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Field
        </Button>
      </div>

      {/* Custom Fields List */}
      {customFieldNames.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Sparkles className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                No custom fields yet
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Start by adding your first custom field to extend the schema
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                size="sm"
                variant="outline"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Add Your First Field
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {customFieldNames.map((fieldName) => {
            const fieldValue = unknownFields[fieldName];
            const fieldType = detectFieldType(fieldValue) as FieldType;
            
            return (
              <DynamicFieldEditor
                key={fieldName}
                fieldName={fieldName}
                fieldValue={fieldValue}
                fieldType={fieldType}
                onChange={(newValue) => handleUpdateField(fieldName, newValue)}
                onRemove={() => handleRemoveField(fieldName)}
                onChangeType={(newType) => handleChangeFieldType(fieldName, newType)}
              />
            );
          })}
        </div>
      )}

      {/* Info Card */}
      {customFieldNames.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900 mb-0.5">
                  About Custom Fields
                </p>
                <p className="text-xs text-blue-700">
                  Custom fields are saved with your schema and can be used in your templates. 
                  Use the type selector to change field types, or use the JSON editor for complex structures.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AddFieldDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddField}
        knownFields={knownFields}
        existingFields={customFieldNames}
      />
    </div>
  );
};

