import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { X, HelpCircle } from 'lucide-react';
import { SchemaItem } from '../../types/schema';
import { FAQEditor as ContentFAQEditor } from '../content-editors';

interface FAQItemEditorProps {
  item: SchemaItem;
  onChange: (item: SchemaItem) => void;
  onRemove: () => void;
}

const FAQItemEditor: React.FC<FAQItemEditorProps> = ({ item, onChange, onRemove }) => {
  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ Item
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <input
              type="text"
              value={item.props?.question || ''}
              onChange={(e) => onChange({ 
                ...item, 
                props: { 
                  ...item.props, 
                  question: e.target.value 
                } 
              })}
              placeholder="Enter question"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea
              value={item.props?.answer || ''}
              onChange={(e) => onChange({ 
                ...item, 
                props: { 
                  ...item.props, 
                  answer: e.target.value 
                } 
              })}
              placeholder="Enter answer"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FAQItemEditor;
