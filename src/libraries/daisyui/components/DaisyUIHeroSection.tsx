"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DaisyUISection from "./DaisyUISection";

interface DaisyUIHeroSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI Hero Section Component
 * 
 * Hero section with title, description, CTA, and optional image
 * Uses DaisyUI hero utility classes
 */
const DaisyUIHeroSection: React.FC<DaisyUIHeroSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions
  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || props[key] || "";
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

  const getImage = (key: string = "image") => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || props[key] || "";
  };

  // Extract data
  const title = getText("title") || getText("heading");
  const description = getText("description") || getText("subtitle");
  const cta = getButton("cta");
  const image = getImage("image");

  return (
    <DaisyUISection className={className}>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            {title && (
              <h1 className="mb-5 text-5xl font-bold">{title}</h1>
            )}
            {description && (
              <p className="mb-5">{description}</p>
            )}
            {cta.content && (
              <a href={cta.link} className="btn btn-primary">
                {cta.content}
              </a>
            )}
          </div>
        </div>
        {image && (
          <div className="hero-content flex-col lg:flex-row">
            <img
              src={image}
              alt={title || "Hero image"}
              className="max-w-sm rounded-lg shadow-2xl"
            />
          </div>
        )}
      </div>
    </DaisyUISection>
  );
};

export default DaisyUIHeroSection;
