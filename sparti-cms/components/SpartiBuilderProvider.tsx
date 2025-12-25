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
}

const GOSGBuilderContext = createContext<GOSGBuilderContextType | null>(null);

interface SpartiBuilderProviderProps {
  children: ReactNode;
  config?: SpartiBuilderConfig;
  components?: ComponentSchema[];
}

export const SpartiBuilderProvider: React.FC<SpartiBuilderProviderProps> = ({
  children,
  config = { enabled: true, toolbar: true, autoDetect: true },
  components = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SpartiElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<SpartiElement | null>(null);
  const [componentsState, setComponentsState] = useState<ComponentSchema[]>(components);

  // Keep internal state in sync if parent changes initial components
  useEffect(() => {
    setComponentsState(components || []);
  }, [components]);

  const enterEditMode = () => {
    setIsEditing(true);
    document.body.classList.add('sparti-editing');
  };

  const exitEditMode = () => {
    setIsEditing(false);
    setSelectedElement(null);
    setHoveredElement(null);
    document.body.classList.remove('sparti-editing');
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