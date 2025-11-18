import { useState, useEffect, useRef, useCallback } from 'react';
import { CodeJar } from 'codejar';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import { ComponentSchema } from '../types/schema';
import { JSON_EDITOR_CONFIG } from '../utils/componentHelpers';
import { validateJSON } from '../utils/validation';

interface UseJSONEditorOptions {
  components: ComponentSchema[];
  onComponentsChange: (components: ComponentSchema[]) => void;
}

export const useJSONEditor = ({ components, onComponentsChange }: UseJSONEditorOptions) => {
  const [showEditor, setShowEditor] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const codeJarRef = useRef<CodeJar | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update JSON string when editor opens
  useEffect(() => {
    if (showEditor) {
      const jsonContent = JSON.stringify(components, null, JSON_EDITOR_CONFIG.TAB_SIZE);
      setJsonString(jsonContent);
      setJsonError(null);
    }
  }, [showEditor, components]);

  // Initialize CodeJar
  const initializeCodeJar = useCallback((element: HTMLDivElement) => {
    if (codeJarRef.current) {
      return;
    }

    const highlight = (editor: HTMLElement) => {
      const code = editor.textContent || '';
      try {
        editor.innerHTML = Prism.highlight(code, Prism.languages.json, 'json');
      } catch (error) {
        editor.innerHTML = code;
      }
    };

    try {
      codeJarRef.current = CodeJar(element, highlight, {
        tab: ' '.repeat(JSON_EDITOR_CONFIG.TAB_SIZE),
      });

      const initialContent = JSON.stringify(components, null, JSON_EDITOR_CONFIG.TAB_SIZE);
      codeJarRef.current.updateCode(initialContent);

      codeJarRef.current.onUpdate((code) => {
        setJsonString(code);
        const validation = validateJSON(code);
        if (validation.valid) {
          try {
            const parsed = JSON.parse(code);
            // Handle both array and object with components property
            const componentsArray = Array.isArray(parsed) 
              ? parsed 
              : (parsed.components && Array.isArray(parsed.components) ? parsed.components : null);
            
            if (componentsArray) {
              onComponentsChange(componentsArray);
              setJsonError(null);
            } else {
              setJsonError('JSON must be an array of components or an object with a components array.');
            }
          } catch (error) {
            setJsonError('Failed to parse JSON.');
          }
        } else {
          setJsonError(validation.error || 'Invalid JSON format.');
        }
      });

      setTimeout(() => {
        element.focus();
      }, JSON_EDITOR_CONFIG.FOCUS_DELAY);
    } catch (error) {
      console.error('[testing] Error initializing CodeJar:', error);
    }
  }, [components, onComponentsChange]);

  // Callback ref to initialize when element mounts
  const setEditorRef = useCallback((element: HTMLDivElement | null) => {
    if (element && showEditor && !codeJarRef.current) {
      retryTimeoutRef.current = setTimeout(() => {
        initializeCodeJar(element);
      }, JSON_EDITOR_CONFIG.INIT_DELAY);
    }
  }, [showEditor, initializeCodeJar]);

  // Cleanup on close
  useEffect(() => {
    if (!showEditor) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (codeJarRef.current) {
        codeJarRef.current.destroy();
        codeJarRef.current = null;
      }
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [showEditor]);

  const openEditor = useCallback(() => {
    setShowEditor(true);
  }, []);

  const closeEditor = useCallback(() => {
    setShowEditor(false);
  }, []);

  return {
    showEditor,
    jsonString,
    jsonError,
    setEditorRef,
    openEditor,
    closeEditor,
  };
};

