"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import { Star } from "lucide-react";
import Reveal from "./Reveal";
import { useInViewOnce } from "../hooks/useInViewOnce";

interface FlowbiteContentSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Content Section Component
 *
 * Supports:
 * - default "content" card (existing behavior)
 * - variant="about" (About Us layout with scroll-triggered micro-animations)
 */
const FlowbiteContentSection: React.FC<FlowbiteContentSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getHeading = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "heading"
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

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") && i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const variant = (props as any).variant as string | undefined;

  const title = getHeading("title") || (props as any).title || "";
  const badge = getText("badge") || (props as any).badge || "About us";
  const button = getButton("button");

  const paragraphs = useMemo(() => {
    const arr = getArray("content");
    if (arr.length > 0) {
      return arr
        .map((item: any) => (typeof item === "string" ? item : item.content || item.text || ""))
        .filter(Boolean);
    }

    const fromItem = getText("content");
    if (fromItem) {
      return fromItem
        .split(/\n\s*\n/g)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const fromProps = (props as any).content;
    if (typeof fromProps === "string") {
      return fromProps
        .split(/\n\s*\n/g)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (Array.isArray(fromProps)) {
      return fromProps
        .map((item: any) => (typeof item === "string" ? item : item?.content || item?.text || ""))
        .filter(Boolean);
    }

    return [];
  }, [items, props]);

  if (variant === "about") {
    const imageSrc =
      (props as any).imageSrc ||
      (props as any).image?.src ||
      (props as any).image ||
      "/assets/gregoire-liao.png";

    const reviewLabel = (props as any).reviewLabel || "5 Star";
    const reviewSub = (props as any).reviewSub || "Review";

    const { ref: reviewRef, inView: reviewInView } = useInViewOnce<HTMLDivElement>({
      rootMargin: "0px 0px -15% 0px",
      threshold: 0.2,
    });

    return (
      <section
        className={`relative overflow-hidden py-20 px-4 bg-[color:var(--bg-primary)] ${className}`}
      >
        <div className="container mx-auto relative">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <Reveal direction="up" delayMs={0}>
                <span className="label-section">{badge}</span>
              </Reveal>

              {title ? (
                <Reveal direction="up" delayMs={80}>
                  <h2 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight text-[color:var(--text-primary)] leading-tight">
                    {title}
                  </h2>
                </Reveal>
              ) : null}

              {paragraphs.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {paragraphs.map((text, index) => (
                    <Reveal key={index} direction="up" delayMs={160 + index * 90}>
                      <p className="text-base md:text-lg leading-relaxed text-[color:var(--text-secondary)]">
                        {text}
                      </p>
                    </Reveal>
                  ))}
                </div>
              ) : null}

              {button.content ? (
                <Reveal direction="up" delayMs={260 + paragraphs.length * 90}>
                  <div className="mt-8">
                    <a href={button.link} className="btn-cta">
                      {button.content}
                    </a>
                  </div>
                </Reveal>
              ) : null}
            </div>

            {/* Right */}
            <div className="relative">
              <Reveal direction="right" fromScaleClass="scale-95">
                <div className="rounded-[2rem] overflow-hidden bg-white shadow-[var(--shadow-3)]">
                  <img
                    src={imageSrc}
                    alt="About us"
                    className="w-full h-[360px] md:h-[420px] object-cover"
                    loading="lazy"
                  />
                </div>
              </Reveal>

              {/* Floating review pill */}
              <div
                ref={reviewRef}
                className={
                  "absolute left-6 top-6 rounded-2xl border border-[color:var(--border-color)] bg-white/90 backdrop-blur px-4 py-3 shadow-[var(--shadow-2)] " +
                  (reviewInView ? "animate-master-pop" : "opacity-0")
                }
              >
                <div className="flex items-center gap-3">
                  <div className="icon-container-secondary h-10 w-10 rounded-full">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--text-primary)] leading-tight">
                      {reviewLabel}
                    </p>
                    <p className="text-sm text-[color:var(--text-secondary)] leading-tight">
                      {reviewSub}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default content card
  return (
    <section className={`relative overflow-hidden py-20 px-4 bg-[color:var(--bg-primary)] ${className}`}>
      <div className="container mx-auto relative">
        <Reveal direction="up">
          <div className="mx-auto max-w-4xl rounded-3xl border border-[color:var(--border-color)] bg-white p-8 md:p-10 shadow-[var(--shadow-2)]">
            {title ? (
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[color:var(--text-primary)]">
                {title}
              </h2>
            ) : null}

            {paragraphs.length > 0 ? (
              <div className="space-y-4 mt-6">
                {paragraphs.map((text, index) => (
                  <p key={index} className="text-base leading-relaxed text-[color:var(--text-secondary)]">
                    {text}
                  </p>
                ))}
              </div>
            ) : null}

            {button.content ? (
              <div className="mt-8">
                <a href={button.link} className="btn-cta">
                  {button.content}
                </a>
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FlowbiteContentSection;