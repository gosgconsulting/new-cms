import React from 'react';
import { componentRegistry, ComponentType } from './registry';

interface ComponentSchema {
  key: string;
  type: string;
  name?: string;
  items?: any[];
  wrapper?: {
    className?: string;
  };
}

interface DynamicPageRendererProps {
  schema: {
    components: ComponentSchema[] | any;
  };
  onContactClick?: () => void; // Keep for backward compatibility
  onPopupOpen?: (popupName: string) => void; // New prop for popup handling
}

/**
 * DynamicPageRenderer
 * 
 * Renders components dynamically based on the provided schema
 * Each component in the schema is mapped to a real React component from the registry
 */
export const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({ schema, onContactClick, onPopupOpen }) => {
  if (!schema?.components) {
    console.warn('[testing] No components found in schema');
    return null;
  }
  
  // Handle case where components might not be an array
  if (!Array.isArray(schema.components)) {
    console.error('[testing] Components is not an array:', typeof schema.components);
    // Try to convert to array if it's a string
    if (typeof schema.components === 'string') {
      try {
        schema.components = JSON.parse(schema.components);
        console.log('[testing] Successfully parsed components string to array');
      } catch (e) {
        console.error('[testing] Failed to parse components string:', e);
        return (
          <div className="p-4 bg-red-100 text-red-800 rounded">
            Error: Components data is not in the expected format
          </div>
        );
      }
    } else {
      return (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          Error: Components data is not in the expected format
        </div>
      );
    }
  }
  
  console.log('[testing] Rendering components:', schema.components.length);
  
  return (
    <>
      {schema.components.map((component: ComponentSchema, index: number) => {
        // Debug component
        console.log(`[testing] Component ${index}:`, component.key, component.type);
        
        // Get the component from the registry based on its type
        const Component = componentRegistry[component.type as ComponentType];
        
        if (!Component) {
          console.warn(`[testing] Component ${component.type} not found in registry`);
          return (
            <div key={`unknown-${index}`} className="p-2 bg-yellow-100 text-yellow-800 rounded mb-2">
              Unknown component type: {component.type}
            </div>
          );
        }
        
        // Default props: popup handlers, contact, and items (for components that expect items)
        let componentProps: any = {
          ...(onContactClick && { onContactClick }), // Backward compatibility
          ...(onPopupOpen && { onPopupOpen }), // New popup handler
        };

        // Default: pass items for components that accept schema-based rendering
        componentProps = { ...componentProps, items: component.items };

        // Relax component type to accept heterogeneous props across registry
        const ComponentToRender = Component as React.ComponentType<any>;

        return (
          <React.Fragment key={`${component.key}-${index}`}>
            {component.wrapper?.className ? (
              <div className={component.wrapper.className}>
                <ComponentToRender {...componentProps} />
              </div>
            ) : (
              <ComponentToRender {...componentProps} />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default DynamicPageRenderer;

