import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useThemeBranding } from '../../../hooks/useThemeSettings';
import { getSiteName, getLogoSrc } from '../utils/settings';

interface ThankYouPageProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  tenantName = 'ACATR Business Services',
  tenantSlug = 'landingpage',
  tenantId
}) => {
  const { branding } = useThemeBranding(tenantSlug, tenantId || 'tenant-2960b682');
  
  const siteName = getSiteName(branding, tenantName);
  const logoSrc = getLogoSrc(branding);

  const handleGoHome = () => {
    // Navigate to homepage - remove /thank-you from current path
    const currentPath = window.location.pathname;
    const basePath = currentPath.replace(/\/thank-you$/, '');
    // If basePath is empty or just '/', navigate to theme root
    if (!basePath || basePath === '/') {
      window.location.href = '/';
    } else {
      window.location.href = basePath;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
      />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Thank You for Contacting Us!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            We've received your message and will get back to you within 4 hours.
          </p>

          {/* Additional Information */}
          {/* <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold mb-4">What happens next?</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Our ACRA-registered filing agents will review your inquiry</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>We'll respond via email or phone within 4 hours during business hours</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>We'll provide expert guidance on your Singapore business needs</span>
              </li>
            </ul>
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="px-6 py-3 bg-gradient-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Return to Homepage
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-input bg-background text-foreground rounded-md font-medium hover:bg-muted transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>

      <Footer 
        tenantName={siteName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        companyDescription="Empowering businesses with professional, efficient, and scalable support. Your trusted partner for business success from day one."
      />
    </div>
  );
};
