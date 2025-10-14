import React, { useEffect, useState } from 'react';
import { useSpartiBuilder } from './SpartiBuilderProvider';

export const EditingOverlay: React.FC = () => {
  const { isEditing, selectedElement, hoveredElement } = useSpartiBuilder();
  const [overlayStyles, setOverlayStyles] = useState<React.CSSProperties>({});
  const [hoverStyles, setHoverStyles] = useState<React.CSSProperties>({});

  const getElementBounds = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height,
    };
  };

  useEffect(() => {
    if (selectedElement?.element) {
      const bounds = getElementBounds(selectedElement.element);
      setOverlayStyles({
        position: 'absolute',
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        pointerEvents: 'none',
        zIndex: 9998,
      });
    }
  }, [selectedElement]);

  useEffect(() => {
    if (hoveredElement?.element && hoveredElement.element !== selectedElement?.element) {
      const bounds = getElementBounds(hoveredElement.element);
      setHoverStyles({
        position: 'absolute',
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        pointerEvents: 'none',
        zIndex: 9997,
      });
    } else {
      setHoverStyles({ display: 'none' });
    }
  }, [hoveredElement, selectedElement]);

  if (!isEditing) return null;

  return (
    <>
      {/* Hover overlay */}
      <div 
        className="sparti-hover-overlay" 
        style={hoverStyles}
      />
      
      {/* Selection overlay */}
      {selectedElement && (
        <div 
          className="sparti-selection-overlay" 
          style={overlayStyles}
        >
          <div className="sparti-element-label">
            {selectedElement.data.tagName}
          </div>
        </div>
      )}
    </>
  );
};