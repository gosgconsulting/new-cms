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

  const updateSelectedOverlay = () => {
    if (selectedElement?.element) {
      const bounds = getViewportBounds(selectedElement.element);
      setOverlayStyles({
        position: 'fixed',
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        pointerEvents: 'none',
        zIndex: 9998, // Below modal/backdrop
        transform: 'translateZ(0)',
      });
    } else {
      setOverlayStyles({ display: 'none' });
    }
  };

  const updateHoverOverlay = () => {
    // Hide hover overlay completely while a section editor is open
    if (selectedElement) {
      setHoverStyles({ display: 'none' });
      return;
    }
    if (hoveredElement?.element) {
      const bounds = getViewportBounds(hoveredElement.element);
      setHoverStyles({
        position: 'fixed',
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        pointerEvents: 'none',
        zIndex: 9997, // Below selection overlay and modal
        transform: 'translateZ(0)',
      });
    } else {
      setHoverStyles({ display: 'none' });
    }
  };

  useEffect(() => {
    updateSelectedOverlay();
  }, [selectedElement]);

  useEffect(() => {
    updateHoverOverlay();
  }, [hoveredElement, selectedElement]);

  useEffect(() => {
    if (!isEditing) return;

    let rafId: number | null = null;
    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateSelectedOverlay();
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
  }, [isEditing, selectedElement, hoveredElement]);

  if (!isEditing) return null;

  const selectedLabel =
    selectedElement?.data?.attributes?.['data-sparti-section'] ||
    selectedElement?.data?.tagName ||
    '';

  return (
    <>
      <div className="sparti-hover-overlay" style={hoverStyles} />
      {/* Optional: show border-only selection overlay. If you prefer none, set display: 'none'. */}
      {selectedElement && (
        <div className="sparti-selection-overlay" style={overlayStyles}>
          <div className="sparti-element-label">
            {String(selectedLabel)}
          </div>
        </div>
      )}
    </>
  );
};