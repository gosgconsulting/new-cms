"use client";

import React, { useState } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface TailgridsHeaderProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Tailgrids Header Component
 * 
 * Navigation header with logo, menu items, and CTA
 * Uses Tailgrids/Tailwind CSS styling
 */
const TailgridsHeader: React.FC<TailgridsHeaderProps> = ({
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
    <header className={`bg-white ${className}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          {logo ? (
            <a href="/" className="-m-1.5 p-1.5">
              <img className="h-8" src={logo} alt={logoText || "Logo"} />
            </a>
          ) : logoText ? (
            <a href="/" className="-m-1.5 p-1.5">
              <span className="text-xl font-semibold">{logoText}</span>
            </a>
          ) : null}
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {menuItems.map((item: any, index: number) => (
            <a key={index} href={item.link || "#"} className="text-sm font-semibold leading-6 text-gray-900">
              {item.label || item.text || item.content}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {cta.content && (
            <a href={cta.link} className="text-sm font-semibold leading-6 text-gray-900">
              {cta.content} <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>
      </nav>
      {isOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-10"></div>
          <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              {logoText && <a href="/" className="-m-1.5 p-1.5"><span className="text-xl font-semibold">{logoText}</span></a>}
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {menuItems.map((item: any, index: number) => (
                    <a key={index} href={item.link || "#"} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                      {item.label || item.text || item.content}
                    </a>
                  ))}
                </div>
                {cta.content && (
                  <div className="py-6">
                    <a href={cta.link} className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                      {cta.content}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TailgridsHeader;
