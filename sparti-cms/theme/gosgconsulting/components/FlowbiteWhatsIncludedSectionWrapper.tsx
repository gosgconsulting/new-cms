"use client";

import React, { useEffect } from 'react';
import FlowbiteWhatsIncludedSection from '@/libraries/flowbite/components/FlowbiteWhatsIncludedSection';
import type { ComponentSchema } from '../../../types/schema';

/**
 * Wrapper component for FlowbiteWhatsIncludedSection
 * Adapts DynamicPageRenderer props (which passes items) to Flowbite component's expected format (component prop)
 * Also applies custom styling for gosgconsulting theme
 */
const FlowbiteWhatsIncludedSectionWrapper: React.FC<{ items?: any[]; onContactClick?: () => void; onPopupOpen?: (popupName: string) => void }> = ({ items = [], onContactClick, onPopupOpen }) => {
  // Intercept clicks on buttons with #contact links to open modal
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('a.btn-cta, a.btn-cta-light, a.btn-cta-secondary, button.btn-cta');
      if (button) {
        const href = (button as HTMLAnchorElement).getAttribute('href');
        if (href === '#contact' || href?.endsWith('#contact')) {
          e.preventDefault();
          e.stopPropagation();
          if (onPopupOpen) {
            onPopupOpen('contact');
          } else if (onContactClick) {
            onContactClick();
          }
          return false;
        }
      }
    };

    // Use capture phase to intercept before default behavior
    document.addEventListener('click', handleButtonClick, true);
    return () => {
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, [onContactClick, onPopupOpen]);

  const componentSchema: ComponentSchema = {
    type: 'flowbite-whats-included-section',
    props: {},
    items: items,
  };
  return (
    <div className="gosg-growth-package-section">
      <FlowbiteWhatsIncludedSection component={componentSchema} />
    </div>
  );
};

export default FlowbiteWhatsIncludedSectionWrapper;
