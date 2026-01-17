"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DaisyUISection from "./DaisyUISection";

interface DaisyUICTASectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI CTA Section Component
 * 
 * Call-to-action section with title, description, and button
 * Uses DaisyUI hero and button classes
 */
const DaisyUICTASection: React.FC<DaisyUICTASectionProps> = ({
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
  const description = getText("description");
  const cta = getButton("cta");

  return (
    <DaisyUISection className={className}>
      <div className="hero bg-primary text-primary-content">
        <div className="hero-content text-center">
          <div className="max-w-md">
            {title && (
              <h2 className="mb-5 text-3xl md:text-4xl font-bold">{title}</h2>
            )}
            {description && (
              <p className="mb-5 text-lg opacity-90">{description}</p>
            )}
            {cta.content && (
              <a href={cta.link} className="btn btn-secondary">
                {cta.content}
              </a>
            )}
          </div>
        </div>
      </div>
    </DaisyUISection>
  );
};

export default DaisyUICTASection;
