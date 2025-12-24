import React from "react";

interface SimpleItem {
  key: string;
  type: string;
  content?: string;
  items?: Array<{
    key: string;
    type: string;
    content?: string;
  }>;
}

interface SimpleTextSectionProps {
  items?: SimpleItem[];
}

/**
 * SimpleTextSection
 * Renders: title (heading), body (paragraphs), optional labels and points (bulleted).
 * Minimal markup; ready for future styling.
 */
const SimpleTextSection: React.FC<SimpleTextSectionProps> = ({ items = [] }) => {
  const titleItem = items.find((i) => i.key === "title" && i.type === "heading") || items.find((i) => i.type === "heading");
  const bodyItem = items.find((i) => i.key === "body" && i.type === "array");
  const labelsItem = items.find((i) => i.key === "labels" && i.type === "array");
  const pointsItem = items.find((i) => i.key === "points" && i.type === "array");

  const body = bodyItem?.items || [];
  const labels = labelsItem?.items || [];
  const points = pointsItem?.items || [];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {titleItem?.content && (
          <h2 className="text-2xl font-semibold mb-4">{titleItem.content}</h2>
        )}

        {body.length > 0 && (
          <div className="space-y-4 mb-6">
            {body.map((p) => (
              <p key={p.key} className="text-base text-foreground/90">
                {p.content}
              </p>
            ))}
          </div>
        )}

        {labels.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-6">
            {labels.map((l) => (
              <span key={l.key} className="text-sm text-muted-foreground">{l.content}</span>
            ))}
          </div>
        )}

        {points.length > 0 && (
          <ul className="list-disc pl-5 space-y-2">
            {points.map((pt) => (
              <li key={pt.key} className="text-base text-foreground/90">
                {pt.content}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default SimpleTextSection;