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
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
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