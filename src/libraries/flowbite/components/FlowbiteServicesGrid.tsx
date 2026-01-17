"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteServicesGridProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Services Grid Component
 * 
 * Displays services in a grid layout
 * Following Diora pattern for data extraction
 */
const FlowbiteServicesGrid: React.FC<FlowbiteServicesGridProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions following Diora pattern
  const getHeading = (itemsArray: SchemaItem[], key: string, level?: number) => {
    const item = itemsArray.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading" &&
      (level === undefined || (i as any).level === level)
    ) as any;
    return item?.content || "";
  };

  const getText = (itemsArray: SchemaItem[], key: string) => {
    const item = itemsArray.find(
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

  const findImageItem = (itemsArray: any[]) => {
    return itemsArray.find(
      (i) => i?.type === "image" && typeof i?.src === "string"
    ) || null;
  };

  // Extract data
  const title = getHeading(items, "title") || props.title || "";
  const subtitle = getHeading(items, "subtitle", 3) || getText(items, "subtitle") || props.subtitle || "";
  const services = getArray("services") || props.services || [];

  return (
    <FlowbiteSection 
      title={title || undefined}
      subtitle={subtitle || undefined}
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service: any, index: number) => {
          // Handle nested array structure
          const serviceItems = Array.isArray(service?.items) ? service.items : (Array.isArray(service) ? service : []);
          
          const image = findImageItem(serviceItems);
          const heading = getHeading(serviceItems, "heading") || 
                         getHeading(serviceItems, "shippingheading") ||
                         getHeading(serviceItems, "returnsheading") ||
                         getHeading(serviceItems, "paymentheading") ||
                         "";
          const description = getText(serviceItems, "description") ||
                            getText(serviceItems, "shippingdescription") ||
                            getText(serviceItems, "returnsdescription") ||
                            getText(serviceItems, "paymentdescription") ||
                            "";

          return (
            <Card key={index} className="text-center">
              {image?.src && (
                <div className="flex justify-center mb-4">
                  <img
                    src={image.src}
                    alt={image.alt || heading || "Service"}
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
              {heading && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{heading}</h3>
              )}
              {description && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">{description}</p>
              )}
            </Card>
          );
        })}
      </div>
    </FlowbiteSection>
  );
};

export default FlowbiteServicesGrid;

