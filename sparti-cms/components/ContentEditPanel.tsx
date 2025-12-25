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

  // Simplified header: just the section name (no icon, no "Section Editor" title)
  const sectionLabel = selectedComponent
    ? (selectedComponent.type || selectedComponent.name || selectedComponent.key || 'Component')
    : 'Select a section';

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="sparti-edit-panel-header">
        <div className="sparti-edit-header-content">
          <div>
            <h3>{sectionLabel}</h3>
          </div>
        </div>
        <div className="sparti-edit-panel-actions">
          {/* Clear selection only (panel remains visible) */}
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

      <div
        id="sparti-editor-scroll"
        className="sparti-edit-panel-content flex-1 overflow-y-auto"
        onWheel={(e) => {
          // Prevent scroll from bubbling to the page viewer
          e.stopPropagation();
        }}
        onClickCapture={(e) => {
          // Try to detect accordion trigger clicks and scroll opened item to top
          const container = document.getElementById('sparti-editor-scroll');
          if (!container) return;

          const target = e.target as HTMLElement | null;
          if (!target) return;

          // Heuristics to find an accordion item root and its content:
          // - shadcn accordions structure: [data-state="open"] on item or content/trigger
          // - Look for nearest item that becomes open after click
          // Defer measurement to next frame to let open state apply
          requestAnimationFrame(() => {
            // Find any open accordion content within the container that contains the click target
            // Priority: the nearest opened item to the click target
            const possibleItem = target.closest('[data-state="open"], [aria-expanded="true"]') as HTMLElement | null;

            // If none based on target, pick the first newly opened item in container
            const opened =
              possibleItem ||
              (container.querySelector('.accordion-item[data-state="open"]') as HTMLElement | null) ||
              (container.querySelector('[data-state="open"]') as HTMLElement | null) ||
              (container.querySelector('[aria-expanded="true"]') as HTMLElement | null);

            if (!opened) return;

            // Determine the element we want to align to the top: prefer the item's header/trigger; fallback to the item itself
            let alignEl: HTMLElement | null = null;

            // Common shadcn selectors
            alignEl =
              (opened.querySelector?.('[data-radix-collection-item]') as HTMLElement | null) ||
              (opened.querySelector?.('[data-state="open"][role="button"]') as HTMLElement | null) ||
              (opened.querySelector?.('[data-accordion-trigger]') as HTMLElement | null) ||
              (opened.querySelector?.('[aria-expanded="true"]') as HTMLElement | null) ||
              (opened.closest?.('.accordion-item') as HTMLElement | null) ||
              opened;

            if (!alignEl) return;

            // Compute positions relative to the scroll container
            const containerRect = container.getBoundingClientRect();
            const itemRect = alignEl.getBoundingClientRect();

            // Current scrollTop + offset from container top to item top
            const delta = itemRect.top - containerRect.top;

            // Scroll so that the alignEl is at the very top of the scroll container
            container.scrollTo({
              top: container.scrollTop + delta,
              behavior: 'smooth',
            });
          });
        }}
      >
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

      {/* Floating Save button at bottom-right of the sidebar */}
      <div className="absolute bottom-4 right-4">
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
      </div>
    </div>
  );
};