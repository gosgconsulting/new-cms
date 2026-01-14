import React, { useState } from 'react';
import './theme.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import CTASection from './components/CTASection';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

/**
 * Custom Theme
 * Simple hardcoded theme with minimal sections.
 */
const CustomTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'Custom',
  tenantSlug = 'custom'
}) => {
  const [contactOpen, setContactOpen] = useState(false);

  const handleContactClick = () => {
    setContactOpen(true);
    // For now, just scroll to CTA section
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        onContactClick={handleContactClick}
      />

      {/* Main content */}
      <main className="flex-1">
        <HeroSection
          title={tenantName}
          onButtonClick={handleContactClick}
        />
        <FeaturesSection />
        <CTASection onButtonClick={handleContactClick} />
      </main>

      {/* Footer */}
      <Footer tenantName={tenantName} tenantSlug={tenantSlug} />

      {/* Simple contact "open" state (no modal needed for now) */}
      {contactOpen && (
        <div className="sr-only">Contact intent captured</div>
      )}
    </div>
  );
};

export default CustomTheme;