"use client";

import React, { useEffect } from 'react';
import ModernHeroSection from './ModernHeroSection';
import type { ComponentSchema } from '../../../types/schema';

/**
 * Wrapper component for BannerSection (Hero)
 * Adapts DynamicPageRenderer props (which passes items) to BannerSection's expected format (component prop)
 */
const FlowbiteBannerSectionWrapper: React.FC<{ items?: any[]; onContactClick?: () => void; onPopupOpen?: (popupName: string) => void }> = ({ items = [], onContactClick, onPopupOpen }) => {
  // Extract person image from items (if provided)
  const getImage = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || "";
  };
  
  const personImage = getImage("personImage") || getImage("image") || getImage("heroImage") || "";
  
  // Intercept clicks on buttons with #contact links to open modal
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('a.btn-cta, button.btn-cta');
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
    type: 'banner-section',
    props: {
      personImage: personImage || "/theme/gosgconsulting/assets/hero-person.png",
    },
    items: items,
  };
  return <ModernHeroSection component={componentSchema} onContactClick={onContactClick} onPopupOpen={onPopupOpen} />;
};

export default FlowbiteBannerSectionWrapper;
