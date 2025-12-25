import React, { useEffect, useState } from 'react';
import { useSpartiBuilder } from './SpartiBuilderProvider';

export const EditingOverlay: React.FC = () => {
  const { isEditing, selectedElement, hoveredElement } = useSpartiBuilder();
  const [overlayStyles, setOverlayStyles] = useState<React.CSSProperties>({});
  const [hoverStyles, setHoverStyles] = useState<React.CSSProperties>({});

  // Use viewport-relative bounds (no manual scroll offsets)
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
        position: 'fixed', // fixed so it follows during scroll
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        pointerEvents: 'none',
        zIndex: 9998,
        transform: 'translateZ(0)', // reduce flicker
      });
    } else {
      setOverlayStyles({ display: 'none' });
    }
  };

  const updateHoverOverlay = () => {
    if (hoveredElement?.element && hoveredElement.element !== selectedElement?.element) {
      const bounds = getViewportBounds(hoveredElement.element);
      setHoverStyles({
        position: 'fixed', // fixed so it follows during scroll
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

  // Update when selection changes
  useEffect(() => {
    updateSelectedOverlay();
  }, [selectedElement]);

  // Update when hover changes
  useEffect(() => {
    updateHoverOverlay();
  }, [hoveredElement, selectedElement]);

  // Recompute on any scroll (including nested scroll containers) and on resize
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

    // Capture scroll events from any ancestor/scroll container
    document.addEventListener('scroll', scheduleUpdate, true);
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    // Initial update
    scheduleUpdate();

    return () => {
      document.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate as EventListener);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isEditing, selectedElement, hoveredElement]);

  if (!isEditing) return null;

  // Prefer section label when available
  const selectedLabel =
    selectedElement?.data?.attributes?.['data-sparti-section'] ||
    selectedElement?.data?.tagName ||
    '';

  return (
    <>
      {/* Hover overlay */}
      <div 
        className="sparti-hover-overlay" 
        style={hoverStyles}
      />
      
      {/* Selection overlay with label */}
      {selectedElement && (
        <div 
          className="sparti-selection-overlay" 
          style={overlayStyles}
        >
          <div className="sparti-element-label">
            {String(selectedLabel)}
          </div>
        </div>
      )}
    </>
  );
};