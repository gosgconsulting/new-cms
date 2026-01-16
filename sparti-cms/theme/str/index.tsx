import React, { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './theme.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ProgramsSection from './components/ProgramsSection';
import GallerySection from './components/GallerySection';
import TestimonialsSection from './components/TestimonialsSection';
import TeamSection from './components/TeamSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import { ContactFormDialog } from '../landingpage/components/ContactFormDialog';
import { ThankYouPage } from '../landingpage/components/ThankYouPage';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

const STRTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'ACATR Business Services',
  tenantSlug = 'str',
  tenantId
}) => {
  const location = useLocation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const siteName = tenantName;
  const logoSrc = null;

  // Favicon stays consistent with STR styling if set via branding in future
  useEffect(() => {
    // no-op for now; favicon handled by site settings if present
  }, []);

  const isThankYouPage =
    location.pathname === '/thank-you' ||
    location.pathname.endsWith('/thank-you') ||
    location.pathname.includes('/thank-you');

  if (isThankYouPage) {
    return <ThankYouPage tenantName={siteName} tenantSlug={tenantSlug} tenantId={tenantId ?? undefined} />;
  }

  return (
    <div className="str-theme min-h-screen bg-background text-foreground">
      <Header
        tenantName={siteName}
        logoSrc={logoSrc}
        onContactClick={() => setIsContactOpen(true)}
      />

      <main>
        <HeroSection
          title="Singapore Business Setup In 24 Hours - ACRA Registered"
          description="ACRA-registered filing agents providing complete Singapore company incorporation, professional accounting services, and 100% compliance guarantee."
          address={[
            '38 North Canal Rd',
            'Singapore',
            '059294'
          ]}
          onPrimaryClick={() => setIsContactOpen(true)}
        />

        <AboutSection
          title="About us"
          description="Professional incorporation and compliance services: we handle ACRA registration, secretarial support, IRAS filings and bookkeeping so you can focus on growth."
        />

        <ProgramsSection
          onContactClick={() => setIsContactOpen(true)}
        />

        <GallerySection />

        <TestimonialsSection />

        <TeamSection />

        <FAQSection />
      </main>

      <Footer tenantName={siteName} tenantSlug={tenantSlug} />

      <ContactFormDialog isOpen={isContactOpen} onOpenChange={setIsContactOpen}>
        <div />
      </ContactFormDialog>
    </div>
  );
};

export default STRTheme;