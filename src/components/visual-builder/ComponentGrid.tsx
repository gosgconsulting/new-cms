"use client";

import React from "react";
import { Search, Eye } from "lucide-react";
import { Button } from "../ui/button";

export interface RegistryEntry {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  type?: string;
  [key: string]: any;
}

export interface ComponentGridProps {
  items: RegistryEntry[];
  query: string;
  onQueryChange: (query: string) => void;
  onViewClick: (entry: RegistryEntry) => void;
  placeholder?: string;
}

/**
 * ComponentGrid Component
 * Displays a grid of component cards with search functionality
 */
export const ComponentGrid: React.FC<ComponentGridProps> = ({
  items,
  query,
  onQueryChange,
  onViewClick,
  placeholder = "Search master components...",
}) => {
  return (
    <div className="w-full p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((entry) => (
          <div key={entry.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="p-4">
              <h4 className="text-sm font-semibold">{entry.title || entry.id}</h4>
              {entry.description ? (
                <p className="mt-1 text-xs text-gray-600">{entry.description}</p>
              ) : null}
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                  {entry.id}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => onViewClick(entry)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-sm text-gray-500">
            No components match "{query}".
          </div>
        )}
      </div>
    </div>
  );
};

