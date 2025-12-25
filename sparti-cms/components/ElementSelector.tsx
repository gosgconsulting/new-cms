import React, { ReactNode, useEffect, useRef, useState } from 'react';
import FlowbiteSection from '../../src/libraries/flowbite/components/FlowbiteSection';
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

  // Detect if any real preview sections exist (data-sparti-component-index rendered by a visual renderer)
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

  // Helpers to interpret JSON items
  const getText = (items: any[], key: string) => {
    const it = (items || []).find(
      (i: any) => typeof i?.key === 'string' && i.key.toLowerCase() === key.toLowerCase() && typeof i?.content === 'string'
    );
    return it?.content || '';
  };
  const getArray = (items: any[], key: string) => {
    const it = (items || []).find((i: any) => typeof i?.key === 'string' && i.key.toLowerCase() === key.toLowerCase() && i?.type === 'array');
    return Array.isArray(it?.items) ? it.items : [];
  };
  const findImagesDeep = (items: any[]): { src: string; alt?: string; title?: string }[] => {
    const imgs: { src: string; alt?: string; title?: string }[] = [];
    const walk = (n: any) => {
      if (!n || typeof n !== 'object') return;
      if (n.type === 'image' && typeof n.src === 'string' && n.src) {
        imgs.push({ src: n.src, alt: n.alt, title: n.title });
      }
      if (Array.isArray(n.items)) n.items.forEach(walk);
      Object.values(n).forEach((v: any) => {
        if (v && typeof v === 'object') {
          if (Array.isArray(v)) v.forEach(walk);
          else walk(v);
        }
      });
    };
    (items || []).forEach(walk);
    return imgs;
  };
  const normalizeType = (t?: string) => (t || '').toLowerCase();

  // Flowbite-based fallback preview that matches common schema shapes
  const renderFlowbiteFallback = () => {
    if (!Array.isArray(components) || components.length === 0) return null;
    return (
      <div className="p-6 space-y-8">
        {components.map((comp: any, idx: number) => {
          const t = normalizeType(comp?.type || comp?.name || comp?.key);
          const items = Array.isArray(comp?.items) ? comp.items : [];
          const sectionLabel = comp?.type || comp?.name || comp?.key || `Section ${idx + 1}`;

          // Hero-like
          if (t.includes('hero')) {
            const slides = getArray(items, 'slides');
            const welcomeText = getText(items, 'welcomeText') || getText(items, 'subtitle') || '';
            const heroImages = slides.length ? slides : findImagesDeep(items);
            const hero = heroImages[0];
            return (
              <section
                key={`fb-hero-${idx}`}
                data-sparti-component-index={idx}
                data-sparti-section={t}
                className="relative overflow-hidden rounded-lg border bg-white"
              >
                {hero?.src ? (
                  <div className="relative h-[40vh] min-h-[320px]">
                    <img
                      src={hero.src}
                      alt={hero.alt || hero.title || 'Hero'}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).src = '/placeholder.svg')}
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative z-10 h-full flex items-center justify-center px-6">
                      {welcomeText ? (
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
                          {welcomeText}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <FlowbiteSection title={sectionLabel}>
                    <div className="text-sm text-gray-500">No hero image found in JSON.</div>
                  </FlowbiteSection>
                )}
              </section>
            );
          }

          // Services-like grids
          if (t.includes('services')) {
            const services = getArray(items, 'services');
            const title = getText(items, 'title') || sectionLabel;
            const subtitle = getText(items, 'subtitle') || '';
            const cards = (services || [])
              .map((col: any) => (Array.isArray(col?.items) ? col.items : []))
              .map((colItems: any[]) => {
                const images = findImagesDeep(colItems);
                const img = images[0];
                const btn = (colItems || []).find((i: any) => i?.type === 'button' && typeof i?.content === 'string');
                const titleItem = (colItems || []).find((i: any) => typeof i?.title === 'string' || typeof i?.content === 'string');
                return { img, btn, title: titleItem?.title || titleItem?.content };
              });

            return (
              <FlowbiteSection key={`fb-services-${idx}`} title={title} subtitle={subtitle}>
                <div
                  data-sparti-component-index={idx}
                  data-sparti-section={t}
                  className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {cards.length ? (
                    cards.slice(0, 8).map((card, i) => (
                      <div key={i} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                        {card.img?.src ? (
                          <div className="aspect-[4/3] bg-gray-100">
                            <img
                              src={card.img.src}
                              alt={card.img.alt || card.img.title || `Service ${i + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => ((e.target as HTMLImageElement).src = '/placeholder.svg')}
                            />
                          </div>
                        ) : null}
                        <div className="p-3">
                          {card.title ? <h4 className="text-sm font-semibold">{card.title}</h4> : null}
                          {card.btn?.content ? (
                            <a href={card.btn.link || '#'} className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                              {card.btn.content}
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No services found in JSON.</div>
                  )}
                </div>
              </FlowbiteSection>
            );
          }

          // Features-like grids
          if (t.includes('features')) {
            const title = getText(items, 'title') || sectionLabel;
            const subtitle = getText(items, 'subtitle') || '';
            const features = getArray(items, 'features');
            const cards = (features || []).map((f: any) => {
              const images = findImagesDeep([f]);
              const img = images[0];
              return { img, title: f?.title, description: f?.description || f?.content };
            });
            return (
              <FlowbiteSection key={`fb-features-${idx}`} title={title} subtitle={subtitle}>
                <div
                  data-sparti-component-index={idx}
                  data-sparti-section={t}
                  className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {cards.length ? (
                    cards.slice(0, 9).map((c: any, i: number) => (
                      <div key={i} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                        {c.img?.src ? (
                          <div className="aspect-[4/3] bg-gray-100">
                            <img
                              src={c.img.src}
                              alt={c.img.alt || c.img.title || `Feature ${i + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => ((e.target as HTMLImageElement).src = '/placeholder.svg')}
                            />
                          </div>
                        ) : null}
                        <div className="p-3">
                          {c.title ? <h4 className="text-sm font-semibold">{c.title}</h4> : null}
                          {c.description ? <p className="text-xs text-gray-600">{c.description}</p> : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No features found in JSON.</div>
                  )}
                </div>
              </FlowbiteSection>
            );
          }

          // Team/Ingredients/About and unknowns -> generic FlowbiteSection with images/text
          const images = findImagesDeep(items);
          const textCandidates: string[] = [];
          const walkText = (n: any) => {
            if (!n || typeof n !== 'object') return;
            if (typeof n.content === 'string' && n.content.trim()) textCandidates.push(n.content.trim());
            if (Array.isArray(n.items)) n.items.forEach(walkText);
            Object.values(n).forEach((v: any) => {
              if (v && typeof v === 'object') {
                if (Array.isArray(v)) v.forEach(walkText);
                else walkText(v);
              }
            });
          };
          items.forEach(walkText);

          return (
            <FlowbiteSection key={`fb-generic-${idx}`} title={sectionLabel}>
              <div data-sparti-component-index={idx} data-sparti-section={t} className="space-y-3">
                {images.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {images.slice(0, 8).map((img, i) => (
                      <div key={i} className="rounded-md overflow-hidden border bg-gray-50">
                        <img
                          src={img.src}
                          alt={img.alt || img.title || `image-${i + 1}`}
                          className="w-full h-40 object-cover"
                          onError={(e) => ((e.target as HTMLImageElement).src = '/placeholder.svg')}
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
                {textCandidates.length > 0 ? (
                  <div className="space-y-2">
                    {textCandidates.slice(0, 5).map((t, i) => (
                      <p key={i} className="text-sm text-gray-700">
                        {t}
                      </p>
                    ))}
                  </div>
                ) : !images.length ? (
                  <p className="text-xs text-gray-500">No textual or image content in this section.</p>
                ) : null}
              </div>
            </FlowbiteSection>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={contentRef} className="sparti-content">
      {children}
      {/* Only render Flowbite-based fallback after we've checked for real sections and found none */}
      {hasRenderedSections === false ? renderFlowbiteFallback() : null}
    </div>
  );
};