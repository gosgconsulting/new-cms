"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useInViewOnce, type UseInViewOnceOptions } from "../hooks/useInViewOnce";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Direction for the entrance offset.
   * Defaults to "up".
   */
  direction?: RevealDirection;
  /** Milliseconds. */
  delayMs?: number;
  /** Milliseconds. */
  durationMs?: number;
  /** Optional scale class to apply ONLY before reveal (e.g. "scale-95"). */
  fromScaleClass?: string;
  /** IntersectionObserver options. */
  inViewOptions?: UseInViewOnceOptions;
}

const dirToTranslate: Record<RevealDirection, string> = {
  up: "translate-y-4",
  down: "-translate-y-4",
  left: "translate-x-4",
  right: "-translate-x-4",
  none: "",
};

export default function Reveal({
  children,
  className,
  direction = "up",
  delayMs = 0,
  durationMs = 550,
  fromScaleClass,
  inViewOptions,
}: RevealProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(inViewOptions);

  const style: React.CSSProperties = {
    transitionDelay: `${delayMs}ms`,
    transitionDuration: `${durationMs}ms`,
  };

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "transition-[opacity,transform] will-change-[opacity,transform]",
        inView
          ? "opacity-100 translate-x-0 translate-y-0 scale-100"
          : cn("opacity-0", dirToTranslate[direction], fromScaleClass),
        className
      )}
    >
      {children}
    </div>
  );
}