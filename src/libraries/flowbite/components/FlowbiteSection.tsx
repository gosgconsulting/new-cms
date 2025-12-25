"use client";

import React, { ReactNode } from "react";

export type FlowbiteSectionProps = {
  className?: string;
  containerClassName?: string;
  paddingY?: string;        // e.g., 'py-10'
  paddingX?: string;        // e.g., 'px-4 md:px-6'
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  align?: "left" | "center";
  title?: string | null;
  subtitle?: string | null;
  children?: ReactNode;
  headerClassName?: string;
};

const maxWidthToClass: Record<NonNullable<FlowbiteSectionProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl"
};

const FlowbiteSection: React.FC<FlowbiteSectionProps> = ({
  className = "",
  containerClassName = "",
  paddingY = "py-10",
  paddingX = "px-4 md:px-6",
  maxWidth = "6xl",
  align = "center",
  title = null,
  subtitle = null,
  headerClassName = "",
  children
}) => {
  const sectionCls = ["w-full", paddingY, paddingX, className].filter(Boolean).join(" ");
  const containerCls = ["mx-auto", maxWidthToClass[maxWidth], containerClassName].filter(Boolean).join(" ");
  const headerAlign = align === "center" ? "text-center" : "text-left";

  return (
    <section className={sectionCls}>
      <div className={containerCls}>
        {(title || subtitle) && (
          <div className={["mb-4", headerAlign, headerClassName].filter(Boolean).join(" ")}>
            {title ? <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2> : null}
            {subtitle ? <p className="mt-2 text-sm md:text-base text-gray-500">{subtitle}</p> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default FlowbiteSection;