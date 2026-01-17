"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import { Star } from "lucide-react";

interface FlowbiteContentSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Content Section Component
 *
 * Supports:
 * - default "content" card (existing behavior)
 * - variant="about" (new About Us layout)
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

    return (
      <section className={`relative overflow-hidden py-20 px-4 ${className}`}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[22rem] w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400/12 via-sky-400/10 to-lime-400/12 blur-3xl" />
        </div>

        <div className="container mx-auto relative">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <span className="badge-primary text-sm">
                {badge}
              </span>

              {title ? (
                <h2 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {title}
                </h2>
              ) : null}

              {paragraphs.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {paragraphs.map((text, index) => (
                    <p key={index} className="text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-200">
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

            {/* Right */}
            <div className="relative">
              <div className="rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                <img
                  src={imageSrc}
                  alt="About us"
                  className="w-full h-[360px] md:h-[420px] object-cover"
                  loading="lazy"
                />
              </div>

              {/* Floating review pill */}
              <div className="absolute left-6 top-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 backdrop-blur px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                <div className="flex items-center gap-3">
                  <div className="icon-container-primary h-10 w-10 rounded-full">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">{reviewLabel}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-tight">{reviewSub}</p>
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
    <section className={`relative overflow-hidden py-20 px-4 ${className}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 right-[-10rem] h-[22rem] w-[30rem] rounded-full bg-gradient-to-tr from-indigo-400/12 via-sky-400/8 to-lime-400/12 blur-3xl" />
      </div>

      <div className="container mx-auto relative">
        <div className="mx-auto max-w-4xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          {title ? (
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h2>
          ) : null}

          {paragraphs.length > 0 ? (
            <div className="space-y-4 mt-6">
              {paragraphs.map((text, index) => (
                <p key={index} className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
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
      </div>
    </section>
  );
};

export default FlowbiteContentSection;