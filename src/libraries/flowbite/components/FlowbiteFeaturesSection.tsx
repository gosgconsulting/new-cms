"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteFeaturesSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Features Section Component
 * 
 * Displays features in a grid layout
 * Following Diora pattern for data extraction
 */
const FlowbiteFeaturesSection: React.FC<FlowbiteFeaturesSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions
  const getHeading = (key: string, level?: number) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading" &&
      (level === undefined || (i as any).level === level)
    ) as any;
    return item?.content || "";
  };

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  // Extract features - look for feature1, feature2, etc. or features array
  const featuresArray = getArray("features");
  const features: any[] = [];

  // If no features array, look for feature1, feature2, etc.
  if (featuresArray.length === 0) {
    for (let i = 1; i <= 10; i++) {
      const featureKey = `feature${i}`;
      const featureItems = getArray(featureKey);
      if (featureItems.length > 0) {
        const title = featureItems.find((item: any) => 
          item.key?.toLowerCase() === "title" || item.type === "heading"
        );
        const description = featureItems.find((item: any) => 
          item.key?.toLowerCase() === "description" || item.type === "text"
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
    // Process features array
    featuresArray.forEach((feature: any) => {
      if (Array.isArray(feature.items)) {
        const title = feature.items.find((item: any) => 
          item.key?.toLowerCase() === "title" || item.type === "heading"
        );
        const description = feature.items.find((item: any) => 
          item.key?.toLowerCase() === "description" || item.type === "text"
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
    <section className={`py-20 px-4 bg-white ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection className="mb-12">
          {features.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  {feature.title && (
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                  )}
                  {feature.description && (
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No features to display</p>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteFeaturesSection;

