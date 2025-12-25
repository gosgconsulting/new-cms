import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { EditingContext, SpartiElement, SpartiBuilderConfig } from '../types';
import type { ComponentSchema } from '../types/schema';

interface GOSGBuilderContextType extends EditingContext {
  config: SpartiBuilderConfig;
  enterEditMode: () => void;
  exitEditMode: () => void;
  selectElement: (element: SpartiElement | null) => void;
  hoverElement: (element: SpartiElement | null) => void;
  // Components state and helpers
  components: ComponentSchema[];
  setComponents: (next: ComponentSchema[]) => void;
  updateComponent: (index: number, updated: ComponentSchema) => void;
  // Page context for saving
  pageId?: string;
  slug?: string;
  tenantId?: string;
  themeId?: string;
}

const GOSGBuilderContext = createContext<GOSGBuilderContextType | null>(null);

interface SpartiBuilderProviderProps {
  children: ReactNode;
  config?: SpartiBuilderConfig;
  components?: ComponentSchema[];
  // Page context (optional)
  pageId?: string;
  slug?: string;
  tenantId?: string;
  themeId?: string;
}

export const SpartiBuilderProvider: React.FC<SpartiBuilderProviderProps> = ({
  children,
  config = { enabled: true, toolbar: true, autoDetect: true },
  components = [],
  pageId,
  slug,
  tenantId,
  themeId
}) => {
  // CHANGED: start in edit mode
  const [isEditing, setIsEditing] = useState(true);
  const [selectedElement, setSelectedElement] = useState<SpartiElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<SpartiElement | null>(null);
  const [componentsState, setComponentsState] = useState<ComponentSchema[]>(components);

  // Only update components state if the array reference or content actually changed
  useEffect(() => {
    // Deep comparison to prevent unnecessary updates
    const currentKeys = componentsState.map(c => c.key).join(',');
    const newKeys = (components || []).map(c => c.key).join(',');
    
    if (currentKeys !== newKeys || componentsState.length !== (components || []).length) {
      setComponentsState(components || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components]);

  // NEW: keep body class synced with isEditing (since we start in edit mode)
  useEffect(() => {
    if (isEditing) {
      document.body.classList.add('sparti-editing');
    } else {
      document.body.classList.remove('sparti-editing');
    }
    return () => {
      document.body.classList.remove('sparti-editing');
    };
  }, [isEditing]);

  const enterEditMode = () => {
    setIsEditing(true);
    document.body.classList.add('sparti-editing');
  };

  const exitEditMode = () => {
    // NO-OP: do not allow leaving edit mode
    // Optionally clear selections without toggling mode
    setSelectedElement(null);
    setHoveredElement(null);
    // Keep body class since edit mode stays on
    document.body.classList.add('sparti-editing');
  };

  const selectElement = useCallback((element: SpartiElement | null) => {
    setSelectedElement(element);
  }, []);

  const hoverElement = useCallback((element: SpartiElement | null) => {
    setHoveredElement(element);
  }, []);

  const updateComponent = useCallback((index: number, updated: ComponentSchema) => {
    setComponentsState(prev => prev.map((c, i) => (i === index ? updated : c)));
  }, []);

  const enterEditModeCallback = useCallback(() => {
    setIsEditing(true);
    document.body.classList.add('sparti-editing');
  }, []);

  const exitEditModeCallback = useCallback(() => {
    // NO-OP: do not allow leaving edit mode
    // Optionally clear selections without toggling mode
    setSelectedElement(null);
    setHoveredElement(null);
    // Keep body class since edit mode stays on
    document.body.classList.add('sparti-editing');
  }, []);

  const setComponentsCallback = useCallback((next: ComponentSchema[]) => {
    setComponentsState(next);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: GOSGBuilderContextType = useMemo(() => ({
    config,
    isEditing,
    selectedElement,
    hoveredElement,
    enterEditMode: enterEditModeCallback,
    exitEditMode: exitEditModeCallback,
    selectElement,
    hoverElement,
    components: componentsState,
    setComponents: setComponentsCallback,
    updateComponent,
    pageId,
    slug,
    tenantId,
    themeId,
  }), [
    config,
    isEditing,
    selectedElement,
    hoveredElement,
    enterEditModeCallback,
    exitEditModeCallback,
    selectElement,
    hoverElement,
    componentsState,
    setComponentsCallback,
    updateComponent,
    pageId,
    slug,
    tenantId,
    themeId,
  ]);

  return (
    <GOSGBuilderContext.Provider value={contextValue}>
      {children}
    </GOSGBuilderContext.Provider>
  );
};

export const useSpartiBuilder = () => {
  const context = useContext(GOSGBuilderContext);
  if (!context) {
    throw new Error('useSpartiBuilder must be used within SpartiBuilderProvider');
  }
  return context;
};