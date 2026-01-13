import { useState, useCallback, useRef } from 'react';
import { SpartiElement } from '../types';
import { createContentChangeEvent, createStyleChangeEvent } from '../core/preview-player';

export interface UseEditorOptions {
  onContentChange?: (element: SpartiElement, content: string) => void;
  onStyleChange?: (element: SpartiElement, styles: Record<string, string>) => void;
  onElementSelect?: (element: SpartiElement | null) => void;
}

export const useSpartiEditor = (options: UseEditorOptions = {}) => {
  const [selectedElement, setSelectedElement] = useState<SpartiElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const historyIndex = useRef(0);

  const selectElement = useCallback((element: SpartiElement | null) => {
    setSelectedElement(element);
    options.onElementSelect?.(element);
  }, [options]);

  const updateContent = useCallback((element: SpartiElement, content: string) => {
    if (!element.element) return;

    // Update DOM
    if (element.element.tagName === 'IMG') {
      element.element.setAttribute('alt', content);
    } else if (element.element.tagName === 'INPUT') {
      (element.element as HTMLInputElement).value = content;
    } else {
      element.element.textContent = content;
    }

    // Update data
    element.data.content = content;

    // Record change for undo/redo
    addToHistory({
      type: 'content',
      element,
      oldValue: element.data.content,
      newValue: content,
      timestamp: Date.now()
    });

    options.onContentChange?.(element, content);
  }, [options]);

  const updateStyle = useCallback((element: SpartiElement, property: string, value: string) => {
    if (!element.element) return;

    const oldValue = element.element.style.getPropertyValue(property);
    
    // Update DOM
    element.element.style.setProperty(property, value);

    // Update data
    element.data.styles[property] = value;

    // Record change for undo/redo
    addToHistory({
      type: 'style',
      element,
      property,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    });

    options.onStyleChange?.(element, { [property]: value });
  }, [options]);

  const updateStyles = useCallback((element: SpartiElement, styles: Record<string, string>) => {
    if (!element.element) return;

    const oldStyles: Record<string, string> = {};
    
    // Apply styles and record old values
    Object.entries(styles).forEach(([property, value]) => {
      oldStyles[property] = element.element!.style.getPropertyValue(property);
      element.element!.style.setProperty(property, value);
      element.data.styles[property] = value;
    });

    // Record change for undo/redo
    addToHistory({
      type: 'styles',
      element,
      oldStyles,
      newStyles: styles,
      timestamp: Date.now()
    });

    options.onStyleChange?.(element, styles);
  }, [options]);

  const updateAttribute = useCallback((element: SpartiElement, attribute: string, value: string | null) => {
    if (!element.element) return;

    const oldValue = element.element.getAttribute(attribute);

    if (value === null) {
      element.element.removeAttribute(attribute);
      delete element.data.attributes[attribute];
    } else {
      element.element.setAttribute(attribute, value);
      element.data.attributes[attribute] = value;
    }

    // Record change for undo/redo
    addToHistory({
      type: 'attribute',
      element,
      attribute,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    });
  }, []);

  const addToHistory = useCallback((action: any) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex.current + 1);
      newHistory.push(action);
      historyIndex.current = newHistory.length - 1;
      return newHistory;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyIndex.current >= 0) {
      const action = history[historyIndex.current];
      
      switch (action.type) {
        case 'content':
          if (action.element.element) {
            action.element.element.textContent = action.oldValue;
            action.element.data.content = action.oldValue;
          }
          break;
        case 'style':
          if (action.element.element) {
            action.element.element.style.setProperty(action.property, action.oldValue);
            action.element.data.styles[action.property] = action.oldValue;
          }
          break;
        case 'styles':
          if (action.element.element) {
            Object.entries(action.oldStyles).forEach(([prop, value]: [string, any]) => {
              action.element.element.style.setProperty(prop, value);
              action.element.data.styles[prop] = value;
            });
          }
          break;
        case 'attribute':
          if (action.element.element) {
            if (action.oldValue === null) {
              action.element.element.removeAttribute(action.attribute);
              delete action.element.data.attributes[action.attribute];
            } else {
              action.element.element.setAttribute(action.attribute, action.oldValue);
              action.element.data.attributes[action.attribute] = action.oldValue;
            }
          }
          break;
      }
      
      historyIndex.current--;
    }
  }, [history]);

  const redo = useCallback(() => {
    if (historyIndex.current < history.length - 1) {
      historyIndex.current++;
      const action = history[historyIndex.current];
      
      switch (action.type) {
        case 'content':
          if (action.element.element) {
            action.element.element.textContent = action.newValue;
            action.element.data.content = action.newValue;
          }
          break;
        case 'style':
          if (action.element.element) {
            action.element.element.style.setProperty(action.property, action.newValue);
            action.element.data.styles[action.property] = action.newValue;
          }
          break;
        case 'styles':
          if (action.element.element) {
            Object.entries(action.newStyles).forEach(([prop, value]: [string, any]) => {
              action.element.element.style.setProperty(prop, value);
              action.element.data.styles[prop] = value;
            });
          }
          break;
        case 'attribute':
          if (action.element.element) {
            if (action.newValue === null) {
              action.element.element.removeAttribute(action.attribute);
              delete action.element.data.attributes[action.attribute];
            } else {
              action.element.element.setAttribute(action.attribute, action.newValue);
              action.element.data.attributes[action.attribute] = action.newValue;
            }
          }
          break;
      }
    }
  }, [history]);

  const canUndo = historyIndex.current >= 0;
  const canRedo = historyIndex.current < history.length - 1;

  const enterEditMode = useCallback(() => {
    setIsEditing(true);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    setSelectedElement(null);
  }, []);

  const hideElement = useCallback((element: SpartiElement) => {
    updateStyle(element, 'display', 'none');
  }, [updateStyle]);

  const showElement = useCallback((element: SpartiElement) => {
    updateStyle(element, 'display', '');
  }, [updateStyle]);

  const toggleElementVisibility = useCallback((element: SpartiElement) => {
    const currentDisplay = element.element?.style.display;
    if (currentDisplay === 'none') {
      showElement(element);
    } else {
      hideElement(element);
    }
  }, [hideElement, showElement]);

  return {
    selectedElement,
    isEditing,
    selectElement,
    updateContent,
    updateStyle,
    updateStyles,
    updateAttribute,
    undo,
    redo,
    canUndo,
    canRedo,
    enterEditMode,
    exitEditMode,
    hideElement,
    showElement,
    toggleElementVisibility,
    history: history.slice(0, historyIndex.current + 1)
  };
};