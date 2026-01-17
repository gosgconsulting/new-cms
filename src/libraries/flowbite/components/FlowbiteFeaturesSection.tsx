"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteFeaturesSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Features Section Component
 */
const FlowbiteFeaturesSection: React.FC<FlowbiteFeaturesSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const featuresArray = getArray("features");
  const features: any[] = [];

  if (featuresArray.length === 0) {
    for (let i = 1; i <= 10; i++) {
      const featureKey = `feature${i}`;
      const featureItems = getArray(featureKey);
      if (featureItems.length > 0) {
        const title = featureItems.find(
          (item: any) => item.key?.toLowerCase() === "title" || item.type === "heading"
        );
        const description = featureItems.find(
          (item: any) => item.key?.toLowerCase() === "description" || item.type === "text"
        );
        if (title || description) {
          features.push({
            title: title?.content || "",
            description: description?.content || "",
          });
        }
      }
    }
  } else {
    featuresArray.forEach((feature: any) => {
      if (Array.isArray(feature.items)) {
        const title = feature.items.find(
          (item: any) => item.key?.toLowerCase() === "title" || item.type === "heading"
        );
        const description = feature.items.find(
          (item: any) => item.key?.toLowerCase() === "description" || item.type === "text"
        );
        features.push({
          title: title?.content || feature.title || "",
          description: description?.content || feature.description || "",
        });
      } else {
        features.push({
          title: feature.title || "",
          description: feature.description || "",
        });
      }
    });
  }

  return (
    <section className={`py-20 px-4 bg-transparent ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection className="mb-12">
          {features.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="text-left h-full border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5"
                >
                  {feature.title ? (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                  ) : null}
                  {feature.description ? (
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  ) : null}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">No features to display</p>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteFeaturesSection;