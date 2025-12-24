import React from "react";

interface SimpleStatsSectionProps {
  items?: Array<{
    key: string;
    type: string;
    content?: string;
    items?: Array<{
      key: string;
      type: string;
      content?: string;
    }>;
  }>;
}

/**
 * SimpleStatsSection
 * Renders: title, body paragraph, and stat lines.
 */
const SimpleStatsSection: React.FC<SimpleStatsSectionProps> = ({ items = [] }) => {
  const titleItem = items.find((i) => i.key === "title" && i.type === "heading") || items.find((i) => i.type === "heading");
  const bodyItem = items.find((i) => i.key === "body" && i.type === "text");
  const statsItem = items.find((i) => i.key === "stats" && i.type === "array");
  const stats = statsItem?.items || [];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {titleItem?.content && (
          <h2 className="text-2xl font-semibold mb-4">{titleItem.content}</h2>
        )}
        {bodyItem?.content && (
          <p className="text-base text-foreground/90 mb-6">{bodyItem.content}</p>
        )}
        {stats.length > 0 && (
          <ul className="space-y-2">
            {stats.map((s) => (
              <li key={s.key} className="text-base text-foreground/90">{s.content}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default SimpleStatsSection;