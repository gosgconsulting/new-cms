"use client";

import React from 'react';
import FlowbiteFAQSection from '@/libraries/flowbite/components/FlowbiteFAQSection';
import type { ComponentSchema } from '../../../types/schema';

/**
 * Wrapper component for FlowbiteFAQSection
 * Adapts DynamicPageRenderer props (which passes items) to Flowbite component's expected format (component prop)
 */
const FlowbiteFAQSectionWrapper: React.FC<{ items?: any[] }> = ({ items = [] }) => {
  const componentSchema: ComponentSchema = {
    type: 'flowbite-faq-section',
    props: {},
    items: items,
  };
  return <FlowbiteFAQSection component={componentSchema} />;
};

export default FlowbiteFAQSectionWrapper;
