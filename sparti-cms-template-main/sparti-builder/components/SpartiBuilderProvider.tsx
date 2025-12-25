import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EditingContext, SpartiElement, SpartiBuilderConfig } from '../types';

interface SpartiBuilderContextType extends EditingContext {
  config: SpartiBuilderConfig;
  enterEditMode: () => void;
  exitEditMode: () => void;
  selectElement: (element: SpartiElement | null) => void;
  hoverElement: (element: SpartiElement | null) => void;
}

const SpartiBuilderContext = createContext<SpartiBuilderContextType | null>(null);

interface SpartiBuilderProviderProps {
  children: ReactNode;
  config?: SpartiBuilderConfig;
}

export const SpartiBuilderProvider: React.FC<SpartiBuilderProviderProps> = ({
  children,
  config = { enabled: true, toolbar: true, autoDetect: true }
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SpartiElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<SpartiElement | null>(null);

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

  const contextValue: SpartiBuilderContextType = {
    config,
    isEditing,
    selectedElement,
    hoveredElement,
    enterEditMode,
    exitEditMode,
    selectElement,
    hoverElement,
  };

  return (
    <SpartiBuilderContext.Provider value={contextValue}>
      {children}
    </SpartiBuilderContext.Provider>
  );
};

export const useSpartiBuilder = () => {
  const context = useContext(SpartiBuilderContext);
  if (!context) {
    throw new Error('useSpartiBuilder must be used within SpartiBuilderProvider');
  }
  return context;
};