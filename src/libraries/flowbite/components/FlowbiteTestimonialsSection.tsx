"use client";

import React, { useMemo, useRef, useState } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";

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

  // Dummy fallback reviews with industries
  if (testimonials.length === 0) {
    testimonials = [
      {
        name: "Melissa K.",
        industry: "Fitness",
        text:
          "The coaches are knowledgeable and supportive, making every workout feel focused, effective, and perfectly aligned with my fitness goals.",
      },
      {
        name: "Daniel R.",
        industry: "E‑commerce",
        text:
          "Training here feels structured and motivating, with clear guidance that helps me stay consistent and see real progress over time.",
      },
      {
        name: "Jonathan P.",
        industry: "B2B SaaS",
        text:
          "The programs are well-designed and challenging, pushing me to improve while still feeling safe and properly coached.",
      },
      {
        name: "Amelia S.",
        industry: "Hospitality",
        text:
          "Clear strategy and supportive coaching helped us streamline operations and improve guest experience across the board.",
      },
      {
        name: "Noah T.",
        industry: "Healthcare",
        text:
          "Practical, measured improvements that compound—our team finally sees consistent growth.",
      },
      {
        name: "Sofia M.",
        industry: "Retail",
        text:
          "We now have a system that turns attention into sales. The difference is obvious in our weekly numbers.",
      },
    ];
  }

  // Page-based navigation: groups of 3
  const pageSize = 3;
  const pageCount = Math.max(1, Math.ceil(testimonials.length / pageSize));

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    if (!first) return;
    const approxGap = 24; // gap-6
    const cw = first.getBoundingClientRect().width + approxGap;
    const indexApprox = Math.round(el.scrollLeft / cw);
    const page = Math.max(0, Math.min(pageCount - 1, Math.floor(indexApprox / pageSize)));
    setActiveIndex(page);
  };

  const scrollToPage = (page: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstChild = el.children[page * pageSize] as HTMLElement | undefined;
    if (!firstChild) return;
    el.scrollTo({ left: firstChild.offsetLeft, behavior: "smooth" });
    setActiveIndex(page);
  };

  const cards = useMemo(() => {
    return testimonials.map((testimonial: any, index: number) => {
      const text = testimonial.text || testimonial.content || testimonial.message || "";
      const name = testimonial.name || testimonial.author || `Client ${index + 1}`;
      const industry = testimonial.industry || testimonial.role || testimonial.position || "";

      const initials = initialsFromName(name);

      return (
        <div
          key={index}
          className="snap-start min-w-[280px] md:min-w-[360px] lg:min-w-[380px] rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-start gap-4">
            {/* Initials-only avatar */}
            <div className="h-14 w-14 rounded-full bg-rose-600 text-white flex items-center justify-center text-lg font-semibold">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                {name}
              </p>
              {industry ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{industry}</p>
              ) : null}
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
    <section className={`py-20 px-4 bg-transparent ${className}`}>
      <div className="container mx-auto">
        <div className="mx-auto max-w-6xl">
          <FlowbiteSection title={title} subtitle={subtitle} className="text-center mb-10" />

          {testimonials.length > 0 ? (
            <>
              <div
                ref={scrollerRef}
                onScroll={handleScroll}
                className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scroll-px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {cards}
              </div>

              {/* Page (group of 3) bar indicators */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {Array.from({ length: pageCount }).map((_, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToPage(idx)}
                      className={[
                        "h-2 rounded-full transition-all",
                        isActive
                          ? "w-14 bg-amber-500"
                          : "w-6 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500",
                      ].join(" ")}
                      aria-label={`Go to reviews page ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No testimonials available.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteTestimonialsSection;