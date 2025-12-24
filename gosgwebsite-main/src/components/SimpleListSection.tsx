import React from "react";

interface BlockItem {
  key: string;
  type: string;
  items?: Array<{
    key: string;
    type: string;
    content?: string;
  }>;
}

interface SimpleListSectionProps {
  items?: Array<{
    key: string;
    type: string;
    content?: string;
    items?: BlockItem[];
  }>;
}

/**
 * SimpleListSection
 * Renders: title and a list of blocks (each with heading + paragraph).
 */
const SimpleListSection: React.FC<SimpleListSectionProps> = ({ items = [] }) => {
  const titleItem = items.find((i) => i.key === "title" && i.type === "heading") || items.find((i) => i.type === "heading");
  const blocksItem = items.find((i) => i.key === "blocks" && i.type === "array");
  const blocks = blocksItem?.items || [];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {titleItem?.content && (
          <h2 className="text-2xl font-semibold mb-6">{titleItem.content}</h2>
        )}
        <div className="space-y-6">
          {blocks.map((block) => {
            const heading = block.items?.find((b) => b.key === "heading" || b.type === "heading");
            const description = block.items?.find((b) => b.key === "description" || (b.type === "text" && b.key !== "heading"));
            return (
              <div key={block.key}>
                {heading?.content && <h3 className="text-xl font-medium mb-2">{heading.content}</h3>}
                {description?.content && <p className="text-base text-foreground/90">{description.content}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SimpleListSection;