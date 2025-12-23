"use client";

import React from "react";

export type ContentItem = {
  type: "heading" | "paragraph" | "list" | "text" | "image";
  level?: number;
  text: string;
  componentType?: string;
  componentId?: string;
  imageUrl?: string;
  alt?: string;
};

interface SectionContentListProps {
  items: ContentItem[];
  variant?: "default" | "output";
  className?: string;
}

/**
 * SectionContentList
 * Renders readable items (headings, paragraphs, list items, images).
 * Set variant="output" to slightly highlight plain text blocks for AI output previews.
 */
const SectionContentList: React.FC<SectionContentListProps> = ({ items, variant = "default", className }) => {
  if (!items || items.length === 0) {
    return <div className="text-sm text-muted-foreground">No text content found.</div>;
  }

  return (
    <div className={["prose prose-sm max-w-none", className || ""].join(" ").trim()}>
      {items.map((item, index) => {
        const key = `${item.componentId ?? "item"}-${index}`;
        switch (item.type) {
          case "heading": {
            const HeadingTag = (`h${item.level || 2}`) as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag
                key={key}
                className={`font-bold text-foreground ${
                  item.level === 1 ? "text-2xl mb-3" :
                  item.level === 2 ? "text-xl mb-2" :
                  item.level === 3 ? "text-lg mb-2" :
                  "text-base mb-2"
                }`}
              >
                {item.text}
              </HeadingTag>
            );
          }
          case "paragraph":
            return (
              <p key={key} className="text-foreground mb-3 leading-relaxed">
                {item.text}
              </p>
            );
          case "list":
            return (
              <li key={key} className="text-foreground mb-2 ml-4 list-disc">
                {item.text}
              </li>
            );
          case "image":
            return (
              <div key={key} className="inline-block">
                <img
                  src={item.imageUrl || ""}
                  alt={item.alt || "Image"}
                  className="w-40 h-24 object-cover rounded border"
                />
              </div>
            );
          case "text":
          default:
            return (
              <div
                key={key}
                className={`text-foreground mb-2 px-3 py-2 rounded ${
                  variant === "output" ? "bg-muted/30" : ""
                }`}
              >
                <div className="mt-1">{item.text}</div>
              </div>
            );
        }
      })}
    </div>
  );
};

export default SectionContentList;