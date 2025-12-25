import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useSpartiBuilder } from './SpartiBuilderProvider';
import { SpartiElement } from '../types';
import { UniversalElementDetector } from '../core/universal-detector';

interface ElementSelectorProps {
  children: ReactNode;
}

export const ElementSelector: React.FC<ElementSelectorProps> = ({ children }) => {
  const { isEditing, selectElement, hoverElement, selectedElement, components } = useSpartiBuilder();
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasRenderedSections, setHasRenderedSections] = useState<boolean | null>(null);

  const createSpartiElement = (element: HTMLElement): SpartiElement => {
    const data = UniversalElementDetector.extractElementData(element);
    return { element, data };
  };

  const resolveSectionRoot = (target: HTMLElement | null): HTMLElement | null => {
    if (!target) return null;
    const nearestEditable = UniversalElementDetector.findNearestEditableElement(target);
    if (!nearestEditable) return null;
    const sectionRoot = nearestEditable.closest('[data-sparti-component-index]') as HTMLElement | null;
    return sectionRoot || nearestEditable;
  };

  const handleElementClick = (e: MouseEvent) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    const effectiveElement = resolveSectionRoot(target);

    if (!effectiveElement || !UniversalElementDetector.isEditableElement(effectiveElement)) {
      return;
    }

    const spartiElement = createSpartiElement(effectiveElement);
    selectElement(spartiElement);

    // Ensure any hover is removed immediately after selection
    hoverElement(null);
    document.body.classList.add('sparti-editor-open');
  };

  const handleElementHover = (e: MouseEvent) => {
    if (!isEditing) return;

    const target = e.target as HTMLElement;
    const effectiveElement = resolveSectionRoot(target);

    if (!effectiveElement || !UniversalElementDetector.isEditableElement(effectiveElement)) {
      hoverElement(null);
      return;
    }

    const spartiElement = createSpartiElement(effectiveElement);
    hoverElement(spartiElement);
  };

  const handleElementLeave = () => {
    if (!isEditing) return;
    hoverElement(null);
  };

  useEffect(() => {
    if (!isEditing) return;

    const targetElement = contentRef.current || document.body;

    // Always track clicks, mouseover, and mouseleave—even when a section is selected
    targetElement.addEventListener('click', handleElementClick, true);
    targetElement.addEventListener('mouseover', handleElementHover, true);
    targetElement.addEventListener('mouseleave', handleElementLeave, true);

    document.body.classList.add('sparti-editing');

    return () => {
      targetElement.removeEventListener('click', handleElementClick, true);
      targetElement.removeEventListener('mouseover', handleElementHover, true);
      targetElement.removeEventListener('mouseleave', handleElementLeave, true);
      document.body.classList.remove('sparti-editing');
      document.body.classList.remove('sparti-editor-open');
    };
  }, [isEditing, selectedElement]);

  // Detect whether real preview sections exist inside contentRef
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const check = () => {
      const has = !!el.querySelector('[data-sparti-component-index]');
      setHasRenderedSections(has);
    };

    check();

    const observer = new MutationObserver(() => check());
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Fallback: build a generic preview from JSON when no visual preview exists
  const renderFallbackPreview = () => {
    if (!Array.isArray(components) || components.length === 0) return null;

    // Helper to collect text strings and image sources from a component's items
    const collectContent = (items: any[]): { texts: string[]; images: { src: string; alt?: string; title?: string }[] } => {
      const texts: string[] = [];
      const images: { src: string; alt?: string; title?: string }[] = [];

      const walk = (node: any) => {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'image' && typeof node.src === 'string' && node.src) {
          images.push({ src: node.src, alt: node.alt, title: node.title });
        }
        if (typeof node.content === 'string' && node.content.trim()) {
          texts.push(node.content.trim());
        }
        if (Array.isArray(node.items)) {
          node.items.forEach(walk);
        }
        // Explore nested structures
        Object.values(node).forEach((v: any) => {
          if (v && typeof v === 'object') {
            if (Array.isArray(v)) v.forEach(walk);
            else walk(v);
          }
        });
      };

      items.forEach(walk);
      return { texts, images };
    };

    const labelFor = (comp: any, idx: number) => {
      const raw = String(comp?.type || comp?.name || comp?.key || `Section ${idx + 1}`);
      return raw;
    };

    return (
      <div className="p-6 space-y-6">
        {components.map((comp: any, idx: number) => {
          const { texts, images } = collectContent(Array.isArray(comp?.items) ? comp.items : []);
          const label = labelFor(comp, idx);

          return (
            <div
              key={`fallback-${idx}`}
              data-sparti-component-index={idx}
              data-sparti-section={label.toLowerCase()}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{label}</h3>
                <span className="text-[11px] text-gray-500">JSON preview</span>
              </div>

              {images.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {images.slice(0, 6).map((img, i) => (
                    <div key={i} className="rounded-md overflow-hidden border bg-gray-50">
                      <img
                        src={img.src}
                        alt={img.alt || img.title || `image-${i + 1}`}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      {(img.title || img.alt) && (
                        <div className="p-2">
                          <p className="text-xs text-gray-600 truncate">{img.title || img.alt}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {texts.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {texts.slice(0, 3).map((t, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      {t}
                    </p>
                  ))}
                </div>
              ) : !images.length ? (
                <p className="text-xs text-gray-500">No textual or image content in this section.</p>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={contentRef} className="sparti-content">
      {children}
      {/* Only render fallback after we've checked for real sections and found none */}
      {hasRenderedSections === false ? renderFallbackPreview() : null}
    </div>
  );
};