"use client";

import React from 'react';
import FlowbitePainPointSection from '@/libraries/flowbite/components/FlowbitePainPointSection';
import type { ComponentSchema } from '../../../types/schema';

/**
 * Wrapper component for FlowbitePainPointSection (Challenge)
 * Adapts DynamicPageRenderer props (which passes items) to Flowbite component's expected format (component prop)
 */
const FlowbitePainPointSectionWrapper: React.FC<{ items?: any[] }> = ({ items = [] }) => {
  const componentSchema: ComponentSchema = {
    type: 'flowbite-pain-point-section',
    props: {},
    items: items,
  };
  return <FlowbitePainPointSection component={componentSchema} />;
};

export default FlowbitePainPointSectionWrapper;
