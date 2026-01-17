"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface FlyonUIFeaturesSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * FlyonUI Features Section Component
 * 
 * Features grid with icons, titles, and descriptions
 */
const FlyonUIFeaturesSection: React.FC<FlyonUIFeaturesSectionProps> = ({
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

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const title = getText("title") || getText("heading");
  const description = getText("description") || getText("subtitle");
  const features = getArray("features") || getArray("items");

  return (
    <section className={`py-16 bg-base-100 ${className}`}>
      <div className="container mx-auto px-4">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
            {description && <p className="text-base-content/70">{description}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature: any, index: number) => (
            <div key={index} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                {feature.icon && (
                  <div className="text-4xl mb-4">{feature.icon}</div>
                )}
                {feature.title && (
                  <h3 className="card-title">{feature.title}</h3>
                )}
                {feature.description && (
                  <p>{feature.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlyonUIFeaturesSection;
