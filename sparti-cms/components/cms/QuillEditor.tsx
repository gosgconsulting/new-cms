import React, { useMemo, useCallback, memo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './QuillEditor.css';

interface QuillEditorProps {
  content: string; // plain text in/out
  onChange: (content: string) => void;
  placeholder?: string;
}

// Strip all HTML tags
const stripTags = (str: string) => {
  if (!str) return '';
  return String(str).replace(/<[^>]*>/g, '');
};

const QuillEditor: React.FC<QuillEditorProps> = ({ 
  content, 
  onChange,
  placeholder = 'Enter text...'
}) => {
  // Keep it fast and plain: no toolbar, strip formatting on paste
  const modules = useMemo(() => ({
    toolbar: false,
    clipboard: {
      matchVisual: false,
      matchers: [
        [Node.ELEMENT_NODE, (_node: Node, delta: any) => {
          if (!delta || !Array.isArray(delta.ops)) return delta;
          // Force every op to be plain text (remove attributes/embeds)
          delta.ops = delta.ops.map((op: any) => {
            const insert = typeof op?.insert === 'string' ? stripTags(op.insert) : '\n';
            return { insert };
          });
          return delta;
        }]
      ]
    },
    history: { delay: 300, maxStack: 50, userOnly: true }
  }), []);

  // No formats at all
  const formats: string[] = [];

  // Emit plain text only
  const handleChange = useCallback((_html: string, _delta: any, _source: any, editor: any) => {
    const plain = stripTags(editor?.getText?.() || '').replace(/\n+$/, '');
    onChange(plain);
  }, [onChange]);

  // IMPORTANT: uncontrolled defaultValue must be plain text (strip any legacy HTML)
  const initialValue = stripTags(content || '');

  return (
    <div className="sparti-quill-container">
      <style>{`
        .ql-toolbar { display: none !important; }
        .ql-container.ql-snow { border: 1px solid #e5e7eb; border-radius: 6px; }
        .ql-editor { min-height: 140px; padding: 12px 15px; }
        .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
      `}</style>
      <ReactQuill
        theme="snow"
        defaultValue={initialValue}   // plain text only
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default memo(QuillEditor);