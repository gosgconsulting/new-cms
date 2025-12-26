import React, { useRef, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { X, HelpCircle } from 'lucide-react';
import { SchemaItem } from '../../types/schema';
import { FAQEditor as ContentFAQEditor } from '../content-editors';
import QuillEditor from './QuillEditor';

interface FAQItemEditorProps {
  item: SchemaItem;
  onChange: (item: SchemaItem) => void;
  onRemove: () => void;
}

const FAQItemEditor: React.FC<FAQItemEditorProps> = memo(({ item, onChange, onRemove }) => {
  const questionInputRef = useRef<HTMLInputElement>(null);
  const localQuestionRef = useRef(item.props?.question || '');
  const isQuestionFocusedRef = useRef(false);
  
  // Initialize refs from item prop - but only if input is not focused
  useEffect(() => {
    if (!isQuestionFocusedRef.current) {
      const newQuestion = item.props?.question || '';
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
  }, [item.props?.question]);
  
  const updateQuestion = (value: string) => {
    localQuestionRef.current = value;
  };
  
  // Stable callback for QuillEditor onChange
  const handleAnswerChange = useCallback((value: string) => {
    onChange({ 
      ...item, 
      props: { 
        ...item.props, 
        answer: value 
      } 
    });
  }, [item, onChange]);
  
  const initialQuestion = item.props?.question || '';
  
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
              ref={questionInputRef}
              type="text"
              key={`question-${item.key}`}
              defaultValue={initialQuestion}
              onChange={(e) => updateQuestion(e.target.value)}
              onFocus={() => { isQuestionFocusedRef.current = true; }}
              onBlur={(e) => {
                isQuestionFocusedRef.current = false;
                const currentValue = e.target.value;
                localQuestionRef.current = currentValue;
                onChange({ 
                  ...item, 
                  props: { 
                    ...item.props, 
                    question: currentValue 
                  } 
                });
              }}
              placeholder="Enter question"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <QuillEditor
              key={`quill-answer-${item.key}`} // Stable key to prevent remounting
              content={item.props?.answer || ''}
              onChange={handleAnswerChange}
              placeholder="Enter answer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if item structure changed (key), NOT content
  // Content changes are handled by local state in inputs and QuillEditor
  // This prevents re-renders when typing, which would cause ReactQuill to remount and lose focus
  // Return true if props are equal (no re-render needed)
  // Return false if props are different (re-render needed)
  return prevProps.item.key === nextProps.item.key;
});

FAQItemEditor.displayName = 'FAQItemEditor';

export default FAQItemEditor;