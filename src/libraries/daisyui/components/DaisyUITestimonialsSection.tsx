"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DaisyUISection from "./DaisyUISection";

interface DaisyUITestimonialsSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * DaisyUI Testimonials Section Component
 * 
 * Displays testimonials in a grid layout using DaisyUI card classes
 */
const DaisyUITestimonialsSection: React.FC<DaisyUITestimonialsSectionProps> = ({
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

  const title = getText("title") || "What our clients say";
  const subtitle = getText("subtitle") || "See what our customers have to say about our services and results.";
  
  // Get testimonials/reviews from items array
  let testimonials = getArray("testimonials") || getArray("reviews") || [];
  
  // Handle review items format
  if (testimonials.length === 0) {
    const reviewItems = items.filter((i: any) => i.type === "review");
    if (reviewItems.length > 0) {
      testimonials = reviewItems.map((item: any) => {
        if (item.props && typeof item.props === "object") {
          return {
            text: item.props.content || item.props.text || "",
            name: item.props.name || "",
            role: item.props.title || item.props.role || "",
            rating: item.props.rating || 5,
            image: item.props.image || ""
          };
        }
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
    <DaisyUISection title={title} subtitle={subtitle} className={className}>
      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial: any, index: number) => {
            const text = testimonial.text || testimonial.content || testimonial.message || "";
            const name = testimonial.name || testimonial.author || "";
            const role = testimonial.role || testimonial.position || "";
            const image = testimonial.image || testimonial.avatar || "";

            return (
              <div key={index} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  {text && (
                    <p className="italic mb-4">"{text}"</p>
                  )}
                  <div className="flex items-center gap-4">
                    {image && (
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img src={image} alt={name} />
                        </div>
                      </div>
                    )}
                    <div>
                      {name && <p className="font-semibold">{name}</p>}
                      {role && <p className="text-sm opacity-70">{role}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center opacity-70">No testimonials available.</p>
      )}
    </DaisyUISection>
  );
};

export default DaisyUITestimonialsSection;
