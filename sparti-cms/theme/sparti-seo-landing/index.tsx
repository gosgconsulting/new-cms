import React from 'react';
import './theme.css';
import HeroSection from './components/HeroSection';
import WorkflowSection from './components/WorkflowSection';
import ComparisonSection from './components/ComparisonSection';
import { InteractiveSEOSection } from './components/InteractiveSEOSection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';
import SpartiLogo from './components/ui/SpartiLogo';
import Button from './components/ui/Button';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

/**
 * Sparti SEO Landing Page Theme
 * A modern, conversion-optimized landing page for AI-powered SEO automation
 * with interactive features, pricing tables, and compelling testimonials
 */
const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'Sparti', 
  tenantSlug = 'sparti-seo-landing' 
}) => {
  const handleGetStarted = () => {
    // Redirect to external Sparti app
    window.location.href = 'https://app.sparti.ai/seo-copilot-trial';
  };

  // Asset paths for the theme - using tenantSlug for flexibility
  const logoSrc = `/theme/${tenantSlug}/assets/logos/sparti-logo-light.png`;
  const heroBackgroundSrc = `/theme/${tenantSlug}/assets/hero-background.jpg`;
  
  // Workflow section images
  const keywordImages = [
    { src: `/theme/${tenantSlug}/assets/keywords-explorer.png`, alt: 'Keywords Explorer Interface' },
    { src: `/theme/${tenantSlug}/assets/keyword-table.png`, alt: 'Keywords Table with Search Volume' }
  ];

  const topicsImages = [
    { src: `/theme/${tenantSlug}/assets/topics-research.png`, alt: 'Topics Research Management' },
    { src: `/theme/${tenantSlug}/assets/source-information.png`, alt: 'Source Information from Google Results' }
  ];

  const imageGenerationImages = [
    { src: `/theme/${tenantSlug}/assets/featured-image-placeholder.png`, alt: 'Featured Image Management Modal' },
    { src: `/theme/${tenantSlug}/assets/article-preview-placeholder.png`, alt: 'Article Preview with Generated Image' }
  ];

  // Interactive SEO section images
  const seoFeatureImages = {
    keywordAnalysis: `/theme/${tenantSlug}/assets/keyword-analysis.png`,
    editTopicAI: `/theme/${tenantSlug}/assets/edit-topic-ai.png`,
    articleGeneration: `/theme/${tenantSlug}/assets/article-generation.png`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Navigation */}
      <nav className="w-full py-4 px-6 border-b border-border/50 glass bg-background/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <SpartiLogo size="md" showText tenantSlug={tenantSlug} />
          <div className="flex items-center gap-4">
            <Button onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection 
        tenantName={tenantName}
        heroBackgroundSrc={heroBackgroundSrc}
        onGetStarted={handleGetStarted}
      />

      {/* Workflow Section - "SEO is more important than ever" + Features */}
      <WorkflowSection 
        keywordImages={keywordImages}
        topicsImages={topicsImages}
        imageGenerationImages={imageGenerationImages}
        tenantSlug={tenantSlug}
        onGetStarted={handleGetStarted}
      />

      {/* Comparison Section - Sparti vs Generic AI */}
      <ComparisonSection 
        onGetStarted={handleGetStarted}
      />

      {/* Interactive SEO Section */}
      <InteractiveSEOSection 
        seoFeatureImages={seoFeatureImages}
        tenantSlug={tenantSlug}
      />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection 
        onGetStarted={handleGetStarted}
      />

      {/* Footer */}
      <Footer 
        tenantName={tenantName}
        tenantSlug={tenantSlug}
      />
    </div>
  );
};

export default TenantLanding;