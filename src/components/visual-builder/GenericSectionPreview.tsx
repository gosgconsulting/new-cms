"use client";

import React from "react";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";

type Props = {
  index: number;
  schema: ComponentSchema;
};

const normalizeLabel = (comp: ComponentSchema, idx: number) => {
  const raw = String(comp?.type || comp?.name || comp?.key || `Section ${idx + 1}`);
  return raw;
};

const collectContent = (items: any[]): { texts: string[]; images: { src: string; alt?: string; title?: string }[] } => {
  const texts: string[] = [];
  const images: { src: string; alt?: string; title?: string }[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;

    if (node.type === "image" && typeof node.src === "string" && node.src) {
      images.push({ src: node.src, alt: node.alt, title: node.title });
    }

    if (typeof node.content === "string" && node.content.trim()) {
      texts.push(node.content.trim());
    }

    if (Array.isArray(node.items)) {
      node.items.forEach(walk);
    }

    Object.values(node).forEach((v: any) => {
      if (v && typeof v === "object") {
        if (Array.isArray(v)) v.forEach(walk);
        else walk(v);
      }
    });
  };

  (Array.isArray(items) ? items : []).forEach(walk);

  return { texts, images };
};

const GenericSectionPreview: React.FC<Props> = ({ index, schema }) => {
  const label = normalizeLabel(schema, index);
  const { texts, images } = collectContent(schema.items || []);

  return (
    <section
      data-sparti-component-index={index}
      data-sparti-section={label.toLowerCase()}
      className="rounded-lg border bg-white p-4 shadow-sm mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-[11px] text-gray-500">Generic preview</span>
      </div>

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.slice(0, 8).map((img, i) => (
            <div key={i} className="rounded-md overflow-hidden border bg-gray-50">
              <img
                src={img.src}
                alt={img.alt || img.title || `image-${i + 1}`}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
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
          {texts.slice(0, 5).map((t, i) => (
            <p key={i} className="text-sm text-gray-700">
              {t}
            </p>
          ))}
        </div>
      ) : !images.length ? (
        <p className="text-xs text-gray-500">No textual or image content in this section.</p>
      ) : null}
    </section>
  );
};

export default GenericSectionPreview;