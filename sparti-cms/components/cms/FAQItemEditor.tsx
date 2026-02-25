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

// Option B: array item fields are top-level; read/write top-level with props fallback
const getQuestion = (item: SchemaItem) => (item as any).question ?? (item as any).props?.question ?? '';
const getAnswer = (item: SchemaItem) => (item as any).answer ?? (item as any).props?.answer ?? '';

const FAQItemEditor: React.FC<FAQItemEditorProps> = memo(({ item, onChange, onRemove }) => {
  const questionInputRef = useRef<HTMLInputElement>(null);
  const initialQuestion = getQuestion(item);
  const localQuestionRef = useRef(initialQuestion);
  const isQuestionFocusedRef = useRef(false);
  
  // Initialize refs from item prop - but only if input is not focused
  useEffect(() => {
    if (!isQuestionFocusedRef.current) {
      const newQuestion = getQuestion(item);
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
  }, [(item as any).question, (item as any).props?.question]);
  
  const updateQuestion = (value: string) => {
    localQuestionRef.current = value;
  };
  
  // Write to top-level so saved layout matches section contract (Option B)
  const handleAnswerChange = useCallback((value: string) => {
    onChange({ ...item, answer: value });
  }, [item, onChange]);
  
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
                onChange({ ...item, question: currentValue });
              }}
              placeholder="Enter question"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <QuillEditor
              key={`quill-answer-${item.key}`} // Stable key to prevent remounting
              content={getAnswer(item)}
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