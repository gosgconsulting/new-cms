"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import { Star } from "lucide-react";
import FlowbiteSlider, { type FlowbiteSlide } from "./FlowbiteSlider";

interface FlowbiteHeroSectionProps {
  component: ComponentSchema;
  className?: string;
}

type SlideInput =
  | string
  | { src: string; alt?: string; caption?: string }
  | { image: { src: string; alt?: string }; caption?: string };

function normalizeSlides(input: unknown): FlowbiteSlide[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((s: SlideInput) => {
      if (typeof s === "string") {
        return { image: { src: s } };
      }
      if (s && typeof s === "object") {
        if ("image" in s && (s as any).image?.src) {
          return {
            image: {
              src: (s as any).image.src,
              alt: (s as any).image.alt,
            },
            caption: (s as any).caption,
          };
        }
        if ("src" in s && (s as any).src) {
          return {
            image: { src: (s as any).src, alt: (s as any).alt },
            caption: (s as any).caption,
          };
        }
      }
      return null;
    })
    .filter(Boolean) as FlowbiteSlide[];
}

/**
 * Flowbite Hero Section Component
 *
 * Revamped hero with optional rating badge + carousel.
 * Keeps the same data extraction pattern (ComponentSchema items/props).
 */
const FlowbiteHeroSection: React.FC<FlowbiteHeroSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const showCarousel = (props as any).showCarousel !== false;

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getButtonByKeys = (keys: string[]) => {
    const lower = keys.map((k) => k.toLowerCase());
    const item = items.find(
      (i) =>
        i.type === "button" &&
        (lower.includes(String(i.key || "").toLowerCase()) || lower.includes(""))
    ) as any;

    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const getImageItems = () => {
    return items.filter((i) => i.type === "image" && typeof (i as any).src === "string") as any[];
  };

  const motto = getText("motto") || props.motto || "";
  const title = getText("title") || props.title || "";
  const description = getText("description") || props.description || "";

  const primaryCta = getButtonByKeys(["cta", "primaryCta"]);
  const secondaryCta = getButtonByKeys(["ctaSecondary", "secondaryCta", "cta2"]);

  const slides = useMemo<FlowbiteSlide[]>(() => {
    if (!showCarousel) return [];

    const fromProps = normalizeSlides((props as any).slides);
    if (fromProps.length > 0) return fromProps;

    const imageItems = getImageItems();
    const slideImages = imageItems.filter((i) => String(i.key || "").toLowerCase().includes("slide"));
    const usable = (slideImages.length > 0 ? slideImages : imageItems)
      .map((i) => ({ image: { src: i.src, alt: i.alt } }))
      .slice(0, 6);

    if (usable.length > 0) return usable;

    return [];
  }, [items, props, showCarousel]);

  const highlightedTitle = useMemo(() => {
    if (!title) return null;
    const needle = "growth";
    const idx = title.toLowerCase().lastIndexOf(needle);
    if (idx === -1) return <>{title}</>;

    const before = title.slice(0, idx);
    const match = title.slice(idx, idx + needle.length);
    const after = title.slice(idx + needle.length);

    return (
      <>
        {before}
        <span className="text-brand-primary">{match}</span>
        {after}
      </>
    );
  }, [title]);

  return (
    <section
      className={`relative overflow-hidden bg-[color:var(--brand-background)] py-10 sm:py-14 ${className}`}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400/25 via-sky-400/10 to-lime-400/20 blur-3xl dark:from-sky-500/20 dark:via-indigo-500/10 dark:to-lime-400/20" />
        <div className="absolute -bottom-48 right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-lime-400/10 via-sky-400/10 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div
              className={[
                showCarousel ? "grid grid-cols-1 lg:grid-cols-2" : "grid grid-cols-1",
                "gap-10 p-6 sm:p-10 lg:p-12 items-center",
              ].join(" ")}
            >
              {/* Copy */}
              <div className={showCarousel ? "space-y-6" : "space-y-6 max-w-3xl mx-auto text-center"}>
                {/* Motto pill (replaces Clutch rating badge) */}
                {motto ? (
                  <div
                    className={
                      showCarousel
                        ? "flex flex-wrap items-center gap-3"
                        : "flex flex-wrap items-center justify-center gap-3"
                    }
                  >
                    <span className="badge-neutral text-xs sm:text-sm">
                      {motto}
                    </span>
                  </div>
                ) : null}

                {title ? (
                  <h1
                    className={[
                      "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white leading-[1.05]",
                      showCarousel ? "" : "mx-auto",
                    ].join(" ")}
                  >
                    {highlightedTitle}
                  </h1>
                ) : null}

                {description ? (
                  <p
                    className={[
                      "text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed",
                      showCarousel ? "max-w-xl" : "max-w-2xl mx-auto",
                    ].join(" ")}
                  >
                    {description}
                  </p>
                ) : null}

                {(primaryCta.content || secondaryCta.content) && (
                  <div className={showCarousel ? "flex flex-col sm:flex-row gap-3 pt-2" : "flex flex-col sm:flex-row gap-3 pt-2 justify-center"}>
                    {primaryCta.content ? (
                      <a href={primaryCta.link} className="btn-cta w-full sm:w-auto">
                        {primaryCta.content}
                      </a>
                    ) : null}
                    {secondaryCta.content ? (
                      <a
                        href={secondaryCta.link}
                        className="btn-cta-secondary w-full sm:w-auto"
                      >
                        {secondaryCta.content}
                      </a>
                    ) : null}
                  </div>
                )}

                <div className={showCarousel ? "text-sm text-gray-600 dark:text-gray-300" : "text-sm text-gray-600 dark:text-gray-300 flex justify-center"}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-primary" />
                    <span>2 spots available this week</span>
                  </span>
                </div>
              </div>

              {/* Right: Carousel */}
              {showCarousel && slides.length > 0 ? (
                <div className="lg:pl-4">
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/20 p-3 sm:p-4">
                    <FlowbiteSlider
                      slides={slides}
                      options={{
                        autoplay: true,
                        intervalMs: 4500,
                        arrows: true,
                        dots: true,
                        loop: true,
                        pauseOnHover: true,
                        aspectRatio: "16/9",
                        overlay: {
                          enabled: true,
                          mode: "gradient",
                          className: "bg-gradient-to-t from-black/40 via-black/10 to-transparent",
                        },
                      }}
                      ariaLabel="Hero preview"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowbiteHeroSection;