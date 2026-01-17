"use client";

import React, { useState } from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button } from "flowbite-react";

interface FlowbiteProductSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Product Section Component
 * 
 * Displays product gallery and information
 * Following Diora pattern for data extraction
 */
const FlowbiteProductSection: React.FC<FlowbiteProductSectionProps> = ({
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

  const getButton = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  // Extract product gallery
  const productGallery = getArray("productGallery");
  const images = productGallery
    .filter((item: any) => item.type === "image" && item.src)
    .map((item: any) => item.src);

  // Extract product information
  const productInformation = getArray("productInformation");
  const title = productInformation.find((item: any) => 
    item.key?.toLowerCase() === "title" || item.type === "heading"
  )?.content || "";
  
  const descriptions = productInformation
    .filter((item: any) => 
      item.key?.toLowerCase().includes("description") && item.type === "text"
    )
    .map((item: any) => item.content);

  const price = productInformation.find((item: any) => 
    item.key?.toLowerCase() === "price"
  )?.content || "";

  const dimensions = productInformation.find((item: any) => 
    item.key?.toLowerCase().includes("dimension")
  )?.content || "";

  const features = getArray("feature1") || [];
  const featureItems = features
    .filter((item: any) => item.type === "text")
    .map((item: any) => item.content);

  const cta = getButton("cta");
  const deliveryInfo = getArray("deliveryInfo");
  const deliveryItems = deliveryInfo
    .filter((item: any) => item.type === "text")
    .map((item: any) => item.content);

  return (
    <section className={`py-20 px-4 bg-gray-50 ${className}`}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          {images.length > 0 && (
            <div>
              {images.length === 1 ? (
                <img
                  src={images[0]}
                  alt={title || "Product image"}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {images.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`${title || "Product"} - Image ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product Information */}
          <div className="space-y-6">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            )}
            
            {descriptions.map((desc, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {desc}
              </p>
            ))}

            {price && (
              <div 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                dangerouslySetInnerHTML={{ __html: price }}
              />
            )}

            {dimensions && (
              <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">{dimensions}</p>
            )}

            {featureItems.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Caractéristiques principales
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {featureItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {cta.content && (
              <div className="pt-4">
                <Button
                  href={cta.link}
                  size="xl"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {cta.content}
                </Button>
              </div>
            )}

            {deliveryItems.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {deliveryItems.join(" • ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowbiteProductSection;

