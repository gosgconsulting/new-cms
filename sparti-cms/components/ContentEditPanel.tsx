// Enhanced Content Edit Panel with component registry integration
import React, { useState } from 'react';
import { Type, Image, Video, Link, MousePointer, Settings, X, Save } from 'lucide-react';
import { useSpartiBuilder } from './SpartiBuilderProvider';
import { ElementType } from '../types';
import useDatabase from '../hooks/useDatabase';
import { componentRegistry } from '../registry';
import { TextEditor } from './editors/TextEditor';
import { ImageEditor } from './editors/ImageEditor';
import { ButtonEditor } from './editors/ButtonEditor';
import { ContainerEditor } from './editors/ContainerEditor';
import ComponentEditor from './cms/ComponentEditor';
import { showInfoToast } from '../../src/utils/toast-utils';
import type { ComponentSchema } from '../types/schema';

export const ContentEditPanel: React.FC = () => {
  const { isEditing, selectedElement, selectElement, components, updateComponent } = useSpartiBuilder();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { components: dbComponents, status, error } = useDatabase();
  
  // Derive loading state from useDatabase status
  const isSaving = status === 'loading';

  if (!isEditing || !selectedElement) return null;

  const { data } = selectedElement;
  const elementType = data.elementType;

  const sectionEl = selectedElement.element.closest('[data-sparti-component-index]') as HTMLElement | null;
  const compIdxAttr = sectionEl?.getAttribute('data-sparti-component-index') || '';
  const compIndex = compIdxAttr ? parseInt(compIdxAttr, 10) : NaN;
  const selectedComponent: ComponentSchema | null =
    components && Number.isFinite(compIndex) ? components[compIndex] || null : null;
  
  // Determine if this element should be saved as a component
  const isComponent = ['header', 'footer', 'sidebar', 'navigation'].includes(data.tagName);

  const getEditorIcon = (type: ElementType) => {
    const icons = {
      image: Image,
      video: Video,
      link: Link,
      button: MousePointer,
      input: Settings,
      text: Type,
      container: Settings,
      media: Image,
      unknown: Settings,
    };
    return icons[type] || Settings;
  };

  const renderSpecializedEditor = () => {
    const commonProps = { selectedElement };
    
    if (selectedComponent) {
      return (
        <div className="sparti-accordion-wrapper">
          <ComponentEditor
            schema={selectedComponent}
            onChange={(updated) => {
              if (Number.isFinite(compIndex)) {
                updateComponent(compIndex, updated);
                showInfoToast("Preview updated");
              } else {
                showInfoToast("Cannot determine section index.");
              }
            }}
          />
        </div>
      );
    }

    // Use ImageEditor for image elements
    if (elementType === 'image' || data.tagName === 'IMG') {
      return <ImageEditor {...commonProps} />;
    }
    
    // Check if component is registered in registry and use appropriate editor
    const registeredComponent = componentRegistry.get(elementType);
    if (registeredComponent) {
      switch (registeredComponent.editor) {
        case 'ImageEditor':
          return <ImageEditor {...commonProps} />;
        case 'ButtonEditor':
          return <ButtonEditor {...commonProps} />;
        case 'ContainerEditor':
          return <ContainerEditor {...commonProps} />;
        case 'TextEditor':
        default:
          return <TextEditor {...commonProps} />;
      }
    }
    
    // Fallback: use TextEditor for all unregistered element types
    return <TextEditor {...commonProps} />;
  };

  const IconComponent = getEditorIcon(elementType);

  // Save the current element to the database as a component
  const saveToDatabase = async () => {
    if (!isComponent) return;
    
    setSaveSuccess(false);
    
    try {
      // Create a component object from the selected element
      const componentData = {
        name: data.id || `${data.tagName}-${Date.now()}`,
        type: data.tagName,
        content: JSON.stringify(data),
        isPublished: true
      };
      
      // Check if component already exists
      const existingComponent = await dbComponents.getByName(componentData.name) as any;
      
      if (existingComponent && existingComponent.id) {
        // Update existing component
        await dbComponents.update(existingComponent.id, componentData);
      } else {
        // Create new component
        await dbComponents.create({ ...componentData, tenantId: 'default' });
      }
      
      setSaveSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      // Error is already handled by useDatabase hook
      console.error('Error saving component:', err);
    }
  };

  return (
    <>
      <div className="sparti-modal-backdrop" onClick={() => selectElement(null)}></div>
      <div className="sparti-edit-panel">
        <div className="sparti-edit-panel-header">
          <div className="sparti-edit-header-content">
            {(selectedComponent ? <Settings size={20} /> : (() => {
              const IconComponent = getEditorIcon(elementType);
              return <IconComponent size={20} />;
            })())}
            <div>
              <h3>{selectedComponent ? 'Section Editor' : `${elementType.charAt(0).toUpperCase() + elementType.slice(1)} Editor`}</h3>
              <p className="sparti-element-path">
                {selectedComponent ? (selectedComponent.type || selectedComponent.name || 'Component') : data.tagName.toUpperCase()}
              </p>
              {componentRegistry.has(elementType) && !selectedComponent && (
                <div className="sparti-registry-status">
                  ✓ Registered Component
                </div>
              )}
            </div>
          </div>
          <div className="sparti-edit-panel-actions">
            {isComponent && (
              <button 
                className={`sparti-btn sparti-btn-primary ${isSaving ? 'sparti-btn-loading' : ''}`}
                onClick={saveToDatabase}
                disabled={isSaving}
                aria-label="Save to database"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button 
              className="sparti-btn sparti-btn-ghost sparti-close-btn" 
              onClick={() => selectElement(null)}
              aria-label="Close editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="sparti-edit-panel-content">
          {saveSuccess && (
            <div className="sparti-alert sparti-alert-success">
              Component saved successfully!
            </div>
          )}
          {error && status === 'error' && (
            <div className="sparti-alert sparti-alert-error">
              {error}
            </div>
          )}
          {status === 'loading' && (
            <div className="sparti-alert sparti-alert-info">
              Processing your request...
            </div>
          )}
          {renderSpecializedEditor()}
        </div>
      </div>
    </>
  );
};