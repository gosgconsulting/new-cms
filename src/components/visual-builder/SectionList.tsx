"use client";

import React from "react";
import { useSpartiBuilder } from "../../../sparti-cms/components/SpartiBuilderProvider";
import { GripVertical } from "lucide-react";

const labelFor = (comp: any, idx: number) => {
  const t = String(comp?.type || comp?.name || comp?.key || `Section ${idx + 1}`);
  // Normalize like earlier renderer
  return t.replace(/section/gi, "").trim() || `Section ${idx + 1}`;
};

const SectionList: React.FC = () => {
  const { components, selectElement, isEditing } = useSpartiBuilder();

  const handleSelect = (idx: number) => {
    const el = document.querySelector(`[data-sparti-component-index="${idx}"]`) as HTMLElement | null;
    if (!el) return;
    // Scroll into view in the center preview
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Select element in builder
    selectElement({ element: el, data: { tagName: el.tagName.toLowerCase() } } as any);
  };

  if (!isEditing) return null;

  return (
    <aside className="w-64 min-w-64 max-w-64 border-r bg-muted/20 p-3 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-3">Sections</h3>
      <div className="space-y-2">
        {Array.isArray(components) && components.length > 0 ? (
          components.map((c, idx) => (
            <button
              key={`section-${idx}`}
              onClick={() => handleSelect(idx)}
              className="w-full flex items-center gap-2 rounded-md border px-3 py-2 text-left hover:bg-muted transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{labelFor(c, idx)}</span>
            </button>
          ))
        ) : (
          <div className="text-xs text-muted-foreground px-2">No sections</div>
        )}
      </div>
    </aside>
  );
};

export default SectionList;