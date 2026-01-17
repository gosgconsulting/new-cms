"use client";

import React, { useEffect, useRef } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import Reveal from "./Reveal";

interface FlowbiteCTASectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite CTA Section Component
 *
 * - animated gradient background
 * - subtle parallax depth (background blobs move slightly differently than content)
 * - scroll reveal on copy + CTA
 */
const FlowbiteCTASection: React.FC<FlowbiteCTASectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // 0..1 based on how much the section has progressed through the viewport
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      const centered = (progress - 0.5) * 2; // -1..1

      const bg1 = Math.round(centered * 18);
      const bg2 = Math.round(centered * -22);
      const content = Math.round(centered * 8);

      el.style.setProperty("--master-parallax-bg-1", `${bg1}px`);
      el.style.setProperty("--master-parallax-bg-2", `${bg2}px`);
      el.style.setProperty("--master-parallax-content", `${content}px`);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const getHeading = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "heading"
    ) as any;
    return item?.content || "";
  };

  const getText = (key: string) => {
    const item = items.find(
      (i) =>
        i.key?.toLowerCase() === key.toLowerCase() &&
        typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getButton = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const title = getHeading("title") || (props as any).title || "";
  const description = getText("description") || (props as any).description || "";
  const cta = getButton("cta");

  const ctaVariant = String(
    (props as any).ctaVariant || (props as any).buttonVariant || "light"
  ).toLowerCase();
  const ctaFullWidth = (props as any).ctaFullWidth ?? true;

  const ctaClassName =
    ctaVariant === "primary"
      ? "btn-cta"
      : ctaVariant === "secondary"
        ? "btn-cta-secondary"
        : "btn-cta-light";

  const shouldUseGlow = ctaVariant !== "light";

  return (
    <section
      ref={sectionRef as any}
      className={[
        "relative overflow-hidden py-20 px-4",
        "bg-brand-gradient-animated",
        className,
      ].join(" ")}
    >
      {/* Brand-safe glow (primary + secondary at low saturation) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div
          className="absolute -top-24 left-[-10rem] h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{
            transform: "translate3d(0, var(--master-parallax-bg-1, 0px), 0)",
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--brand-primary) 30%, transparent), transparent 65%)",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute -bottom-32 right-[-10rem] h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{
            transform: "translate3d(0, var(--master-parallax-bg-2, 0px), 0)",
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--brand-secondary) 28%, transparent), transparent 66%)",
            opacity: 0.55,
          }}
        />
      </div>

      <div
        className="container mx-auto max-w-5xl relative"
        style={{ transform: "translate3d(0, var(--master-parallax-content, 0px), 0)" }}
      >
        <div className="text-center">
          {title ? (
            <Reveal direction="up">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
                {title}
              </h2>
            </Reveal>
          ) : null}
          {description ? (
            <Reveal direction="up" delayMs={90}>
              <p className="mt-4 text-lg text-white/90 max-w-3xl mx-auto">
                {description}
              </p>
            </Reveal>
          ) : null}

          {cta.content ? (
            <Reveal direction="up" delayMs={160}>
              <div className="mt-10 flex justify-center">
                <a
                  href={cta.link}
                  className={[
                    ctaClassName,
                    shouldUseGlow ? "master-cta-glow" : "",
                    ctaFullWidth ? "w-full sm:w-auto" : "w-auto",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {cta.content}
                </a>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default FlowbiteCTASection;