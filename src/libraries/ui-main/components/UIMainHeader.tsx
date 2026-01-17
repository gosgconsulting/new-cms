"use client";

import React, { useState } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface UIMainHeaderProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * UI Main Header Component
 * 
 * Navigation header with logo, menu items, and CTA
 * Uses shadcn/ui and Tailwind CSS styling
 */
const UIMainHeader: React.FC<UIMainHeaderProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];
  const [isOpen, setIsOpen] = useState(false);

  // Helper functions
  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || props[key] || "";
  };

  const getImage = (key: string = "logo") => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || props[key] || "";
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const logo = getImage("logo");
  const logoText = getText("logoText");
  const menuItems = getArray("menuItems");
  const cta = getButton("cta");

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          {logo ? (
            <a className="mr-6 flex items-center space-x-2" href="/">
              <img src={logo} alt={logoText || "Logo"} className="h-6" />
            </a>
          ) : logoText ? (
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">{logoText}</span>
            </a>
          ) : null}
        </div>
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        </button>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden">
            <div className="container flex h-14 items-center">
              <nav className="flex flex-col gap-6 text-lg font-medium">
                {menuItems.map((item: any, index: number) => (
                  <a key={index} href={item.link || "#"} className="transition-colors hover:text-foreground/80">
                    {item.label || item.text || item.content}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {menuItems.map((item: any, index: number) => (
            <a key={index} href={item.link || "#"} className="transition-colors hover:text-foreground/80">
              {item.label || item.text || item.content}
            </a>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {cta.content && (
            <a
              href={cta.link}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {cta.content}
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default UIMainHeader;
