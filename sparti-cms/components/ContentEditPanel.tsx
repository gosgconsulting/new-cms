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
import { Loader2 } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../src/utils/toast-utils';
import api from '../utils/api';

// Helper: strip tags from any string
const stripTags = (s: any) => {
  if (typeof s !== 'string') return s;
  return s.replace(/<[^>]*>/g, '');
};

// Deep sanitize: remove HTML from any textual fields
const sanitizeComponentsPlainText = (components: ComponentSchema[]) => {
  const sanitizeValue = (val: any) => {
    if (typeof val === 'string') return stripTags(val);
    if (Array.isArray(val)) return val.map(sanitizeValue);
    if (val && typeof val === 'object') {
      const out: Record<string, any> = {};
      Object.entries(val).forEach(([k, v]) => {
        // Preserve URLs/paths for common link/image fields
        const isUrlField = ['src', 'href', 'link', 'url', 'image'].includes(k.toLowerCase());
        out[k] = isUrlField ? v : sanitizeValue(v);
      });
      return out;
    }
    return val;
  };

  return components.map((comp) => sanitizeValue(comp));
};

export const ContentEditPanel: React.FC = () => {
  const { isEditing, selectedElement, selectElement, components, updateComponent, pageId, slug, tenantId, exitEditMode } = useSpartiBuilder();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { components: dbComponents, status, error } = useDatabase();
  const [savingLayout, setSavingLayout] = useState(false);
  
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

  // Save current context components to DB layout
  const handleSaveLayout = async () => {
    if (!Array.isArray(components)) return;
    try {
      setSavingLayout(true);
      const effectiveTenantId = tenantId || 'tenant-gosg';
      let targetPageId = pageId;

      if (!targetPageId) {
        if (!slug) {
          showErrorToast('Cannot determine page context to save.');
          setSavingLayout(false);
          return;
        }
        const encodedSlug = encodeURIComponent(slug);
        const ctxRes = await api.get(`/api/ai-assistant/page-context?slug=${encodedSlug}&tenantId=${effectiveTenantId}`);
        const ctxData = await ctxRes.json();
        if (!ctxData.success || !ctxData.pageContext?.pageId) {
          showErrorToast('Page not found for saving.');
          setSavingLayout(false);
          return;
        }
        targetPageId = String(ctxData.pageContext.pageId);
      }

      // SANITIZE before persisting: remove any HTML tags from text fields
      const sanitizedComponents = sanitizeComponentsPlainText(components);

      const res = await api.put(`/api/pages/${targetPageId}/layout`, {
        layout_json: { components: sanitizedComponents },
        tenantId: effectiveTenantId
      });
      const json = await res.json();
      if (json && json.success !== false) {
        showSuccessToast('Layout saved');
        // Exit edit mode and close
        selectElement(null);
        exitEditMode();
      } else {
        showErrorToast(json?.message || 'Failed to save layout');
      }
    } catch (e: any) {
      showErrorToast(e?.message || 'Failed to save layout');
      console.error('[visual-editor] Save layout error:', e);
    } finally {
      setSavingLayout(false);
    }
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
      <div className="sparti-modal-backdrop sparti-ui" onClick={() => selectElement(null)}></div>
      <div className="sparti-edit-panel sparti-ui">
        <div className="sparti-edit-panel-header">
          <div className="sparti-edit-header-content">
            {(() => {
              const IconComponent = getEditorIcon(elementType);
              return <IconComponent size={20} />;
            })()}
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
            <button
              className={`sparti-btn sparti-btn-primary ${savingLayout ? 'sparti-btn-loading' : ''}`}
              onClick={handleSaveLayout}
              disabled={savingLayout}
              aria-label="Save layout"
              title="Save page layout to database"
            >
              {savingLayout ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {savingLayout ? 'Saving...' : 'Save'}
            </button>
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