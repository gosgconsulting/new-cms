"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface FlyonUIHeroSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * FlyonUI Hero Section Component
 * 
 * Hero section with title, description, CTA, and image
 */
const FlyonUIHeroSection: React.FC<FlyonUIHeroSectionProps> = ({
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
    <section className={`hero min-h-screen bg-base-100 ${className}`}>
      <div className="hero-content flex-col lg:flex-row gap-12">
        <div className="flex-1">
          {title && (
            <h1 className="text-5xl font-bold">{title}</h1>
          )}
          {description && (
            <p className="py-6">{description}</p>
          )}
          {cta.content && (
            <a href={cta.link} className="btn btn-primary">
              {cta.content}
            </a>
          )}
        </div>
        {image && (
          <div className="flex-1">
            <img
              src={image}
              alt={title || "Hero image"}
              className="max-w-sm rounded-lg shadow-2xl"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default FlyonUIHeroSection;
