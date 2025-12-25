"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "../../lib/utils";

type AsTag = keyof JSX.IntrinsicElements;

interface TimelineContentProps {
  as?: AsTag;
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLElement>;
  customVariants?: Variants;
  className?: string;
  children?: React.ReactNode;
}

/**
 * TimelineContent
 * Lightweight animated wrapper for text blocks using framer-motion.
 * It accepts customVariants for reveal animations and supports any HTML tag via `as`.
 */
export function TimelineContent({
  as = "div",
  animationNum = 0,
  customVariants,
  className,
  children,
}: TimelineContentProps) {
  const Component: any = motion[as] || motion.div;

  const defaultVariants: Variants = {
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6 } },
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  };

  const variants = customVariants || defaultVariants;

  return (
    <Component
      className={cn(className)}
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
    >
      {children}
    </Component>
  );
}

export default TimelineContent;

