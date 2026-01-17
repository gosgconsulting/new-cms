"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface HyperUIHeroSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * HyperUI Hero Section Component
 * 
 * Hero section with title, description, CTA, and image
 * Uses HyperUI/Tailwind CSS v4 styling
 */
const HyperUIHeroSection: React.FC<HyperUIHeroSectionProps> = ({
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
    <section className={`bg-white ${className}`}>
      <div className="max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:grid">
        <div className="mr-auto place-self-center lg:col-span-7">
          {title && (
            <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
              {description}
            </p>
          )}
          {cta.content && (
            <a
              href={cta.link}
              className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300"
            >
              {cta.content}
            </a>
          )}
        </div>
        {image && (
          <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <img src={image} alt={title || "Hero image"} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HyperUIHeroSection;
