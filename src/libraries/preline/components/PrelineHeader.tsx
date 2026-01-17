"use client";

import React, { useState } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface PrelineHeaderProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Preline Header Component
 * 
 * Navigation header with logo, menu items, and CTA
 * Uses Preline/Tailwind CSS styling
 */
const PrelineHeader: React.FC<PrelineHeaderProps> = ({
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
    <header className={`flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full bg-white border-b border-gray-200 text-sm py-3 ${className}`}>
      <nav className="max-w-[85rem] w-full flex flex-wrap md:items-center justify-between mx-auto px-4 md:flex md:flex-nowrap md:px-6 lg:px-8" aria-label="Global">
        <div className="flex items-center">
          {logo ? (
            <img src={logo} alt={logoText || "Logo"} className="h-8" />
          ) : logoText ? (
            <a className="flex-none text-xl font-semibold" href="/">{logoText}</a>
          ) : null}
        </div>
        
        <div className="flex items-center gap-x-6">
          {menuItems.length > 0 && (
            <div className={`${isOpen ? "block" : "hidden"} md:flex md:items-center md:justify-end md:gap-5`}>
              {menuItems.map((item: any, index: number) => (
                <a
                  key={index}
                  className="font-medium text-gray-500 hover:text-gray-400"
                  href={item.link || "#"}
                >
                  {item.label || item.text || item.content}
                </a>
              ))}
            </div>
          )}
          
          {cta.content && (
            <a
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700"
              href={cta.link}
            >
              {cta.content}
            </a>
          )}
          
          <button
            type="button"
            className="md:hidden hs-collapse-toggle size-7 flex justify-center items-center text-sm font-semibold rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="hs-collapse-open:hidden size-4" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
            </svg>
            <svg className="hs-collapse-open:block hidden size-4" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default PrelineHeader;
