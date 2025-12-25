import React, { useMemo, useCallback, memo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './QuillEditor.css';

interface QuillEditorProps {
  content: string; // plain text in, plain text out
  onChange: (content: string) => void;
  placeholder?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ 
  content, 
  onChange,
  placeholder = 'Enter text...'
}) => {
  // Strip formatting on paste and disable toolbar to keep it fast and simple
  const modules = useMemo(() => ({
    toolbar: false,
    clipboard: {
      matchVisual: false,
      // Strip attributes/formatting from pasted content
      matchers: [
        [Node.ELEMENT_NODE, (_node: Node, delta: any) => {
          if (!delta || !Array.isArray(delta.ops)) return delta;
          delta.ops = delta.ops.map((op: any) => {
            const insert = typeof op?.insert === 'string' ? op.insert : ' ';
            return { insert }; // remove attributes and embeds
          });
          return delta;
        }]
      ]
    },
    history: { delay: 300, maxStack: 50, userOnly: true }
  }), []);

  // Disable all formats to avoid heavy DOM churn
  const formats: string[] = [];

  // Emit plain text only (trim trailing newlines that Quill appends)
  const handleChange = useCallback((_html: string, _delta: any, _source: any, editor: any) => {
    const plain = (editor?.getText?.() || '').replace(/\n+$/, '');
    onChange(plain);
  }, [onChange]);

  // NOTE:
  // Use defaultValue (uncontrolled) instead of value to avoid controlled re-render loops,
  // which can cause lag when mounting multiple editors inside accordions.
  return (
    <div className="sparti-quill-container">
      <ReactQuill
        theme="snow"
        defaultValue={content || ''}  // plain text initial value
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default memo(QuillEditor);