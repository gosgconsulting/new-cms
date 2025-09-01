import React from "react";
import { AuroraHero } from "@/components/ui/futurastic-hero-section";
import VisualCMSEditor from "@/components/cms/VisualCMSEditor";

/**
 * WordPress Theme Component: Hero Section
 * 
 * Dynamic Component: Will be template-parts/home/hero.php
 * Dynamic Elements:
 * - Heading text
 * - Subtitle/description text
 * - CTA button text and URL
 * - Hero image
 * 
 * WordPress Implementation:
 * - Use ACF fields or theme customizer for all text content
 * - Use wp_get_attachment_image for the hero image
 * - Convert animations to CSS classes for WordPress compatibility
 */
const HeroSection = () => {
  return (
    <>
      <AuroraHero />

      {/* CMS Editor - Only visible to admin users */}
      <VisualCMSEditor pageId="homepage" />
    </>
  );
};

export default HeroSection;