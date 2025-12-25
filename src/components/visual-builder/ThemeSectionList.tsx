"use client";

import React, { memo, useMemo, useCallback, useEffect, useState } from "react";
import { GripVertical } from "lucide-react";

interface ThemeSection {
  id: string;
  label: string;
  element: HTMLElement | null;
}

interface ThemeSectionListProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

const ThemeSectionList: React.FC<ThemeSectionListProps> = ({ containerRef }) => {
  const [sections, setSections] = useState<ThemeSection[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Extract sections from the theme's DOM
  useEffect(() => {
    const extractSections = () => {
      const container = containerRef?.current || document.body;
      if (!container) return;
      
      const foundSections: ThemeSection[] = [];
      const seenIds = new Set<string>();

      // First, try to find elements with IDs (most reliable)
      const elementsWithIds = container.querySelectorAll('[id]');
      elementsWithIds.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const id = htmlEl.id;
        if (!id || seenIds.has(id)) return;
        
        // Skip very generic IDs
        if (id === 'root' || id === 'app' || id.startsWith('__')) return;
        
        seenIds.add(id);
        
        // Extract label from id
        let label = id;
        if (id.includes('-')) {
          label = id.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        } else if (id.includes('_')) {
          label = id.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        } else {
          label = id.charAt(0).toUpperCase() + id.slice(1);
        }

        foundSections.push({
          id,
          label,
          element: htmlEl
        });
      });

      // Also look for semantic section elements
      const sectionElements = container.querySelectorAll('section, header, footer, main > *');
      sectionElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const id = htmlEl.id || htmlEl.getAttribute('id');
        const className = htmlEl.className || '';
        const tagName = htmlEl.tagName.toLowerCase();
        
        // Skip if already found by ID
        if (id && seenIds.has(id)) return;
        
        // Generate ID from element
        let sectionId = id;
        if (!sectionId) {
          // Try to extract from class name
          const classMatch = className.match(/(?:^|\s)([a-z]+-?section|section-[a-z]+)/i);
          if (classMatch) {
            sectionId = classMatch[1].toLowerCase().replace(/-?section-?/gi, '');
          } else {
            // Use tag name and index
            const index = Array.from(container.querySelectorAll(tagName)).indexOf(htmlEl);
            sectionId = `${tagName}-${index}`;
          }
        }
        
        if (seenIds.has(sectionId)) return;
        seenIds.add(sectionId);
        
        // Generate label
        let label = sectionId;
        if (tagName === 'header') label = 'Header';
        else if (tagName === 'footer') label = 'Footer';
        else if (sectionId.includes('-')) {
          label = sectionId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        } else {
          label = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        }

        foundSections.push({
          id: sectionId,
          label,
          element: htmlEl
        });
      });

      // Sort sections by their position in the DOM
      foundSections.sort((a, b) => {
        if (!a.element || !b.element) return 0;
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });

      setSections(foundSections);
    };

    // Extract sections after a short delay to allow theme to render
    const timeoutId = setTimeout(extractSections, 500);
    
    // Also try to extract on DOM mutations
    const observer = new MutationObserver(() => {
      extractSections();
    });

    if (containerRef?.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id', 'class']
      });
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [containerRef]);

  const handleSelect = useCallback((section: ThemeSection, index: number) => {
    setSelectedIndex(index);
    
    if (section.element) {
      section.element.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      });
      
      // Highlight the section briefly
      section.element.style.outline = '2px solid #3b82f6';
      section.element.style.outlineOffset = '2px';
      setTimeout(() => {
        if (section.element) {
          section.element.style.outline = '';
          section.element.style.outlineOffset = '';
        }
      }, 1000);
    } else {
      // Try to find element by ID
      const el = document.getElementById(section.id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, []);

  return (
    <aside className="sticky top-0 h-screen w-64 min-w-64 max-w-64 border-r bg-white dark:bg-gray-800 p-4 overflow-y-auto shadow-sm">
      <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Sections</h3>
      {sections.length > 0 ? (
        <div className="space-y-1">
          {sections.map((section, idx) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSelect(section, idx)}
              className={`w-full text-left px-4 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedIndex === idx
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'hover:bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate text-sm font-medium">{section.label}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-4 text-center">
          No sections detected. Sections will appear automatically as the theme loads.
        </div>
      )}
    </aside>
  );
};

export default memo(ThemeSectionList);

