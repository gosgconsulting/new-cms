import { useCallback } from 'react';
import { ComponentSchema } from '../types/schema';
import { isValidComponentsArray } from '../utils/componentHelpers';

interface UseComponentOperationsOptions {
  components: ComponentSchema[];
  setComponents: (components: ComponentSchema[]) => void;
  selectedComponentIndex: number | null;
  setSelectedComponentIndex: (index: number | null) => void;
}

export const useComponentOperations = ({
  components,
  setComponents,
  selectedComponentIndex,
  setSelectedComponentIndex,
}: UseComponentOperationsOptions) => {
  const removeComponent = useCallback((index: number) => {
    if (!isValidComponentsArray(components)) {
      console.error('[testing] Cannot remove component: components is not an array');
      return;
    }
    const newComponents = components.filter((_, i) => i !== index);
    setComponents(newComponents);
    
    if (selectedComponentIndex === index) {
      setSelectedComponentIndex(null);
    } else if (selectedComponentIndex !== null && selectedComponentIndex > index) {
      setSelectedComponentIndex(selectedComponentIndex - 1);
    }
  }, [components, setComponents, selectedComponentIndex, setSelectedComponentIndex]);

  const updateComponent = useCallback((index: number, updatedComponent: ComponentSchema) => {
    if (!isValidComponentsArray(components)) {
      console.error('[testing] Cannot update component: components is not an array');
      return;
    }
    const newComponents = [...components];
    newComponents[index] = updatedComponent;
    setComponents(newComponents);
  }, [components, setComponents]);

  return {
    removeComponent,
    updateComponent,
  };
};

