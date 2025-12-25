"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import type { Tenant } from "../../services/tenantService";

export interface TenantSelectorProps {
  tenants: Tenant[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}

/**
 * TenantSelector Component
 * Reusable component for selecting and navigating between tenants
 */
export const TenantSelector: React.FC<TenantSelectorProps> = ({
  tenants,
  currentIndex,
  onSelect,
  onPrev,
  onNext,
  disabled = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentTenant = tenants[currentIndex] || null;

  const handleSelect = (idx: number) => {
    onSelect(idx);
    setMenuOpen(false);
  };

  if (tenants.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">No tenants available</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onPrev}
        disabled={disabled || tenants.length <= 1}
        aria-label="Previous tenant"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="h-8 pl-3 pr-2"
          onClick={() => setMenuOpen((v) => !v)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-label="Select tenant"
        >
          <span className="mr-2 max-w-[160px] truncate">
            {currentTenant?.name || "Select tenant"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>

        {menuOpen && tenants.length > 0 ? (
          <div
            role="listbox"
            className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-md border bg-white shadow-md"
          >
            <ul className="max-h-64 overflow-auto py-1">
              {tenants.map((t, idx) => (
                <li key={t.id}>
                  <button
                    className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                      idx === currentIndex ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleSelect(idx)}
                  >
                    <span className="truncate">{t.name}</span>
                    {t.slug ? (
                      <span className="ml-2 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                        {t.slug}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onNext}
        disabled={disabled || tenants.length <= 1}
        aria-label="Next tenant"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

