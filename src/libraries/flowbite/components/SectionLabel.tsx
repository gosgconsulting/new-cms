import React from "react";

export type SectionLabelProps<T extends React.ElementType = "span"> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/**
 * SectionLabel
 *
 * Shared label/badge style used across sections (e.g. "About us", hero motto, etc.).
 */
export default function SectionLabel<T extends React.ElementType = "span">({
  as,
  className = "",
  children,
  ...rest
}: SectionLabelProps<T>) {
  const Comp = (as || "span") as React.ElementType;

  return (
    <Comp className={`label-section ${className}`.trim()} {...rest}>
      {children}
    </Comp>
  );
}
