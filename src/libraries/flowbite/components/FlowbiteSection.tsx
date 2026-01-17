"use client";

import React from "react";

export type FlowbiteSectionProps = {
  title?: string;
  subtitle?: string;
  containerClassName?: string;
  className?: string;
  id?: string;
  children?: React.ReactNode;
};

const FlowbiteSection: React.FC<FlowbiteSectionProps> = ({
  id,
  title,
  subtitle,
  containerClassName = "",
  className = "",
  children,
}) => {
  return (
    <section id={id} className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className="flex flex-col gap-2">
          {title ? (
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[color:var(--text-primary)]">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="text-base md:text-lg text-[color:var(--text-secondary)]">
              {subtitle}
            </p>
          ) : null}
        </div>
      )}
      <div className={containerClassName}>{children}</div>
    </section>
  );
};

export default FlowbiteSection;