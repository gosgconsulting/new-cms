"use client";

import React from "react";

export type FlyonUISectionProps = {
  title?: string;
  subtitle?: string;
  containerClassName?: string;
  className?: string;
  id?: string;
  children?: React.ReactNode;
};

const FlyonUISection: React.FC<FlyonUISectionProps> = ({
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
        <div className="flex flex-col gap-1 mb-4">
          {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}
          {subtitle ? <p className="text-sm opacity-70">{subtitle}</p> : null}
        </div>
      )}
      <div className={containerClassName}>
        {children}
      </div>
    </section>
  );
};

export default FlyonUISection;
