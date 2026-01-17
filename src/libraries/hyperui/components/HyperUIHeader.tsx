"use client";

import React, { useState } from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface HyperUIHeaderProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * HyperUI Header Component
 * 
 * Navigation header with logo, menu items, and CTA
 * Uses HyperUI/Tailwind CSS v4 styling
 */
const HyperUIHeader: React.FC<HyperUIHeaderProps> = ({
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
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <nav className="max-w-screen-xl px-4 py-4 mx-auto lg:px-6 lg:py-6">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          {logo ? (
            <img src={logo} alt={logoText || "Logo"} className="h-8" />
          ) : logoText ? (
            <a href="/" className="flex items-center">
              <span className="self-center text-xl font-semibold whitespace-nowrap">{logoText}</span>
            </a>
          ) : null}
          
          <div className="flex items-center lg:order-2">
            {cta.content && (
              <a
                href={cta.link}
                className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none"
              >
                {cta.content}
              </a>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className={`${isOpen ? "block" : "hidden"} justify-between items-center w-full lg:flex lg:w-auto lg:order-1`}>
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              {menuItems.map((item: any, index: number) => (
                <li key={index}>
                  <a
                    href={item.link || "#"}
                    className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0"
                  >
                    {item.label || item.text || item.content}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default HyperUIHeader;
