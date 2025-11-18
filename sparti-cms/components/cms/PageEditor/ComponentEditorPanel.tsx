import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import ComponentEditor from '../ComponentEditor';
import { ComponentSchema } from '../../../types/schema';
import { getComponentTypeDisplayName } from '../../../utils/componentHelpers';
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
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Component not found or components data is invalid</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Cannot load component editor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {getComponentTypeDisplayName(component.type)} Settings
        </CardTitle>
        <CardDescription>
          Configure the properties of this component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ComponentEditor
          key={`component-${componentIndex}`}
          schema={component}
          onChange={(updatedComponent) => {
            onUpdate(componentIndex, updatedComponent);
          }}
        />
      </CardContent>
    </Card>
  );
};

