import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

  useEffect(() => {
    setComponentsState(components || []);
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

  const selectElement = (element: SpartiElement | null) => {
    setSelectedElement(element);
  };

  const hoverElement = (element: SpartiElement | null) => {
    setHoveredElement(element);
  };

  const updateComponent = (index: number, updated: ComponentSchema) => {
    setComponentsState(prev => prev.map((c, i) => (i === index ? updated : c)));
  };

  const contextValue: GOSGBuilderContextType = {
    config,
    isEditing,
    selectedElement,
    hoveredElement,
    enterEditMode,
    exitEditMode,
    selectElement,
    hoverElement,
    components: componentsState,
    setComponents: setComponentsState,
    updateComponent,
    pageId,
    slug,
    tenantId,
    themeId,
  };

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