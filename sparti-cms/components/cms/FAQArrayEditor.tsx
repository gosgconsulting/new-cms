import React, { useRef, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { X, HelpCircle, Plus } from 'lucide-react';
import { SchemaItem } from '../../types/schema';

interface FAQArrayEditorProps {
  item: SchemaItem;
  onChange: (item: SchemaItem) => void;
  onRemove: () => void;
}

interface FAQItemEditorProps {
  faq: SchemaItem;
  index: number;
  onUpdate: (index: number, updatedFAQ: SchemaItem) => void;
  onRemove: (index: number) => void;
}

// Memoized FAQ item component to prevent unnecessary re-renders
const FAQItemEditor: React.FC<FAQItemEditorProps> = memo(({ faq, index, onUpdate, onRemove }) => {
  const questionInputRef = useRef<HTMLInputElement>(null);
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const localQuestionRef = useRef((faq.props as any)?.question || '');
  const localAnswerRef = useRef((faq.props as any)?.answer || '');
  const isQuestionFocusedRef = useRef(false);
  const isAnswerFocusedRef = useRef(false);
  
  // Initialize refs from faq prop - but only if input is not focused
  useEffect(() => {
    if (!isQuestionFocusedRef.current) {
      const newQuestion = (faq.props as any)?.question || '';
      if (newQuestion !== localQuestionRef.current) {
        localQuestionRef.current = newQuestion;
        if (questionInputRef.current) {
          const wasFocused = document.activeElement === questionInputRef.current;
          if (!wasFocused) {
            questionInputRef.current.value = newQuestion;
          }
        }
      }
    }
    if (!isAnswerFocusedRef.current) {
      const newAnswer = (faq.props as any)?.answer || '';
      if (newAnswer !== localAnswerRef.current) {
        localAnswerRef.current = newAnswer;
        if (answerTextareaRef.current) {
          const wasFocused = document.activeElement === answerTextareaRef.current;
          if (!wasFocused) {
            answerTextareaRef.current.value = newAnswer;
          }
        }
      }
    }
  }, [(faq.props as any)?.question, (faq.props as any)?.answer]);
  
  const updateQuestion = (value: string) => {
    localQuestionRef.current = value;
  };
  
  const updateAnswer = (value: string) => {
    localAnswerRef.current = value;
  };
  
  const initialQuestion = (faq.props as any)?.question || '';
  const initialAnswer = (faq.props as any)?.answer || '';
  
  return (
    <Card 
      className="border border-gray-200"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <CardHeader className="pb-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs text-gray-500">FAQ #{index + 1}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <input
              ref={questionInputRef}
              type="text"
              key={`question-${faq.key}-${index}`}
              defaultValue={initialQuestion}
              onChange={(e) => updateQuestion(e.target.value)}
              onFocus={() => { isQuestionFocusedRef.current = true; }}
              onBlur={(e) => {
                isQuestionFocusedRef.current = false;
                const currentValue = e.target.value;
                localQuestionRef.current = currentValue;
                const updatedFAQ: SchemaItem = {
                  ...faq,
                  props: { ...(faq.props || {}), question: currentValue }
                };
                onUpdate(index, updatedFAQ);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Enter question"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea
              ref={answerTextareaRef}
              key={`answer-${faq.key}-${index}`}
              defaultValue={initialAnswer}
              onChange={(e) => updateAnswer(e.target.value)}
              onFocus={() => { isAnswerFocusedRef.current = true; }}
              onBlur={(e) => {
                isAnswerFocusedRef.current = false;
                const currentValue = e.target.value;
                localAnswerRef.current = currentValue;
                const updatedFAQ: SchemaItem = {
                  ...faq,
                  props: { ...(faq.props || {}), answer: currentValue }
                };
                onUpdate(index, updatedFAQ);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Enter answer"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if the FAQ item structure changed (key, index)
  // Don't compare content - that's handled by local refs and useEffect inside
  // This prevents re-renders when content changes during typing
  return (
    prevProps.faq.key === nextProps.faq.key &&
    prevProps.index === nextProps.index
  );
});

FAQItemEditor.displayName = 'FAQItemEditor';

const FAQArrayEditor: React.FC<FAQArrayEditorProps> = ({ item, onChange, onRemove }) => {
  // Get the FAQ items from the array
  const faqItems = item.items || [];
  
  // Debug log to see what's coming in
  console.log('FAQ Array Items:', faqItems);
  
  // Add a new FAQ item
  const addFAQItem = () => {
    const newItem: SchemaItem = {
      key: `faq${faqItems.length + 1}`,
      type: 'faq',
      props: { question: '', answer: '' }
    };
    
    const updatedItems = [...faqItems, newItem];
    onChange({ ...item, items: updatedItems });
  };
  
  // Update a FAQ item
  const updateFAQItem = useCallback((index: number, updatedFAQ: SchemaItem) => {
    const updatedItems = [...faqItems];
    updatedItems[index] = updatedFAQ;
    onChange({ ...item, items: updatedItems });
  }, [faqItems, item, onChange]);
  
  // Remove a FAQ item
  const handleRemoveFAQItem = useCallback((index: number) => {
    const updatedItems = faqItems.filter((_, i) => i !== index);
    onChange({ ...item, items: updatedItems });
  }, [faqItems, item, onChange]);

  return (
    <Card 
      className="border-l-4 border-l-amber-500"
      onClick={(e) => {
        // Stop propagation to prevent parent onClick from firing
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        // Also stop mousedown to prevent any interaction issues
        e.stopPropagation();
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ Items
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                addFAQItem();
              }} 
              title="Add FAQ"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }} 
              title="Remove FAQ Section"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {faqItems.map((faq, index) => (
            <FAQItemEditor
              key={faq.key || `faq-${index}`}
              faq={faq}
              index={index}
              onUpdate={updateFAQItem}
              onRemove={handleRemoveFAQItem}
            />
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