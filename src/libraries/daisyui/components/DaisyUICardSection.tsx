"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DaisyUISection from "./DaisyUISection";

interface DaisyUICardSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI Card Section Component
 * 
 * Displays cards in a grid layout using DaisyUI card classes
 */
const DaisyUICardSection: React.FC<DaisyUICardSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || props[key] || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const getImage = (key: string = "image") => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || props[key] || "";
  };

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const title = getText("title");
  const subtitle = getText("subtitle");
  const cards = getArray("cards");

  return (
    <DaisyUISection title={title} subtitle={subtitle} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card: any, idx: number) => {
          const cardTitle = card.title || card.items?.find((i: any) => i.key?.toLowerCase() === "title")?.content || "";
          const cardDescription = card.description || card.items?.find((i: any) => i.key?.toLowerCase() === "description")?.content || "";
          const cardImage = card.image || card.src || card.items?.find((i: any) => i.type === "image")?.src || "";
          const cardButton = card.button || card.items?.find((i: any) => i.type === "button") || null;

          return (
            <div key={idx} className="card bg-base-100 shadow-xl">
              {cardImage && (
                <figure>
                  <img src={cardImage} alt={cardTitle || `Card ${idx + 1}`} />
                </figure>
              )}
              <div className="card-body">
                {cardTitle && <h2 className="card-title">{cardTitle}</h2>}
                {cardDescription && <p>{cardDescription}</p>}
                {cardButton && (
                  <div className="card-actions justify-end">
                    <a href={cardButton.link || cardButton.href || "#"} className="btn btn-primary">
                      {cardButton.content || cardButton.label || "Learn More"}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DaisyUISection>
  );
};

export default DaisyUICardSection;
