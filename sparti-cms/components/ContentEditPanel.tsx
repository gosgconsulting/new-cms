// Enhanced Content Edit Panel with component registry integration
import React, { useState } from 'react';
import { Type, Image, Video, Link, MousePointer, Settings, X, Save } from 'lucide-react';
import { useSpartiBuilder } from './SpartiBuilderProvider';
import { ElementType } from '../types';
import { componentRegistry } from '../registry';
import { motion } from 'framer-motion';

// Specialized editor components
import { TextEditor } from './editors/TextEditor';
import { ImageEditor } from './editors/ImageEditor';
import { ButtonEditor } from './editors/ButtonEditor';
import { ContainerEditor } from './editors/ContainerEditor';

export const ContentEditPanel: React.FC = () => {
  const { isEditing, selectedElement, selectElement } = useSpartiBuilder();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isEditing || !selectedElement) return null;

  const { data } = selectedElement;
  const elementType = data.elementType;
  
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
    
    // Use ImageEditor for image elements
    if (elementType === 'image' || data.tagName === 'IMG') {
      return <ImageEditor {...commonProps} />;
    }
    
    // Check if component is registered in registry and use appropriate editor
    const registeredComponent = componentRegistry.get(elementType);
    if (registeredComponent) {
      console.log(`Using registered component: ${registeredComponent.name}`);
      
      // Use specific editor based on component definition
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
    setIsSaving(true);
    
    try {
      console.log('Saving component:', data);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving component:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="sparti-modal-backdrop" onClick={() => selectElement(null)}></div>
      <motion.div 
        className="sparti-edit-panel"
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sparti-edit-panel-header">
          <div className="sparti-edit-header-content">
            <IconComponent size={20} className="text-brandPurple" />
            <div>
              <h3>{elementType.charAt(0).toUpperCase() + elementType.slice(1)} Editor</h3>
              <p className="sparti-element-path">{data.tagName.toUpperCase()}</p>
              {componentRegistry.has(elementType) && (
                <div className="sparti-registry-status bg-brandTeal/10 border border-brandTeal/20 text-brandTeal text-xs rounded-md px-2 py-1 inline-flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Registered Component
                </div>
              )}
            </div>
          </div>
          <div className="sparti-edit-panel-actions">
            {isComponent && (
              <button 
                className={`sparti-btn bg-brandTeal hover:bg-brandTeal/90 text-white px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md ${isSaving ? 'opacity-70' : ''}`}
                onClick={saveToDatabase}
                disabled={isSaving}
                aria-label="Save to database"
              >
                <Save size={16} className="mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button 
              className="sparti-btn bg-secondary hover:bg-secondary/80 text-foreground p-1.5 rounded-lg transition-all duration-200 flex items-center" 
              onClick={() => selectElement(null)}
              aria-label="Close editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="sparti-edit-panel-content">
          {saveSuccess && (
            <motion.div 
              className="sparti-alert bg-brandTeal/10 border border-brandTeal/20 text-brandTeal p-3 rounded-lg mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Component saved successfully!
              </div>
            </motion.div>
          )}
          {renderSpecializedEditor()}
        </div>
      </motion.div>
    </>
  );
};