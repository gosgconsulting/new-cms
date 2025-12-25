import React, { useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
  content: string; // Expect and emit plain text
  onChange: (content: string) => void;
  placeholder?: string;
}

const escapeHtml = (str: string) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')   // prevent tags like <p>
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const QuillEditor: React.FC<QuillEditorProps> = ({ 
  content, 
  onChange,
  placeholder = 'Enter text...'
}) => {
  // No toolbar; no formatting allowed
  const modules = useMemo(() => ({
    toolbar: false,
    clipboard: {
      matchVisual: false
    }
  }), []);

  // Disable all formats to keep it truly plain text
  const formats: string[] = [];

  // Render plain text safely inside quill without becoming HTML
  const safeHtmlValue = useMemo(() => {
    const text = content || '';
    // render newlines visually as <br>, still not storing HTML in state
    return escapeHtml(text).replace(/\n/g, '<br/>');
  }, [content]);

  const handleChange = useCallback((_html: string, _delta: any, _source: any, editor: any) => {
    // getText returns a trailing newline; trim it
    const plain = (editor?.getText?.() || '').replace(/\n+$/, '');
    onChange(plain);
  }, [onChange]);

  return (
    <div className="border border-gray-300 rounded-md bg-white overflow-hidden">
      <style>{`
        /* Hide any toolbar (defensive) */
        .ql-toolbar { display: none !important; }
        .ql-container {
          min-height: 140px;
          background: white;
          font-size: 14px;
          border: none !important;
        }
        .ql-editor {
          min-height: 140px;
          padding: 12px 15px;
          line-height: 1.5;
        }
        .ql-container.ql-snow { border: none; }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={safeHtmlValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default QuillEditor;