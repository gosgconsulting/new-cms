"use client";

import React, { useMemo } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface FlowbiteContentSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Content Section Component
 *
 * Revamped to render as a clean content card on top of the theme background.
 * Also fixed to support a single text item (key: "content") as used by /theme/master.
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

  const title = getHeading("title") || (props as any).title || "";
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
