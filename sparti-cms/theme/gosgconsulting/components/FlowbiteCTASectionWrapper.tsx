"use client";

import React, { useEffect } from 'react';
import FlowbiteCTASection from '@/libraries/flowbite/components/FlowbiteCTASection';
import type { ComponentSchema } from '../../../types/schema';

/**
 * Wrapper component for FlowbiteCTASection
 * Adapts DynamicPageRenderer props (which passes items) to Flowbite component's expected format (component prop)
 */
const FlowbiteCTASectionWrapper: React.FC<{ items?: any[]; onContactClick?: () => void; onPopupOpen?: (popupName: string) => void }> = ({ items = [], onContactClick, onPopupOpen }) => {
  // Intercept clicks on buttons with #contact links to open modal
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('a.btn-cta, a.btn-cta-light, a.btn-cta-secondary, button.btn-cta');
      if (button) {
        const href = (button as HTMLAnchorElement).href;
        if (href && (href.includes('#contact') || href.endsWith('#contact'))) {
          e.preventDefault();
          if (onPopupOpen) {
            onPopupOpen('contact');
          } else if (onContactClick) {
            onContactClick();
          }
        }
      }
    };

    document.addEventListener('click', handleButtonClick);
    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, [onContactClick, onPopupOpen]);

  const componentSchema: ComponentSchema = {
    type: 'flowbite-cta-section',
    props: {
      ctaVariant: "primary", // Uses brand-primary color via CSS variables
      ctaFullWidth: false,
    },
    items: items,
  };
  // FlowbiteCTASection already uses --brand-primary and --brand-secondary CSS variables
  // for gradient backgrounds, so it will automatically use branding colors
  return <FlowbiteCTASection component={componentSchema} />;
};

export default FlowbiteCTASectionWrapper;
