import React, { useEffect, useState } from 'react';
import { useSpartiBuilder } from './SpartiBuilderProvider';

export const EditingOverlay: React.FC = () => {
  const { isEditing, selectedElement, hoveredElement } = useSpartiBuilder();
  const [overlayStyles, setOverlayStyles] = useState<React.CSSProperties>({});
  const [hoverStyles, setHoverStyles] = useState<React.CSSProperties>({});

  const getViewportBounds = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  };

  // If modal/editor is open (selectedElement present), disable all overlays
  if (!isEditing || selectedElement) return null;

  const updateHoverOverlay = () => {
    if (hoveredElement?.element) {
      const bounds = getViewportBounds(hoveredElement.element);
      setHoverStyles({
        position: 'fixed',
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        pointerEvents: 'none',
        zIndex: 9997,
        transform: 'translateZ(0)',
      });
    } else {
      setHoverStyles({ display: 'none' });
    }
  };

  useEffect(() => {
    updateHoverOverlay();
  }, [hoveredElement]);

  useEffect(() => {
    if (!isEditing) return;

    let rafId: number | null = null;
    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateHoverOverlay();
      });
    };

    document.addEventListener('scroll', scheduleUpdate, true);
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    scheduleUpdate();

    return () => {
      document.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate as EventListener);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isEditing, hoveredElement]);

  // Only render hover overlay when not editing a selected section
  return (
    <>
      <div 
        className="sparti-hover-overlay sparti-overlay sparti-ui" 
        style={hoverStyles}
      />
    </>
  );
};