import React, { ReactNode, useEffect, useRef } from 'react';
import { useSpartiBuilder } from './SpartiBuilderProvider';
import { SpartiElement } from '../types';
import { UniversalElementDetector } from '../core/universal-detector';

interface ElementSelectorProps {
  children: ReactNode;
}

export const ElementSelector: React.FC<ElementSelectorProps> = ({ children }) => {
  const { isEditing, selectElement, hoverElement, selectedElement } = useSpartiBuilder();
  const contentRef = useRef<HTMLDivElement>(null);

  const createSpartiElement = (element: HTMLElement): SpartiElement => {
    const data = UniversalElementDetector.extractElementData(element);
    return { element, data };
  };

  // Helper: resolve to nearest section wrapper if present
  const resolveSectionRoot = (target: HTMLElement | null): HTMLElement | null => {
    if (!target) return null;
    const nearestEditable = UniversalElementDetector.findNearestEditableElement(target);
    if (!nearestEditable) return null;
    const sectionRoot = nearestEditable.closest('[data-sparti-component-index]') as HTMLElement | null;
    return sectionRoot || nearestEditable;
  };

  const handleElementClick = (e: MouseEvent) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    const effectiveElement = resolveSectionRoot(target);

    if (!effectiveElement || !UniversalElementDetector.isEditableElement(effectiveElement)) {
      return;
    }

    const spartiElement = createSpartiElement(effectiveElement);
    selectElement(spartiElement);
    // Clear any hover highlight once a section is selected
    hoverElement(null);
  };

  const handleElementHover = (e: MouseEvent) => {
    if (!isEditing) return;

    // If a section is already selected (editor open), disable hover feedback
    if (selectedElement) {
      hoverElement(null);
      return;
    }

    const target = e.target as HTMLElement;
    const effectiveElement = resolveSectionRoot(target);

    if (!effectiveElement || !UniversalElementDetector.isEditableElement(effectiveElement)) {
      hoverElement(null);
      return;
    }

    const spartiElement = createSpartiElement(effectiveElement);
    hoverElement(spartiElement);
  };

  const handleElementLeave = () => {
    if (!isEditing) return;
    hoverElement(null);
  };

  useEffect(() => {
    if (!isEditing) return;

    const targetElement = contentRef.current || document.body;

    targetElement.addEventListener('click', handleElementClick, true);
    targetElement.addEventListener('mouseover', handleElementHover, true);
    targetElement.addEventListener('mouseleave', handleElementLeave, true);

    document.body.classList.add('sparti-editing');

    return () => {
      targetElement.removeEventListener('click', handleElementClick, true);
      targetElement.removeEventListener('mouseover', handleElementHover, true);
      targetElement.removeEventListener('mouseleave', handleElementLeave, true);
      document.body.classList.remove('sparti-editing');
    };
  }, [isEditing, selectedElement]);

  return (
    <div ref={contentRef} className="sparti-content">
      {children}
    </div>
  );
};