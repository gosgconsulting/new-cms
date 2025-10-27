import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { X, HelpCircle, Plus } from 'lucide-react';
import { SchemaItem } from '../../types/schema';

interface FAQArrayEditorProps {
  item: SchemaItem;
  onChange: (item: SchemaItem) => void;
  onRemove: () => void;
}

const FAQArrayEditor: React.FC<FAQArrayEditorProps> = ({ item, onChange, onRemove }) => {
  // Get the FAQ items from the array
  const faqItems = item.items || [];
  
  // Debug log to see what's coming in
  console.log('FAQ Array Items:', faqItems);
  
  // Add a new FAQ item
  const addFAQItem = () => {
    const newItem = {
      key: `faq${faqItems.length + 1}`,
      type: 'faq',
      question: '',
      answer: ''
    };
    
    const updatedItems = [...faqItems, newItem];
    onChange({ ...item, items: updatedItems });
  };
  
  // Remove a FAQ item
  const removeFAQItem = (index: number) => {
    const updatedItems = faqItems.filter((_, i) => i !== index);
    onChange({ ...item, items: updatedItems });
  };
  
  // Update a FAQ item
  const updateFAQItem = (index: number, updatedFAQ: any) => {
    const updatedItems = [...faqItems];
    updatedItems[index] = updatedFAQ;
    onChange({ ...item, items: updatedItems });
  };

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ Items
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={addFAQItem} title="Add FAQ">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove} title="Remove FAQ Section">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {faqItems.map((faq, index) => (
            <Card key={faq.key} className="border border-gray-200">
              <CardHeader className="pb-2 bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs text-gray-500">FAQ #{index + 1}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => removeFAQItem(index)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <input
                      type="text"
                      value={faq.question || ''}
                      onChange={(e) => updateFAQItem(index, { ...faq, question: e.target.value })}
                      placeholder="Enter question"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                    <textarea
                      value={faq.answer || ''}
                      onChange={(e) => updateFAQItem(index, { ...faq, answer: e.target.value })}
                      placeholder="Enter answer"
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {faqItems.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>No FAQ items yet. Click the + button to add one.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FAQArrayEditor;
