"use client";

import React, { useMemo, useRef, useState } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { BadgeCheck, Star } from "lucide-react";

interface FlowbiteTestimonialsSectionProps {
  component: ComponentSchema;
  className?: string;
}

function initialsFromName(name: string) {
  const parts = name
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || parts[0]?.[1] || "";
  return (a + b).toUpperCase();
}

function formatFallbackDate(index: number) {
  // Simple deterministic dates similar to the screenshot
  const day = 17 - index;
  return `${day} January 2026`;
}

/**
 * Flowbite Testimonials Section Component
 *
 * Styled to match the provided reference cards (avatar + Google badge, stars, verified check).
 * Includes light/dark versions via Tailwind `dark:` classes.
 */
const FlowbiteTestimonialsSection: React.FC<FlowbiteTestimonialsSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const title = getHeading("title") || (props as any).title || "Reviews";
  const subtitle =
    getHeading("subtitle", 3) ||
    getText("subtitle") ||
    (props as any).subtitle ||
    "Real feedback from real people.";

  let testimonials =
    getArray("testimonials") ||
    getArray("reviews") ||
    (props as any).testimonials ||
    (props as any).reviews ||
    [];

  if (testimonials.length === 0) {
    const reviewItems = items.filter((i: any) => i.type === "review");
    if (reviewItems.length > 0) {
      testimonials = reviewItems.map((item: any) => {
        if (item.props && typeof item.props === "object") {
          return {
            text: item.props.content || item.props.text || "",
            name: item.props.name || "",
            role: item.props.title || item.props.role || "",
            date: item.props.date || "",
          };
        }
        return {
          text: item.content || item.text || "",
          name: item.name || item.author || "",
          role: item.role || item.position || "",
          date: item.date || "",
        };
      });
    }
  }

  // Dummy fallback (requested)
  if (testimonials.length === 0) {
    testimonials = [
      {
        name: "Melissa K.",
        date: "17 January 2026",
        text:
          "The coaches are knowledgeable and supportive, making every workout feel focused, effective, and perfectly aligned with my fitness goals.",
      },
      {
        name: "Daniel R.",
        date: "16 January 2026",
        text:
          "Training here feels structured and motivating, with clear guidance that helps me stay consistent and see real progress over time.",
      },
      {
        name: "Jonathan P.",
        date: "14 January 2026",
        text:
          "The programs are well-designed and challenging, pushing me to improve while still feeling safe and properly coached.",
      },
    ];
  }

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    if (!first) return;

    const cardWidth = first.getBoundingClientRect().width;
    if (!cardWidth) return;

    const idx = Math.round(el.scrollLeft / (cardWidth + 24)); // 24 ~ gap-6
    setActiveIndex(Math.max(0, Math.min(testimonials.length - 1, idx)));
  };

  const scrollToIndex = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

  const cards = useMemo(() => {
    return testimonials.map((testimonial: any, index: number) => {
      const text = testimonial.text || testimonial.content || testimonial.message || "";
      const name = testimonial.name || testimonial.author || `Client ${index + 1}`;
      const date = testimonial.date || formatFallbackDate(index);
      const initials = initialsFromName(name);

      return (
        <div
          key={index}
          className="snap-start min-w-[280px] md:min-w-[360px] lg:min-w-[380px] rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-rose-600 text-white flex items-center justify-center text-lg font-semibold">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white border border-black/10 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-900">G</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                {name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 text-amber-400"
                  fill="currentColor"
                />
              ))}
            </div>
            <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-600 text-white">
              <BadgeCheck className="h-4 w-4" />
            </div>
          </div>

          {text ? (
            <p className="mt-5 text-[17px] leading-relaxed text-slate-700 dark:text-slate-200">
              {text}
            </p>
          ) : null}
        </div>
      );
    });
  }, [testimonials]);

  return (
    <section className={`relative overflow-hidden py-20 px-4 ${className}`}>
      <div className="container mx-auto relative">
        <div className="mx-auto max-w-6xl">
          <FlowbiteSection title={title} subtitle={subtitle} className="text-center mb-10" />

          <div
            ref={scrollerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {cards}
          </div>

          <div className="flex items-center justify-center gap-2 mt-2">
            {testimonials.map((_: any, idx: number) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  className={[
                    "h-2 rounded-full transition-all",
                    isActive ? "w-10 bg-rose-600" : "w-2 bg-slate-300 dark:bg-slate-600",
                  ].join(" ")}
                  aria-label={`Go to review ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowbiteTestimonialsSection;