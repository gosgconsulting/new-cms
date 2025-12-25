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

    // Ensure any hover is removed immediately after selection
    hoverElement(null);
    document.body.classList.add('sparti-editor-open');
  };

  const handleElementHover = (e: MouseEvent) => {
    if (!isEditing) return;

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

    // Always track clicks and mouseleave; ALWAYS track mouseover (even when a section is selected)
    targetElement.addEventListener('click', handleElementClick, true);
    targetElement.addEventListener('mouseover', handleElementHover, true);
    targetElement.addEventListener('mouseleave', handleElementLeave, true);

    document.body.classList.add('sparti-editing');

    return () => {
      targetElement.removeEventListener('click', handleElementClick, true);
      targetElement.removeEventListener('mouseover', handleElementHover, true);
      targetElement.removeEventListener('mouseleave', handleElementLeave, true);
      document.body.classList.remove('sparti-editing');
      document.body.classList.remove('sparti-editor-open');
    };
  }, [isEditing, selectedElement]);

  return (
    <div ref={contentRef} className="sparti-content">
      {children}
    </div>
  );
};