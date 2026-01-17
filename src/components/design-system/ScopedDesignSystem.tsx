"use client";

import React from "react";

interface ScopedDesignSystemProps {
  designSystemId: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Scoped Design System Wrapper
 * 
 * Wraps components with design system scoping attribute.
 * Style loading is handled by the parent (DesignSystems page or theme).
 */
const ScopedDesignSystem: React.FC<ScopedDesignSystemProps> = ({
  designSystemId,
  children,
  className = "",
}) => {
  return (
    <div
      data-design-system={designSystemId}
      className={className}
    >
      {children}
    </div>
  );
};

export default ScopedDesignSystem;
