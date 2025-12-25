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
  const { isEditing, selectedElement, selectElement, components, updateComponent, pageId, slug, tenantId } = useSpartiBuilder();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { components: dbComponents, status, error } = useDatabase();
  const [savingLayout, setSavingLayout] = useState(false);
  const isSaving = status === 'loading';

  // Always render as sidebar while in edit mode
  if (!isEditing) return null;

  // Resolve selected component index
  const sectionEl = selectedElement?.element?.closest?.('[data-sparti-component-index]') as HTMLElement | null;
  const compIdxAttr = sectionEl?.getAttribute('data-sparti-component-index') || '';
  const compIndex = compIdxAttr ? parseInt(compIdxAttr, 10) : NaN;
  const selectedComponent: ComponentSchema | null =
    components && Number.isFinite(compIndex) ? components[compIndex] || null : null;

  const elementType = selectedElement?.data?.elementType || 'container';

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

      // If sanitize helper exists, use it; otherwise, save current components
      const payloadComponents = components;
      const res = await api.put(`/api/pages/${targetPageId}/layout`, {
        layout_json: { components: payloadComponents },
        tenantId: effectiveTenantId
      });
      const json = await res.json();
      if (json && json.success !== false) {
        showSuccessToast('Layout saved');
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
    if (selectedComponent) {
      return (
        <div className="sparti-accordion-wrapper">
          <ComponentEditor
            schema={selectedComponent}
            onChange={(updated) => {
              if (Number.isFinite(compIndex)) {
                updateComponent(compIndex, updated);
                showInfoToast("Preview updated");
              }
            }}
          />
        </div>
      );
    }
    // Placeholder when no section selected
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p className="text-sm">Select a section to edit from the list or by clicking the preview.</p>
      </div>
    );
  };

  const IconComponent = getEditorIcon(elementType as ElementType);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="sparti-edit-panel-header">
        <div className="sparti-edit-header-content">
          <IconComponent size={20} />
          <div>
            <h3>Section Editor</h3>
            <p className="sparti-element-path">
              {selectedComponent ? (selectedComponent.type || selectedComponent.name || 'Component') : 'No section selected'}
            </p>
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
          {/* Close selection only (keep panel visible) */}
          <button 
            className="sparti-btn sparti-btn-ghost sparti-close-btn" 
            onClick={() => selectElement(null)}
            aria-label="Clear selection"
            title="Clear selection"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="sparti-edit-panel-content flex-1 overflow-y-auto">
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
  );
};