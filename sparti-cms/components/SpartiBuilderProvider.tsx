import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback, useRef } from 'react';
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
  // Page context for saving
  pageId?: string;
  slug?: string;
  tenantId?: string;
  themeId?: string;
}

const GOSGBuilderContext = createContext<GOSGBuilderContextType | null>(null);

interface SpartiBuilderProviderProps {
  children: ReactNode;
  config?: SpartiBuilderConfig;
  components?: ComponentSchema[];
  // Page context (optional)
  pageId?: string;
  slug?: string;
  tenantId?: string;
  themeId?: string;
  // Callback when components are updated
  onComponentsChange?: (components: ComponentSchema[]) => void;
}

export const SpartiBuilderProvider: React.FC<SpartiBuilderProviderProps> = ({
  children,
  config = { enabled: true, toolbar: true, autoDetect: true },
  components = [],
  pageId,
  slug,
  tenantId,
  themeId,
  onComponentsChange
}) => {
  // CHANGED: start in edit mode
  const [isEditing, setIsEditing] = useState(true);
  const [selectedElement, setSelectedElement] = useState<SpartiElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<SpartiElement | null>(null);
  const [componentsState, setComponentsState] = useState<ComponentSchema[]>(components);
  const previousComponentsRef = useRef<ComponentSchema[]>(components);
  const onComponentsChangeRef = useRef(onComponentsChange);
  
  // Keep ref updated
  useEffect(() => {
    onComponentsChangeRef.current = onComponentsChange;
  }, [onComponentsChange]);

  // Track if we're currently processing an update to prevent loops
  const isUpdatingRef = useRef(false);
  
  // Only update components state if the array reference or content actually changed
  useEffect(() => {
    // Skip if we're currently processing an update from updateComponent
    if (isUpdatingRef.current) {
      console.log('[testing] Skipping prop sync - update in progress');
      return;
    }
    
    // Deep comparison to prevent unnecessary updates
    const currentKeys = componentsState.map(c => c.key).join(',');
    const newKeys = (components || []).map(c => c.key).join(',');
    
    // Also do a deep content comparison to see if anything actually changed
    const currentJson = JSON.stringify(componentsState);
    const newJson = JSON.stringify(components || []);
    
    // Only update if keys/length changed OR content actually changed
    if (currentKeys !== newKeys || 
        componentsState.length !== (components || []).length ||
        currentJson !== newJson) {
      console.log('[testing] Props changed - syncing state from props');
      const newComponents = components || [];
      setComponentsState(newComponents);
      // Deep clone to ensure proper comparison later
      previousComponentsRef.current = JSON.parse(JSON.stringify(newComponents));
      isPropUpdate.current = true; // Mark as prop update to skip onChange callback
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components]);

  // Notify parent when componentsState changes (but not during initial render or prop updates)
  const isInitialMount = useRef(true);
  const isPropUpdate = useRef(false);
  
  useEffect(() => {
    // Skip callback on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousComponentsRef.current = JSON.parse(JSON.stringify(componentsState)); // Deep clone
      return;
    }
    
    // Skip callback if this was triggered by a prop update (not user interaction)
    if (isPropUpdate.current) {
      isPropUpdate.current = false;
      previousComponentsRef.current = JSON.parse(JSON.stringify(componentsState)); // Deep clone
      return;
    }
    
    // Check for structural changes (keys/length) - fast check
    const currentKeys = componentsState.map(c => c.key).join(',');
    const previousKeys = previousComponentsRef.current.map(c => c.key).join(',');
    const structureChanged = currentKeys !== previousKeys || componentsState.length !== previousComponentsRef.current.length;
    
    // Check for content changes - deep comparison
    // This detects changes like button text, image src, etc. even when keys stay the same
    const currentJson = JSON.stringify(componentsState);
    const previousJson = JSON.stringify(previousComponentsRef.current);
    const contentChanged = currentJson !== previousJson;
    
    console.log('[testing] Components state change detected:', { 
      structureChanged, 
      contentChanged,
      currentLength: componentsState.length,
      previousLength: previousComponentsRef.current.length,
      currentKeys,
      previousKeys
    });
    
    // This useEffect is now a backup - updateComponent calls onComponentsChange directly
    // But we still check here in case componentsState changes from other sources
    const shouldNotify = structureChanged || contentChanged;
    
    // Update previous ref with deep clone
    previousComponentsRef.current = JSON.parse(JSON.stringify(componentsState));
    
    // Only call callback if change detected AND it wasn't from updateComponent
    // (updateComponent already called it directly)
    if (shouldNotify) {
      console.log('[testing] Components changed via useEffect - calling onComponentsChange:', { structureChanged, contentChanged });
      // Use setTimeout to ensure this runs after render
      const timeoutId = setTimeout(() => {
        if (onComponentsChangeRef.current) {
          console.log('[testing] useEffect calling onComponentsChange with', componentsState.length, 'components');
          // Deep clone again to ensure parent gets a fresh copy
          const componentsToNotify = JSON.parse(JSON.stringify(componentsState));
          onComponentsChangeRef.current(componentsToNotify);
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    } else {
      console.log('[testing] No change detected in useEffect - this is normal if updateComponent already notified');
    }
  }, [componentsState]);
  
  // Mark when props update components
  useEffect(() => {
    isPropUpdate.current = true;
  }, [components]);

  // NEW: keep body class synced with isEditing (since we start in edit mode)
  useEffect(() => {
    if (isEditing) {
      document.body.classList.add('sparti-editing');
    } else {
      document.body.classList.remove('sparti-editing');
    }
    return () => {
      document.body.classList.remove('sparti-editing');
    };
  }, [isEditing]);

  const enterEditMode = () => {
    setIsEditing(true);
    document.body.classList.add('sparti-editing');
  };

  const exitEditMode = () => {
    // NO-OP: do not allow leaving edit mode
    // Optionally clear selections without toggling mode
    setSelectedElement(null);
    setHoveredElement(null);
    // Keep body class since edit mode stays on
    document.body.classList.add('sparti-editing');
  };

  const selectElement = useCallback((element: SpartiElement | null) => {
    setSelectedElement(element);
  }, []);

  const hoverElement = useCallback((element: SpartiElement | null) => {
    setHoveredElement(element);
  }, []);

  const updateComponent = useCallback((index: number, updated: ComponentSchema) => {
    // Prevent infinite loops - if we're already processing an update, skip
    if (isUpdatingRef.current) {
      console.log('[testing] updateComponent - already updating, skipping to prevent loop');
      return;
    }
    
    console.log('[testing] updateComponent called:', { index, updatedKey: updated.key, updatedType: updated.type });
    
    // Mark that we're processing an update
    isUpdatingRef.current = true;
    
    // Update state AND immediately notify parent - don't rely on useEffect
    setComponentsState(prev => {
      // Check if this update actually changes anything
      const currentComponent = prev[index];
      if (currentComponent) {
        const currentJson = JSON.stringify(currentComponent);
        const updatedJson = JSON.stringify(updated);
        if (currentJson === updatedJson) {
          console.log('[testing] updateComponent - no actual change detected, skipping');
          isUpdatingRef.current = false;
          return prev; // No change, return previous state
        }
      }
      
      // Create a new array with the updated component
      // Deep clone ALL components to ensure completely new references
      const next = prev.map((c, i) => {
        if (i === index) {
          // Deep clone the updated component
          return JSON.parse(JSON.stringify(updated));
        } else {
          // Deep clone unchanged components too to ensure new array reference
          return JSON.parse(JSON.stringify(c));
        }
      });
      
      console.log('[testing] updateComponent - new state:', { 
        prevLength: prev.length, 
        nextLength: next.length,
        updatedIndex: index,
        updatedComponentKey: updated.key
      });
      
      // IMMEDIATELY notify parent with the new state - don't wait for useEffect
      // This ensures every update is captured, even single changes
      if (onComponentsChangeRef.current) {
        // Deep clone to ensure parent gets a fresh copy
        const componentsToNotify = JSON.parse(JSON.stringify(next));
        console.log('[testing] updateComponent - immediately calling onComponentsChange');
        // Use setTimeout to avoid calling during render
        setTimeout(() => {
          onComponentsChangeRef.current?.(componentsToNotify);
          // Reset the flag after a short delay to allow state to settle
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }, 0);
      } else {
        // Reset immediately if no callback
        isUpdatingRef.current = false;
      }
      
      // Update previousComponentsRef immediately so next comparison is accurate
      previousComponentsRef.current = JSON.parse(JSON.stringify(next));
      
      return next;
    });
  }, []);

  const enterEditModeCallback = useCallback(() => {
    setIsEditing(true);
    document.body.classList.add('sparti-editing');
  }, []);

  const exitEditModeCallback = useCallback(() => {
    // NO-OP: do not allow leaving edit mode
    // Optionally clear selections without toggling mode
    setSelectedElement(null);
    setHoveredElement(null);
    // Keep body class since edit mode stays on
    document.body.classList.add('sparti-editing');
  }, []);

  const setComponentsCallback = useCallback((next: ComponentSchema[]) => {
    setComponentsState(next);
    // Update will be notified via useEffect
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: GOSGBuilderContextType = useMemo(() => ({
    config,
    isEditing,
    selectedElement,
    hoveredElement,
    enterEditMode: enterEditModeCallback,
    exitEditMode: exitEditModeCallback,
    selectElement,
    hoverElement,
    components: componentsState,
    setComponents: setComponentsCallback,
    updateComponent,
    pageId,
    slug,
    tenantId,
    themeId,
  }), [
    config,
    isEditing,
    selectedElement,
    hoveredElement,
    enterEditModeCallback,
    exitEditModeCallback,
    selectElement,
    hoverElement,
    componentsState,
    setComponentsCallback,
    updateComponent,
    pageId,
    slug,
    tenantId,
    themeId,
  ]);

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