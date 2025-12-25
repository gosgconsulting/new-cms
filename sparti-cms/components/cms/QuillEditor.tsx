import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ 
  content, 
  onChange,
  placeholder = 'Write your post content here...'
}) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent',
    'align',
    'link', 'image',
    'color', 'background'
  ];

  return (
    <div className="border border-gray-300 rounded-md bg-white overflow-hidden">
      <style>{`
        .ql-container {
          min-height: 200px;
          background: white;
          font-size: 14px;
        }
        .ql-editor {
          min-height: 200px;
          padding: 12px 15px;
        }
        .ql-toolbar {
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 8px;
        }
        .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        .ql-toolbar .ql-fill {
          fill: #374151;
        }
        .ql-toolbar button:hover,
        .ql-toolbar button.ql-active {
          color: #9b87f5;
        }
        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #9b87f5;
        }
        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: #9b87f5;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default QuillEditor;
