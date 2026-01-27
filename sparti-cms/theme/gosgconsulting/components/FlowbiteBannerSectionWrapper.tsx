"use client";

import React, { useEffect } from 'react';
import BannerSection from '../../master/components/BannerSection';
import type { ComponentSchema } from '../../../types/schema';

/**
 * Wrapper component for BannerSection (Hero)
 * Adapts DynamicPageRenderer props (which passes items) to BannerSection's expected format (component prop)
 */
const FlowbiteBannerSectionWrapper: React.FC<{ items?: any[]; onContactClick?: () => void; onPopupOpen?: (popupName: string) => void }> = ({ items = [], onContactClick, onPopupOpen }) => {
  // Use brand colors from CSS variables, fallback to default
  // For banner, use a darker version of primary or a dark neutral for better text contrast
  const getBrandColor = (varName: string, fallback: string) => {
    if (typeof window !== 'undefined') {
      const root = getComputedStyle(document.documentElement);
      const color = root.getPropertyValue(varName).trim();
      if (color) {
        // If we have a primary color, make it darker for banner background
        if (varName === '--brand-primary') {
          // Convert hex to RGB, darken it, convert back
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const darker = `#${Math.max(0, Math.floor(r * 0.6)).toString(16).padStart(2, '0')}${Math.max(0, Math.floor(g * 0.6)).toString(16).padStart(2, '0')}${Math.max(0, Math.floor(b * 0.6)).toString(16).padStart(2, '0')}`;
          return darker;
        }
        return color;
      }
    }
    return fallback;
  };

  // Use darker version of primary color for banner background, or fallback to dark neutral
  const backgroundColor = getBrandColor('--brand-primary', '#2A2C2E');
  
  // Intercept clicks on buttons with #contact links to open modal
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('a.btn-cta, button.btn-cta');
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
    type: 'banner-section',
    props: {
      backgroundColor: backgroundColor,
      backgroundImage: `/theme/gosgconsulting/assets/placeholder.svg`,
    },
    items: items,
  };
  return <BannerSection component={componentSchema} />;
};

export default FlowbiteBannerSectionWrapper;
