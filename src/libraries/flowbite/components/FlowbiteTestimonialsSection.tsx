"use client";

import React, { useMemo, useRef } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteTestimonialsSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Testimonials Section Component
 *
 * Revamped into a scroll-snap carousel (works as a slider) with light/dark styling.
 */
const FlowbiteTestimonialsSection: React.FC<FlowbiteTestimonialsSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const scrollerRef = useRef<HTMLDivElement>(null);

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
      (i) => i.key?.toLowerCase() === key.toLowerCase() && typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const title = getHeading("title") || props.title || "What our clients say";
  const subtitle =
    getHeading("subtitle", 3) ||
    getText("subtitle") ||
    props.subtitle ||
    "See what our customers have to say about our services and results.";

  let testimonials =
    getArray("testimonials") || getArray("reviews") || (props as any).testimonials || (props as any).reviews || [];

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
            image: item.props.image || "",
          };
        }
        return {
          text: item.content || item.text || "",
          name: item.name || item.author || "",
          role: item.role || item.position || "",
          rating: item.rating || 5,
          image: item.image || item.src || "",
        };
      });
    }
  }

  const hasMany = testimonials.length > 2;

  const handleScroll = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(260, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  const cards = useMemo(() => {
    return testimonials.map((testimonial: any, index: number) => {
      const text = testimonial.text || testimonial.content || testimonial.message || "";
      const name = testimonial.name || testimonial.author || "";
      const role = testimonial.role || testimonial.position || "";
      const image = testimonial.image || testimonial.avatar || "";

      return (
        <Card
          key={index}
          className="snap-start min-w-[280px] md:min-w-[360px] border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5"
        >
          {text ? (
            <p className="text-gray-700 dark:text-gray-200 mb-5 italic leading-relaxed">
              "{text}"
            </p>
          ) : null}
          <div className="flex items-center gap-4">
            {image ? (
              <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-lime-400/20 border border-black/10 dark:border-white/10" />
            )}
            <div>
              {name ? (
                <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
              ) : null}
              {role ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">{role}</p>
              ) : null}
            </div>
          </div>
        </Card>
      );
    });
  }, [testimonials]);

  return (
    <section
      className={`py-20 px-4 bg-transparent ${className}`}
    >
      <div className="container mx-auto">
        <div className="flex items-end justify-between gap-4 mb-10">
          <FlowbiteSection title={title} subtitle={subtitle} />
          {hasMany ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll("prev")}
                className="h-10 w-10 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors"
                aria-label="Previous testimonials"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => handleScroll("next")}
                className="h-10 w-10 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors"
                aria-label="Next testimonials"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>

        {testimonials.length > 0 ? (
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {cards}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No testimonials available.</p>
        )}
      </div>
    </section>
  );
};

export default FlowbiteTestimonialsSection;