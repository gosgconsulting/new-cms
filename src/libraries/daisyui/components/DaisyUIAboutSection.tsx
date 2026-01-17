"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DaisyUISection from "./DaisyUISection";

interface DaisyUIAboutSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI About Section Component
 * 
 * About section with title, description, and image
 */
const DaisyUIAboutSection: React.FC<DaisyUIAboutSectionProps> = ({
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

  const getImage = (key: string = "image") => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || props[key] || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const title = getText("title");
  const description = getText("description");
  const image = getImage("image");
  const paragraphs = getArray("paragraphs");

  return (
    <DaisyUISection className={className}>
      <div className="hero bg-base-200">
        <div className="hero-content flex-col lg:flex-row gap-12">
          {image && (
            <img
              src={image}
              alt={title || "About"}
              className="max-w-sm rounded-lg shadow-2xl"
            />
          )}
          <div>
            {title && (
              <h1 className="text-4xl font-bold mb-4">{title}</h1>
            )}
            {description && (
              <p className="py-6 text-lg">{description}</p>
            )}
            {paragraphs.length > 0 && (
              <div className="space-y-4">
                {paragraphs.map((para: any, idx: number) => {
                  const text = typeof para === "string" 
                    ? para 
                    : (para.content || para.text || "");
                  if (!text) return null;
                  return (
                    <p key={idx} className="text-base opacity-80">
                      {text}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DaisyUISection>
  );
};

export default DaisyUIAboutSection;
