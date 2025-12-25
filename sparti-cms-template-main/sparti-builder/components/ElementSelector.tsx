import React, { ReactNode, useEffect, useRef } from 'react';
import { useSpartiBuilder } from './SpartiBuilderProvider';
import { SpartiElement } from '../types';
import { UniversalElementDetector } from '../core/universal-detector';

interface ElementSelectorProps {
  children: ReactNode;
}

export const ElementSelector: React.FC<ElementSelectorProps> = ({ children }) => {
  const { isEditing, selectElement, hoverElement } = useSpartiBuilder();
  const contentRef = useRef<HTMLDivElement>(null);

  const createSpartiElement = (element: HTMLElement): SpartiElement => {
    const data = UniversalElementDetector.extractElementData(element);
    return { element, data };
  };

  const handleElementClick = (e: MouseEvent) => {
    if (!isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    const element = UniversalElementDetector.findNearestEditableElement(target);
    
    if (!element || !UniversalElementDetector.isEditableElement(element)) {
      return;
    }

    const spartiElement = createSpartiElement(element);
    selectElement(spartiElement);
  };

  const handleElementHover = (e: MouseEvent) => {
    if (!isEditing) return;
    
    const target = e.target as HTMLElement;
    const element = UniversalElementDetector.findNearestEditableElement(target);
    
    if (!element || !UniversalElementDetector.isEditableElement(element)) {
      hoverElement(null);
      return;
    }

    const spartiElement = createSpartiElement(element);
    hoverElement(spartiElement);
  };

  const handleElementLeave = () => {
    if (!isEditing) return;
    hoverElement(null);
  };

  useEffect(() => {
    if (!isEditing) return;

    // Use document instead of contentRef for universal compatibility
    const targetElement = contentRef.current || document.body;
    
    // Add event listeners with capture phase for better control
    targetElement.addEventListener('click', handleElementClick, true);
    targetElement.addEventListener('mouseover', handleElementHover, true);
    targetElement.addEventListener('mouseleave', handleElementLeave, true);

    // Add class to body for global styling
    document.body.classList.add('sparti-editing');

    return () => {
      targetElement.removeEventListener('click', handleElementClick, true);
      targetElement.removeEventListener('mouseover', handleElementHover, true);
      targetElement.removeEventListener('mouseleave', handleElementLeave, true);
      document.body.classList.remove('sparti-editing');
    };
  }, [isEditing]);

  return (
    <div ref={contentRef} className="sparti-content">
      {children}
    </div>
  );
};