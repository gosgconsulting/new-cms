"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteReviewsProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Reviews Component
 * 
 * Displays customer reviews/testimonials
 * Following Diora pattern for data extraction
 */
const FlowbiteReviews: React.FC<FlowbiteReviewsProps> = ({
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

  // Extract data
  const title = getHeading("title") || props.title || "";
  const subtitle = getHeading("subtitle", 3) || props.subtitle || "";
  
  // Get reviews from items array (supports both formats)
  let reviews = getArray("reviews") || props.reviews || [];
  
  // Handle Moski Reviews format: items with type "review" and props structure
  if (reviews.length === 0) {
    const reviewItems = items.filter((i: any) => i.type === "review");
    if (reviewItems.length > 0) {
      reviews = reviewItems.map((item: any) => {
        // Handle Moski format: review items with props
        if (item.props && typeof item.props === "object") {
          return {
            name: item.props.name || "",
            role: item.props.title || item.props.role || "",
            rating: item.props.rating || 5,
            content: item.props.content || item.props.text || "",
            image: item.props.image || ""
          };
        }
        // Handle standard format
        return {
          name: item.name || item.author || "",
          role: item.role || item.position || "",
          rating: item.rating || 5,
          content: item.content || item.text || "",
          image: item.image || item.src || ""
        };
      });
    }
  }

  return (
    <FlowbiteSection 
      title={title || undefined}
      subtitle={subtitle || undefined}
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review: any, index: number) => {
          // Handle review structure - can be in props or items
          const reviewData = review.props || review;
          const name = reviewData.name || "";
          const content = reviewData.content || reviewData.text || "";
          const rating = reviewData.rating || 5;
          const time = reviewData.time || reviewData.date || "";

          if (!name && !content) return null;

          return (
            <Card key={index} className="h-full">
              <div className="space-y-3">
                {rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
                {content && (
                  <p className="text-gray-700">{content}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  {name && (
                    <p className="font-semibold text-gray-900">{name}</p>
                  )}
                  {time && (
                    <p className="text-sm text-gray-500">{time}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </FlowbiteSection>
  );
};

export default FlowbiteReviews;

