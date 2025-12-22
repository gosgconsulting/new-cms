import React from 'react';
import ComponentEditor from '../ComponentEditor';
import { ComponentSchema } from '../../../types/schema';
import { isValidComponentsArray } from '../../../utils/componentHelpers';

interface ComponentEditorPanelProps {
  component: ComponentSchema | null;
  componentIndex: number | null;
  components: unknown;
  onUpdate: (index: number, updatedComponent: ComponentSchema) => void;
}

export const ComponentEditorPanel: React.FC<ComponentEditorPanelProps> = ({
  component,
  componentIndex,
  components,
  onUpdate,
}) => {
  if (componentIndex === null) {
    return null;
  }

  if (!isValidComponentsArray(components) || !component) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Cannot load component editor</p>
      </div>
    );
  }

  return (
    <ComponentEditor
      key={`component-${componentIndex}`}
      schema={component}
      onChange={(updatedComponent) => {
        onUpdate(componentIndex, updatedComponent);
      }}
    />
  );
};

