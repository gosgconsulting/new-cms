import React from "react";

interface SimpleItem {
  key: string;
  type: string;
  content?: string;
  level?: number;
  items?: Array<{
    key: string;
    type: string;
    content?: string;
  }>;
}

interface SimpleServiceSectionProps {
  items?: SimpleItem[];
}

/**
 * SimpleServiceSection
 * Renders a minimal, text-only section (title, description, bullet points)
 * Uses clean semantic HTML with very light styling to be redesigned later.
 */
const SimpleServiceSection: React.FC<SimpleServiceSectionProps> = ({ items = [] }) => {
  const titleItem =
    items.find((i) => i.key === "title" && i.type === "heading") ||
    items.find((i) => i.type === "heading");
  const descriptionItem = items.find((i) => i.key === "description" && i.type === "text");
  const pointsItem = items.find((i) => i.key === "points" && i.type === "array");
  const points = pointsItem?.items || [];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {titleItem?.content && (
          <h2 className="text-2xl font-semibold mb-4">
            {titleItem.content}
          </h2>
        )}
        {descriptionItem?.content && (
          <p className="text-base text-muted-foreground mb-6">
            {descriptionItem.content}
          </p>
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

export default SimpleServiceSection;