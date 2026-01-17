"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteBlogSidebarProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Blog Sidebar Component
 * 
 * Sidebar with categories for blog filtering
 * Following Diora pattern for data extraction
 */
const FlowbiteBlogSidebar: React.FC<FlowbiteBlogSidebarProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper function to get array data
  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  // Get categories from items array or props
  const categories = getArray("categories") || props.categories || [
    "All",
    "SEO Strategy",
    "Local SEO",
    "Technical SEO",
    "Content Marketing",
    "Link Building",
    "Mobile SEO"
  ];

  // Get title
  const getHeading = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading"
    ) as any;
    return item?.content || "";
  };

  const title = getHeading("title") || props.title || "Categories";
  const selectedCategory = props.selectedCategory || "all";

  return (
    <aside className={`lg:w-64 flex-shrink-0 ${className}`}>
      <Card className="sticky top-8">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <nav className="space-y-1">
          {categories.map((category: string | { name: string; slug?: string }, index: number) => {
            const categoryName = typeof category === "string" ? category : category.name;
            const categorySlug = typeof category === "string" 
              ? (category === "All" ? "all" : category.toLowerCase().replace(/\s+/g, "-"))
              : (category.slug || category.name.toLowerCase().replace(/\s+/g, "-"));
            
            const isActive = selectedCategory === categorySlug || 
              (selectedCategory === "all" && categoryName === "All");

            return (
              <button
                key={index}
                className={`w-full text-left px-4 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {categoryName}
              </button>
            );
          })}
        </nav>
      </Card>
    </aside>
  );
};

export default FlowbiteBlogSidebar;

