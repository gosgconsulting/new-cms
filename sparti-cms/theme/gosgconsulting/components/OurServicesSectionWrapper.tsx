"use client";

import React from 'react';
import OurServicesSection from './OurServicesSection';

/**
 * Wrapper component for OurServicesSection
 * Adapts DynamicPageRenderer props (which passes items) to OurServicesSection's expected format
 */
const OurServicesSectionWrapper: React.FC<{ items?: any[]; tenantSlug?: string }> = ({ items = [], tenantSlug }) => {
  // Default to 'gosgconsulting' if tenantSlug is not provided
  const themeSlug = tenantSlug || 'gosgconsulting';
  return <OurServicesSection themeSlug={themeSlug} />;
};

export default OurServicesSectionWrapper;
