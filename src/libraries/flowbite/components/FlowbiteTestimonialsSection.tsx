"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteTestimonialsSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Testimonials Section Component
 * 
 * Displays testimonials in a grid layout
 * Following Diora pattern for data extraction
 */
const FlowbiteTestimonialsSection: React.FC<FlowbiteTestimonialsSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions
  const getHeading = (key: string, level?: number) => {
    const item = items.find(
      (i) =>
        i.key?.toLowerCase() === key.toLowerCase() &&
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

  // Extract data
  const title = getHeading("title") || props.title || "What our clients say";
  const subtitle = getHeading("subtitle", 3) || getText("subtitle") || props.subtitle || "See what our customers have to say about our services and results.";
  
  // Get testimonials/reviews from items array (supports both formats)
  let testimonials = getArray("testimonials") || getArray("reviews") || props.testimonials || props.reviews || [];
  
  // Handle Moski Reviews format: items with type "review" and props structure
  if (testimonials.length === 0) {
    const reviewItems = items.filter((i: any) => i.type === "review");
    if (reviewItems.length > 0) {
      testimonials = reviewItems.map((item: any) => {
        // Handle Moski format: review items with props
        if (item.props && typeof item.props === "object") {
          return {
            text: item.props.content || item.props.text || "",
            name: item.props.name || "",
            role: item.props.title || item.props.role || "",
            rating: item.props.rating || 5,
            image: item.props.image || ""
          };
        }
        // Handle standard format
        return {
          text: item.content || item.text || "",
          name: item.name || item.author || "",
          role: item.role || item.position || "",
          rating: item.rating || 5,
          image: item.image || item.src || ""
        };
      });
    }
  }

  return (
    <section className={`py-20 px-4 bg-gray-50 ${className}`}>
      <div className="container mx-auto">
        <FlowbiteSection 
          title={title}
          subtitle={subtitle}
          className="text-center mb-16"
        >
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial: any, index: number) => {
                const text = testimonial.text || testimonial.content || testimonial.message || "";
                const name = testimonial.name || testimonial.author || "";
                const role = testimonial.role || testimonial.position || "";
                const image = testimonial.image || testimonial.avatar || "";

                return (
                  <Card key={index} className="h-full">
                    {text && (
                      <p className="text-gray-700 mb-4 italic">"{text}"</p>
                    )}
                    <div className="flex items-center gap-4">
                      {image && (
                        <img 
                          src={image} 
                          alt={name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        {name && (
                          <p className="font-semibold text-gray-900">{name}</p>
                        )}
                        {role && (
                          <p className="text-sm text-gray-600">{role}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No testimonials available.</p>
          )}
        </FlowbiteSection>
      </div>
    </section>
  );
};

export default FlowbiteTestimonialsSection;