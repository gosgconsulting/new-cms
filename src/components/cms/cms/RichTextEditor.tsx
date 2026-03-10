import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Full toolbar configuration matching reference design
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    },
    clipboard: {
      matchVisual: true,
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true,
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align', 'direction',
    'blockquote', 'code-block',
    'link', 'image', 'video',
  ];

  const handleChange = (value: string) => {
    onChange(value);
  };

  // Handle image insertion
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule('toolbar');
      
      if (toolbar) {
        toolbar.addHandler('image', () => {
          const url = prompt('Enter image URL:');
          if (url) {
            const range = quill.getSelection();
            if (range) {
              quill.insertEmbed(range.index, 'image', url, 'user');
            }
          }
        });
      }
    }
  }, []);

  return (
    <div className="rich-text-editor">
      <style>{`
        .rich-text-editor .ql-container {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
        }
        .rich-text-editor .ql-editor {
          min-height: 300px;
          padding: 16px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar {
          border: 1px solid #e5e7eb;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: #f9fafb;
          padding: 8px;
        }
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 8px;
        }
        .rich-text-editor .ql-toolbar button {
          width: 28px;
          height: 28px;
          padding: 4px;
        }
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: #7E69AB;
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: currentColor;
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: currentColor;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};

export default RichTextEditor;
