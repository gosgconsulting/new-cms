"use client";

import React from 'react';
import FlowbiteWhatsIncludedSection from '@/libraries/flowbite/components/FlowbiteWhatsIncludedSection';
import type { ComponentSchema } from '../../../types/schema';

/**
 * Wrapper component for FlowbiteWhatsIncludedSection
 * Adapts DynamicPageRenderer props (which passes items) to Flowbite component's expected format (component prop)
 * Also applies custom styling for gosgconsulting theme
 */
const FlowbiteWhatsIncludedSectionWrapper: React.FC<{ items?: any[] }> = ({ items = [] }) => {
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
