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

const FlowbiteSection: React.FC<FlowbiteSectionProps> = ({ id, title, subtitle, containerClassName = "", className = "", children }) => {
  return (
    <section id={id} className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className="flex flex-col gap-1">
          {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}
          {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
        </div>
      )}
      <div className={containerClassName}>
        {children}
      </div>
    </section>
  );
};

export default FlowbiteSection;