"use client";

import React, { memo, useMemo, useCallback, useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import { useSpartiBuilder } from "../../../sparti-cms/components/SpartiBuilderProvider";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";

interface ThemeSectionListProps {
  components: ComponentSchema[];
  containerRef?: React.RefObject<HTMLDivElement>;
}

const labelFor = (comp: ComponentSchema | null, idx: number): string => {
  if (!comp) return `Section ${idx + 1}`;
  const t = String(comp?.type || comp?.name || comp?.key || `Section ${idx + 1}`);
  // Normalize like FlowbiteSectionList
  return t.replace(/section/gi, "").trim() || `Section ${idx + 1}`;
};

const ThemeSectionList: React.FC<ThemeSectionListProps> = ({ components, containerRef }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { selectElement, selectedElement } = useSpartiBuilder();

  // Use components from props (JSON schema)
  const componentsArray = useMemo(() => {
    return Array.isArray(components) ? components : [];
  }, [components]);

  // Update selected index based on builder's selected element
  useEffect(() => {
    if (selectedElement?.element) {
      const sectionEl = selectedElement.element.closest?.('[data-sparti-component-index]') as HTMLElement | null;
      const compIdxAttr = sectionEl?.getAttribute('data-sparti-component-index') || '';
      const idx = compIdxAttr ? parseInt(compIdxAttr, 10) : NaN;
      if (Number.isFinite(idx)) {
        setSelectedIndex(idx);
      } else {
        setSelectedIndex(null);
      }
    } else {
      setSelectedIndex(null);
    }
  }, [selectedElement]);

  const handleSelect = useCallback((idx: number) => {
    // Try to find element in theme DOM by data attribute
    const el = containerRef?.current?.querySelector(
      `[data-sparti-component-index="${idx}"]`
    ) as HTMLElement | null;

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      selectElement({ element: el, data: { tagName: el.tagName.toLowerCase() } } as any);
      return;
    }

    // Fallback: if preview element doesn't exist, create a stub element with the right data attributes
    const stub = document.createElement('div');
    stub.setAttribute('data-sparti-component-index', String(idx));
    const comp = componentsArray[idx];
    const label = comp ? labelFor(comp, idx) : `Section ${idx + 1}`;
    stub.setAttribute('data-sparti-section', label.toLowerCase());

    selectElement({
      element: stub,
      data: {
        tagName: 'div',
        elementType: 'container',
        attributes: {
          'data-sparti-component-index': String(idx),
          'data-sparti-section': label.toLowerCase(),
        },
      },
    } as any);
  }, [componentsArray, selectElement, containerRef]);

  return (
    <aside className="sticky top-0 h-screen w-64 min-w-64 max-w-64 border-r bg-white dark:bg-gray-800 p-4 overflow-y-auto shadow-sm">
      <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Sections</h3>
      {componentsArray.length > 0 ? (
        <div className="space-y-1">
          {componentsArray.map((component, idx) => (
            <button
              key={component.key || `section-${idx}`}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedIndex === idx
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'hover:bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate text-sm font-medium">{labelFor(component, idx)}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-4 text-center">
          No sections available
        </div>
      )}
    </aside>
  );
};

export default memo(ThemeSectionList);

