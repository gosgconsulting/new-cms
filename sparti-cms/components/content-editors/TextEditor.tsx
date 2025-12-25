import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X } from 'lucide-react';
import { CodeJar } from 'codejar';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css';
import '../cms/QuillEditor.css';

// Quill toolbar configuration
const QUILL_TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'font': [] }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'align': [] }],
  ['link', 'image', 'video'],
  ['blockquote', 'code-block'],
  ['clean']
];

interface TextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  link?: string;
  onLinkChange?: (link: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Enter text...',
  className = '',
  link = '',
  onLinkChange
}) => {
  const [showSourceModal, setShowSourceModal] = useState<boolean>(false);
  const [sourceContent, setSourceContent] = useState<string>(content);
  const [editorContent, setEditorContent] = useState<string>(content);
  
  const sourceEditorRef = useRef<HTMLDivElement>(null);
  const codeJarRef = useRef<CodeJar | null>(null);

  // Update editor content when prop changes
  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
      setSourceContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    // Initialize CodeJar when modal opens
    if (showSourceModal && sourceEditorRef.current && !codeJarRef.current) {
      const highlight = (editor: HTMLElement) => {
        const code = editor.textContent || '';
        editor.innerHTML = Prism.highlight(code, Prism.languages.markup, 'markup');
      };

      codeJarRef.current = CodeJar(sourceEditorRef.current, highlight, {
        tab: '  ', // Use 2 spaces for tabs
      });

      // Set initial content (sourceContent is already updated in openSourceModal)
      codeJarRef.current.updateCode(sourceContent);

      // Handle content changes
      codeJarRef.current.onUpdate((code) => {
        setSourceContent(code);
      });

      // Focus the editor
      setTimeout(() => {
        sourceEditorRef.current?.focus();
      }, 0);
    }

    // Cleanup CodeJar when modal closes
    return () => {
      if (!showSourceModal && codeJarRef.current) {
        codeJarRef.current.destroy();
        codeJarRef.current = null;
      }
    };
  }, [showSourceModal, sourceContent]);

  // Separate effect to update CodeJar when content prop changes externally while modal is open
  // This handles external content updates without interfering with user edits
  useEffect(() => {
    if (showSourceModal && codeJarRef.current && content !== sourceContent) {
      // Content prop changed externally - update CodeJar and sourceContent
      codeJarRef.current.updateCode(content);
      setSourceContent(content);
      setEditorContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, showSourceModal]);

  // Quill modules configuration
  const quillModules = useMemo(() => ({
    toolbar: QUILL_TOOLBAR_OPTIONS,
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 300,
      maxStack: 50,
      userOnly: true
    }
  }), []);

  // Quill formats
  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

  // Handle Quill content change
  const handleQuillChange = useCallback((html: string) => {
    setEditorContent(html);
    onChange?.(html);
  }, [onChange]);

  // Removed handleSourceContentChange - CodeJar handles updates via onUpdate callback

  const openSourceModal = () => {
    // Get current content from Quill editor
    setSourceContent(editorContent);
    setShowSourceModal(true);
  };

  const closeSourceModal = () => {
    // Cleanup CodeJar instance
    if (codeJarRef.current) {
      codeJarRef.current.destroy();
      codeJarRef.current = null;
    }
    setShowSourceModal(false);
  };

  const saveSourceContent = () => {
    // Use sourceContent state which is kept in sync via CodeJar's onUpdate callback
    const latestContent = sourceContent;
    
    // Update Quill editor with the source content
    setEditorContent(latestContent);
    onChange?.(latestContent);
    
    // Cleanup CodeJar instance
    if (codeJarRef.current) {
      codeJarRef.current.destroy();
      codeJarRef.current = null;
    }
    setShowSourceModal(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quill Editor with Toolbar */}
      <div className="quill-editor-wrapper">
        <ReactQuill
          theme="snow"
          value={editorContent}
          onChange={handleQuillChange}
          modules={quillModules}
          formats={quillFormats}
          placeholder={placeholder}
        />
      </div>
      
      {/* HTML/Source Editor Button */}
      <div className="flex justify-end">
        <button 
          onClick={openSourceModal}
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded border border-gray-300"
          title="Edit HTML Source"
        >
          Edit HTML Source
        </button>
      </div>

      {/* HTML Source Editor Modal */}
      {showSourceModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeSourceModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Edit HTML Source</h2>
              <button
                onClick={closeSourceModal}
                className="p-2 hover:bg-gray-100 rounded"
                title="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-4 overflow-auto bg-gray-50">
              <div
                ref={sourceEditorRef}
                className="w-full h-full p-4 outline-none font-mono text-sm border border-gray-300 rounded overflow-auto bg-white"
                style={{ 
                  minHeight: '400px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  tabSize: 2
                }}
                spellCheck="false"
                dir="ltr"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={closeSourceModal}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveSourceContent}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Link Preview */}
      {link && (
        <div className="mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Link Preview:</span>
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              {link}
            </a>
          </div>
          <div className="mt-2 p-2 border border-gray-200 rounded bg-white">
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              <div dangerouslySetInnerHTML={{ __html: editorContent }} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
