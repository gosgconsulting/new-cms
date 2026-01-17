"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DaisyUISection from "./DaisyUISection";

interface DaisyUIServicesSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI Services Section Component
 * 
 * Displays services in a grid layout using DaisyUI card classes
 */
const DaisyUIServicesSection: React.FC<DaisyUIServicesSectionProps> = ({
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

  const findImageItem = (itemsArray: any[]) => {
    return itemsArray.find(
      (i) => i?.type === "image" && typeof i?.src === "string"
    ) || null;
  };

  const title = getText("title");
  const subtitle = getText("subtitle");
  const services = getArray("services") || props.services || [];

  return (
    <DaisyUISection title={title} subtitle={subtitle} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service: any, index: number) => {
          const serviceItems = Array.isArray(service?.items) ? service.items : (Array.isArray(service) ? service : []);
          
          const image = findImageItem(serviceItems);
          const heading = serviceItems.find((i: any) => 
            i.type === "heading" || i.key?.toLowerCase() === "heading"
          )?.content || service.title || service.heading || "";
          const description = serviceItems.find((i: any) => 
            (i.key?.toLowerCase() === "description" || i.type === "text") &&
            typeof i.content === "string"
          )?.content || service.description || "";

          return (
            <div key={index} className="card bg-base-100 shadow-xl text-center">
              <div className="card-body">
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
                  <h3 className="text-lg font-semibold mb-2">{heading}</h3>
                )}
                {description && (
                  <p className="text-sm opacity-70">{description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DaisyUISection>
  );
};

export default DaisyUIServicesSection;
