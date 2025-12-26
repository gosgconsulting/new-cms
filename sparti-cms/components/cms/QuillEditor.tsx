import React, { useMemo, useCallback, memo, useRef, useEffect } from 'react';
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
  const quillRef = useRef<ReactQuill>(null);
  const localContentRef = useRef(stripTags(content || ''));
  const isFocusedRef = useRef(false);
  
  // Suppress findDOMNode warning from react-quill library
  // This is a known issue with react-quill v2.0.0 and cannot be fixed without modifying the library
  // The warning is harmless and will be resolved when react-quill updates to use refs instead of findDOMNode
  useEffect(() => {
    // Store the original console.warn at module level to handle multiple instances
    if (!(console as any).__originalWarn) {
      (console as any).__originalWarn = console.warn;
    }
    const originalWarn = (console as any).__originalWarn;
    
    // Track instance count
    if (!(console as any).__quillInstanceCount) {
      (console as any).__quillInstanceCount = 0;
    }
    (console as any).__quillInstanceCount++;
    
    const suppressedWarnings = ['findDOMNode is deprecated'];
    
    // Only override if not already overridden
    if (!(console as any).__quillWarningSuppressed) {
      console.warn = (...args: any[]) => {
        const message = args[0];
        if (typeof message === 'string' && suppressedWarnings.some(warning => message.includes(warning))) {
          return; // Suppress this specific warning from react-quill
        }
        originalWarn.apply(console, args);
      };
      (console as any).__quillWarningSuppressed = true;
    }
    
    return () => {
      // Decrement instance count
      if ((console as any).__quillInstanceCount) {
        (console as any).__quillInstanceCount--;
        // Restore original warn when last instance unmounts (optional - can leave suppressed)
        if ((console as any).__quillInstanceCount === 0) {
          // Uncomment to restore on last unmount:
          // console.warn = originalWarn;
          // (console as any).__quillWarningSuppressed = false;
        }
      }
    };
  }, []);
  
  // Initialize refs from content prop - but only if editor is not focused
  // This effect should NOT run while user is typing to prevent focus loss
  useEffect(() => {
    // CRITICAL: Skip if focused - never update Quill content while user is typing
    // This is the key to preventing focus loss
    if (isFocusedRef.current) {
      console.log('[testing] QuillEditor - skipping content sync, editor is focused');
      return;
    }
    
    const newContent = stripTags(content || '');
    // Only update if content actually changed
    if (newContent === localContentRef.current) {
      return;
    }
    
    localContentRef.current = newContent;
    
    // Only update Quill if it exists and is definitely not focused
    if (quillRef.current) {
      const quillInstance = quillRef.current.getEditor();
      if (quillInstance) {
        // Triple-check that editor is not focused using multiple methods
        const editorElement = quillInstance.root;
        const isEditorFocused = document.activeElement === editorElement || 
                               editorElement.contains(document.activeElement) ||
                               editorElement === document.activeElement?.closest('.ql-editor');
        
        if (isEditorFocused) {
          console.log('[testing] QuillEditor - editor is focused, skipping setText');
          return;
        }
        
        const currentText = quillInstance.getText();
        // Only update if content is actually different
        if (currentText.trim() !== newContent.trim()) {
          console.log('[testing] QuillEditor - updating content from prop (not focused)');
          quillInstance.setText(newContent);
        }
      }
    }
  }, [content]);
  
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

  // Store content locally during typing, only call onChange on blur
  const handleChange = useCallback((_html: string, _delta: any, _source: any, editor: any) => {
    const plain = stripTags(editor?.getText?.() || '').replace(/\n+$/, '');
    localContentRef.current = plain;
    // Don't call onChange during typing - only update local ref
    // onChange will be called on blur
  }, []);

  // Store onChange in a ref to avoid recreating event listeners
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // Set up focus/blur handlers on the Quill editor instance
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    // Use a small delay to ensure Quill is fully initialized
    const timeoutId = setTimeout(() => {
      if (quillRef.current) {
        const quillInstance = quillRef.current.getEditor();
        if (quillInstance && quillInstance.root) {
          const editorElement = quillInstance.root;
          
          const handleFocus = () => {
            console.log('[testing] QuillEditor - focus event detected');
            isFocusedRef.current = true;
          };
          
          const handleBlur = (e: FocusEvent) => {
            console.log('[testing] QuillEditor - blur event detected');
            isFocusedRef.current = false;
            // Small delay to ensure blur is complete and editor state is stable
            setTimeout(() => {
              // Double-check we're still blurred (user might have clicked back in)
              if (!isFocusedRef.current && quillInstance) {
                const currentText = stripTags(quillInstance.getText() || '').replace(/\n+$/, '');
                localContentRef.current = currentText;
                console.log('[testing] QuillEditor - syncing content on blur:', currentText);
                // Use ref to avoid stale closure
                onChangeRef.current(currentText);
              }
            }, 100);
          };
          
          // Use capture phase to catch events early
          editorElement.addEventListener('focus', handleFocus, true);
          editorElement.addEventListener('blur', handleBlur, true);
          
          // Also listen on the container for better detection
          const container = editorElement.closest('.ql-container');
          if (container) {
            container.addEventListener('focusin', handleFocus, true);
            container.addEventListener('focusout', handleBlur, true);
          }
          
          cleanup = () => {
            editorElement.removeEventListener('focus', handleFocus, true);
            editorElement.removeEventListener('blur', handleBlur, true);
            if (container) {
              container.removeEventListener('focusin', handleFocus, true);
              container.removeEventListener('focusout', handleBlur, true);
            }
          };
        }
      }
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (cleanup) cleanup();
    };
  }, []); // Only run once on mount

  // IMPORTANT: uncontrolled defaultValue must be plain text (strip any legacy HTML)
  // Memoize to prevent ReactQuill from remounting when content changes
  const initialValue = useMemo(() => stripTags(content || ''), []);

  return (
    <div className="sparti-quill-container">
      <style>{`
        .ql-toolbar { display: none !important; }
        .ql-container.ql-snow { border: 1px solid #e5e7eb; border-radius: 6px; }
        .ql-editor { min-height: 140px; padding: 12px 15px; }
        .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
      `}</style>
      <ReactQuill
        ref={quillRef}
        key={`quill-${placeholder || 'default'}`} // Stable key to prevent remounting
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

// Custom memo comparison - only re-render if placeholder changes, not content or onChange
export default memo(QuillEditor, (prevProps, nextProps) => {
  // Only re-render if placeholder changes
  // Content and onChange changes are handled internally via refs and useEffect
  // This prevents re-renders that would cause ReactQuill to remount and lose focus
  return prevProps.placeholder === nextProps.placeholder;
});