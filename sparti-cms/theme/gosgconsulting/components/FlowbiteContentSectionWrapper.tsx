"use client";

import React from 'react';
import FlowbiteContentSection from '@/libraries/flowbite/components/FlowbiteContentSection';
import type { ComponentSchema } from '../../../types/schema';

/**
 * Wrapper component for FlowbiteContentSection (About)
 * Adapts DynamicPageRenderer props (which passes items) to Flowbite component's expected format (component prop)
 */
const FlowbiteContentSectionWrapper: React.FC<{ items?: any[] }> = ({ items = [] }) => {
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
