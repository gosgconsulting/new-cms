"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Button } from "flowbite-react";
import { Card } from "../../../components/ui/card";

interface FlowbiteProductGridProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Product Grid Component
 * 
 * Displays product grid section with title and action buttons
 * Following Diora pattern for data extraction
 */
const FlowbiteProductGrid: React.FC<FlowbiteProductGridProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions following Diora pattern
  const getHeading = (key: string, level?: number) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading" &&
      (level === undefined || (i as any).level === level)
    ) as any;
    return item?.content || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const getButton = (itemsArray: SchemaItem[], key: string) => {
    const item = itemsArray.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
      icon: item?.icon
    };
  };

  // Extract data
  const title = getHeading("title") || props.title || "";
  const subtitle = getHeading("subtitle", 3) || props.subtitle || "";
  const products = getArray("products") || props.products || [];

  return (
    <FlowbiteSection 
      title={title || undefined}
      subtitle={subtitle || undefined}
      className={className}
    >
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {products.map((product: any, index: number) => {
            const productImage = product.image || product.imageSrc || product.src || "/placeholder.svg";
            const productTitle = product.title || product.name || product.content || "";
            const productDescription = product.description || product.text || "";
            const productPrice = product.price || "";
            const productLink = product.link || product.url || "#";

            return (
              <Card
                key={product.id || index}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <a href={productLink} className="block">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={productImage}
                      alt={productTitle || `Product ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    {productTitle && (
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {productTitle}
                      </h3>
                    )}
                    {productDescription && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{productDescription}</p>
                    )}
                    {productPrice && (
                      <p className="text-lg font-bold text-primary">{productPrice}</p>
                    )}
                  </div>
                </a>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 text-center text-gray-500">
          <p>No products to display. Products will be loaded from e-commerce API.</p>
        </div>
      )}
    </FlowbiteSection>
  );
};

export default FlowbiteProductGrid;