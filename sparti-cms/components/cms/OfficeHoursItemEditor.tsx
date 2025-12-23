import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { X, Clock } from 'lucide-react';
import { SchemaItem } from '../../types/schema';
import { OfficeHoursEditor as ContentOfficeHoursEditor } from '../content-editors';

interface OfficeHoursItemEditorProps {
  item: SchemaItem;
  onChange: (item: SchemaItem) => void;
  onRemove: () => void;
}

const OfficeHoursItemEditor: React.FC<OfficeHoursItemEditorProps> = ({ item, onChange, onRemove }) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Office Hours
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ContentOfficeHoursEditor
          items={(item.items as any) || []}
          onChange={(officeHoursItems) => onChange({ ...item, items: officeHoursItems as any })}
        />
      </CardContent>
    </Card>
  );
};

export default OfficeHoursItemEditor;