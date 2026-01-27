"use client";

import React, { useEffect } from 'react';
import FlowbiteContentSection from '@/libraries/flowbite/components/FlowbiteContentSection';
import type { ComponentSchema } from '../../../types/schema';

/**
 * Wrapper component for FlowbiteContentSection (About)
 * Adapts DynamicPageRenderer props (which passes items) to Flowbite component's expected format (component prop)
 */
const FlowbiteContentSectionWrapper: React.FC<{ items?: any[]; onContactClick?: () => void; onPopupOpen?: (popupName: string) => void }> = ({ items = [], onContactClick, onPopupOpen }) => {
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
    type: 'flowbite-content-section',
    props: {
      variant: "about",
      badge: "About us",
      imageSrc: `/theme/gosgconsulting/assets/placeholder.svg`,
      reviewLabel: "5 Star",
      reviewSub: "Review",
    },
    items: items,
  };
  return <FlowbiteContentSection component={componentSchema} />;
};

export default FlowbiteContentSectionWrapper;
