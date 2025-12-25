import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ResizableDividerProps {
  /** Current width of the right panel in pixels */
  width: number;
  /** Callback when width changes */
  onWidthChange: (width: number) => void;
  /** Minimum width of the right panel in pixels */
  minWidth?: number;
  /** Maximum width of the right panel in pixels */
  maxWidth?: number;
}

/**
 * Resizable divider component that allows users to drag to resize columns
 * Shows a hover indicator and cursor change when hovering over the divider
 */
export const ResizableDivider: React.FC<ResizableDividerProps> = ({
  width,
  onWidthChange,
  minWidth = 300,
  maxWidth = 800,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = startXRef.current - e.clientX; // Inverted because we're resizing from the right
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
    
    onWidthChange(newWidth);
  }, [minWidth, maxWidth, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    // Add global mouse move and up listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, [width, handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={dividerRef}
      className={`
        relative
        w-1
        bg-border
        cursor-col-resize
        transition-colors
        group
        ${isHovering || isDragging ? 'bg-primary' : 'hover:bg-primary/50'}
        ${isDragging ? 'bg-primary' : ''}
      `}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => !isDragging && setIsHovering(false)}
      style={{
        cursor: 'col-resize',
      }}
      role="separator"
      aria-label="Resize editor panel"
      aria-orientation="vertical"
    >
      {/* Visual indicator on hover */}
      {(isHovering || isDragging) && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-primary" />
      )}
    </div>
  );
};

/**
 * Hook to use resizable divider with state management and localStorage persistence
 */
export const useResizableDivider = (
  initialWidth: number = 420,
  minWidth: number = 300,
  maxWidth: number = 800,
  storageKey: string = 'editor-sidebar-width'
) => {
  const [width, setWidth] = useState<number>(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed;
        }
      }
    }
    return initialWidth;
  });

  const handleWidthChange = useCallback((newWidth: number) => {
    setWidth(newWidth);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newWidth.toString());
    }
  }, [storageKey]);

  return {
    width,
    setWidth: handleWidthChange,
  };
};

