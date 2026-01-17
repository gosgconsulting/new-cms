"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { getAvailableLibraries, getDefaultLibraryId } from "@/config/libraryRegistry";
import type { DesignSystemMetadata } from "@/config/designSystemMetadata";
import ScopedDesignSystem from "@/components/design-system/ScopedDesignSystem";

/**
 * Design Systems Page
 *
 * Unified, dynamic design systems viewer that auto-discovers components
 * and themes from registered design systems.
 */
const DesignSystems: React.FC = () => {
  const availableLibraries = getAvailableLibraries();
  const defaultLibraryId = getDefaultLibraryId();
  
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>(defaultLibraryId);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");
  const [metadata, setMetadata] = useState<DesignSystemMetadata | null>(null);
  const previousMetadataRef = useRef<DesignSystemMetadata | null>(null);

  // Load metadata and styles for selected design system
  useEffect(() => {
    const selectedLibrary = availableLibraries.find((lib) => lib.id === selectedLibraryId);
    if (selectedLibrary) {
      const meta = selectedLibrary.getMetadata();
      
      // Unload previous design system styles
      if (previousMetadataRef.current && previousMetadataRef.current.id !== meta.id) {
        previousMetadataRef.current.unloadStyles();
      }
      
      // Load new design system styles
      meta.loadStyles().catch((error) => {
        console.warn(`[DesignSystems] Failed to load styles for ${meta.id}:`, error);
      });
      
      setMetadata(meta);
      previousMetadataRef.current = meta;
      
      // Initialize theme from localStorage or use first theme
      const themes = meta.getThemes();
      if (themes.length > 0) {
        const storageKey = `${selectedLibraryId}-theme`;
        try {
          const saved = localStorage.getItem(storageKey);
          const initialTheme = saved && themes.find(t => t.id === saved) 
            ? saved 
            : themes[0].id;
          setSelectedThemeId(initialTheme);
          meta.applyTheme(initialTheme);
        } catch {
          setSelectedThemeId(themes[0].id);
          meta.applyTheme(themes[0].id);
        }
      }
    }
    
    // Cleanup: unload styles on unmount
    return () => {
      if (previousMetadataRef.current) {
        previousMetadataRef.current.unloadStyles();
      }
    };
  }, [selectedLibraryId, availableLibraries]);

  // Apply theme when it changes
  useEffect(() => {
    if (metadata && selectedThemeId) {
      metadata.applyTheme(selectedThemeId);
      const storageKey = `${selectedLibraryId}-theme`;
      try {
        localStorage.setItem(storageKey, selectedThemeId);
      } catch {}
    }
  }, [selectedThemeId, metadata, selectedLibraryId]);

  const themes = useMemo(() => {
    return metadata ? metadata.getThemes() : [];
  }, [metadata]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!metadata) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Design Systems</h1>
        <p className="text-gray-600">Loading design system metadata...</p>
      </div>
    );
  }

  const SectionComponent = metadata.getSectionComponent();

  return (
    <div className="w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div>
          <h2 className="text-lg font-semibold">Design Systems • {metadata.label}</h2>
          <p className="text-sm text-gray-500">
            {metadata.description || `Component library for ${metadata.label} design system`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Design System Selector */}
          {availableLibraries.length > 1 && (
            <>
              <span className="text-sm text-gray-600">Design System:</span>
              <select
                value={selectedLibraryId}
                onChange={(e) => setSelectedLibraryId(e.target.value)}
                className="w-[180px] appearance-none rounded-md border px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableLibraries.map((lib) => (
                  <option key={lib.id} value={lib.id}>
                    {lib.label}
                  </option>
                ))}
              </select>
            </>
          )}
          
          {/* Theme Selector */}
          {themes.length > 0 && (
            <>
              <span className="text-sm text-gray-600">Theme:</span>
              <div className="relative">
                <select
                  value={selectedThemeId}
                  onChange={(e) => setSelectedThemeId(e.target.value)}
                  className="w-[180px] appearance-none rounded-md border px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Left: Sidebar */}
        <aside className="hidden lg:block sticky top-0 h-[calc(100vh-64px)] w-64 min-w-64 max-w-64 border-r bg-white p-4 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Components</div>
          <nav className="space-y-1">
            {metadata.components.map((component) => (
              <button
                key={component.id}
                onClick={() => handleScrollTo(component.id)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm transition-colors"
              >
                {component.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right: Content */}
        <div className="flex-1 p-6 space-y-10">
          {metadata.components.map((component) => (
            <SectionComponent key={component.id} title={component.name} id={component.id}>
              <div className="mb-4">
                <p className="text-sm text-gray-600">{component.description}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <ScopedDesignSystem
                  designSystemId={metadata.id}
                >
                  {metadata.getComponentPreview(component.sampleSchema)}
                </ScopedDesignSystem>
              </div>
            </SectionComponent>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignSystems;
