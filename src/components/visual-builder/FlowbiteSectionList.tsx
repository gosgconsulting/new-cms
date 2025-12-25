"use client";

import React, { memo, useMemo, useCallback } from "react";
import { useSpartiBuilder } from "../../../sparti-cms/components/SpartiBuilderProvider";
import { GripVertical } from "lucide-react";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";

const labelFor = (comp: ComponentSchema | null, idx: number): string => {
  if (!comp) return `Section ${idx + 1}`;
  const t = String(comp?.type || comp?.name || comp?.key || `Section ${idx + 1}`);
  // Normalize like earlier renderer
  return t.replace(/section/gi, "").trim() || `Section ${idx + 1}`;
};

interface FlowbiteSectionItemProps {
  component: ComponentSchema;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

const FlowbiteSectionItem = memo<FlowbiteSectionItemProps>(({
  component,
  index,
  isSelected,
  onSelect,
}) => {
  const handleClick = useCallback(() => {
    onSelect(index);
  }, [index, onSelect]);

  const label = useMemo(() => labelFor(component, index), [component?.key, component?.type, component?.name, index]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left px-4 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-50 border-blue-200 text-blue-700' 
          : 'hover:bg-gray-50 border-gray-200 text-gray-700'
      }`}
    >
      <div className="flex items-center gap-2 w-full">
        <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span className="truncate text-sm font-medium">{label}</span>
      </div>
    </button>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.index === nextProps.index &&
    prevProps.component?.key === nextProps.component?.key &&
    prevProps.component?.type === nextProps.component?.type
  );
});

FlowbiteSectionItem.displayName = 'FlowbiteSectionItem';

const FlowbiteSectionList: React.FC = () => {
  const { components, selectElement, isEditing, selectedElement } = useSpartiBuilder();

  // Memoize the selected index to prevent unnecessary re-renders
  const selectedIndex = useMemo(() => {
    if (!selectedElement?.element) return null;
    const sectionEl = selectedElement.element.closest?.('[data-sparti-component-index]') as HTMLElement | null;
    const compIdxAttr = sectionEl?.getAttribute('data-sparti-component-index') || '';
    const idx = compIdxAttr ? parseInt(compIdxAttr, 10) : NaN;
    return Number.isFinite(idx) ? idx : null;
  }, [selectedElement]);

  const handleSelect = useCallback((idx: number) => {
    const el = document.querySelector(
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
    const comp = Array.isArray(components) ? (components as ComponentSchema[])[idx] : null;
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
  }, [components, selectElement]);

  // Memoize components array to prevent unnecessary re-renders
  const componentsArray = useMemo(() => {
    return Array.isArray(components) ? components : [];
  }, [components]);

  if (!isEditing) return null;

  return (
    <aside className="sticky top-0 h-screen w-64 min-w-64 max-w-64 border-r bg-white dark:bg-gray-800 p-4 overflow-y-auto shadow-sm">
      <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Sections</h3>
      {componentsArray.length > 0 ? (
        <div className="space-y-1">
          {componentsArray.map((component, idx) => (
            <FlowbiteSectionItem
              key={component.key || `section-${idx}`}
              component={component}
              index={idx}
              isSelected={selectedIndex === idx}
              onSelect={handleSelect}
            />
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

export default memo(FlowbiteSectionList);

