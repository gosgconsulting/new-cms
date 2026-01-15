import React, { useMemo, useEffect, useState } from 'react';
import './theme.css';
import { useThemeBranding, useThemeStyles } from '../../hooks/useThemeSettings';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ValueSection from './components/ValueSection';
import WhySection from './components/WhySection';
import WhoSection from './components/WhoSection';
import ApproachSection from './components/ApproachSection';
import CoachSection from './components/CoachSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import { ContactFormDialog } from './components/ContactFormDialog';
import { ThankYouPage } from './components/ThankYouPage';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string | null;
}

const STRFitnessTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'STR Fitness',
  tenantSlug = 'strfitness',
  tenantId
}) => {
  const location = useLocation();
  const effectiveTenantId = useMemo(() => {
    if (tenantId) return tenantId;
    if (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) {
      return (window as any).__CMS_TENANT__;
    }
    return null;
  }, [tenantId]);

  const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding(tenantSlug, effectiveTenantId ?? undefined);
  const { styles, loading: stylesLoading, error: stylesError } = useThemeStyles(tenantSlug, effectiveTenantId ?? undefined);

  const siteName = branding?.site_name || tenantName;
  const logoSrc = branding?.site_logo || null;

  useEffect(() => {
    const favicon = branding?.site_favicon || null;
    if (!favicon) return;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [branding?.site_favicon]);

  if (brandingLoading || stylesLoading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 theme-primary-border"></div>
          <p className="text-muted-foreground">Loading theme...</p>
        </div>
      </div>
    );
  }

  if (brandingError || stylesError) {
    if (brandingError) console.warn('[strfitness-theme] Branding load error:', brandingError);
    if (stylesError) console.warn('[strfitness-theme] Styles load error:', stylesError);
  }

  const [isContactOpen, setIsContactOpen] = useState(false);

  const isThankYouPage =
    location.pathname === '/thank-you' ||
    location.pathname.endsWith('/thank-you') ||
    location.pathname.includes('/thank-you');

  if (isThankYouPage) {
    return <ThankYouPage tenantName={siteName} />;
  }

  return (
    <div className="min-h-screen theme-bg text-foreground flex flex-col">
      <Header tenantName={siteName} tenantSlug={tenantSlug} logoSrc={logoSrc} onContactClick={() => setIsContactOpen(true)} />
      <main className="flex-1">
        <HeroSection onPrimaryClick={() => setIsContactOpen(true)} />
        <ValueSection />
        <WhySection />
        <WhoSection />
        <ApproachSection />
        <CoachSection />
        <CTASection onPrimaryClick={() => setIsContactOpen(true)} />
      </main>
      <Footer tenantName={siteName} />
      <ContactFormDialog isOpen={isContactOpen} onOpenChange={setIsContactOpen}>
        <div />
      </ContactFormDialog>
    </div>
  );
};

export default STRFitnessTheme;