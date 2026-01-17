"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DaisyUISection from "./DaisyUISection";

interface DaisyUIFeaturesSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI Features Section Component
 * 
 * Displays features in a grid layout using DaisyUI card classes
 */
const DaisyUIFeaturesSection: React.FC<DaisyUIFeaturesSectionProps> = ({
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

  const title = getText("title");
  const subtitle = getText("subtitle");
  const features = getArray("features");

  // Process features - handle both array format and individual feature items
  const processedFeatures = features.map((feature: any) => {
    if (Array.isArray(feature.items)) {
      const titleItem = feature.items.find((i: any) => 
        i.key?.toLowerCase() === "title" || i.type === "heading"
      );
      const descItem = feature.items.find((i: any) => 
        i.key?.toLowerCase() === "description" || i.type === "text"
      );
      const imgItem = feature.items.find((i: any) => i.type === "image");
      return {
        title: titleItem?.content || feature.title || "",
        description: descItem?.content || feature.description || "",
        image: imgItem?.src || feature.image || feature.src || "",
      };
    }
    return {
      title: feature.title || "",
      description: feature.description || "",
      image: feature.image || feature.src || "",
    };
  });

  return (
    <DaisyUISection title={title} subtitle={subtitle} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedFeatures.map((feature: any, idx: number) => (
          <div key={idx} className="card bg-base-100 shadow-xl">
            {feature.image && (
              <figure>
                <img src={feature.image} alt={feature.title || `Feature ${idx + 1}`} />
              </figure>
            )}
            <div className="card-body">
              {feature.title && <h2 className="card-title">{feature.title}</h2>}
              {feature.description && <p>{feature.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </DaisyUISection>
  );
};

export default DaisyUIFeaturesSection;
