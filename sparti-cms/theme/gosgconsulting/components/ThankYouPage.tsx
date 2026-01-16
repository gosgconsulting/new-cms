import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useThemeBranding } from '../../../hooks/useThemeSettings';
import { getSiteName, getLogoSrc, getSiteDescription } from '../utils/settings';

interface ThankYouPageProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  tenantName = 'GO SG Consulting',
  tenantSlug = 'gosgconsulting',
  tenantId
}) => {
  const { branding } = useThemeBranding(tenantSlug, tenantId || 'tenant-gosg');
  
  // Get settings from database with fallback to defaults using utility functions
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
    <div className="min-h-screen bg-white">
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
          <h1 className="text-4xl font-bold mb-4 text-slate-900">
            Thank You for Contacting Us!
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            We've received your message and will get back to you soon.
          </p>

          {/* Additional Information */}
          <div className="bg-violet-50 rounded-lg p-6 mb-8 text-left border border-violet-100">
            <h2 className="text-lg font-semibold mb-4 text-violet-900">What happens next?</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brandPurple mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Our digital marketing experts will review your inquiry</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brandPurple mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>We'll respond via email or phone soon</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brandPurple mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>We'll provide expert guidance on your digital marketing needs</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="px-6 py-3 bg-brandPurple text-white rounded-2xl font-semibold hover:bg-violet-700 transition-colors"
            >
              Return to Homepage
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-violet-200 bg-white text-violet-700 rounded-2xl font-semibold hover:bg-violet-50 transition-colors"
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
        companyDescription={getSiteDescription(branding, "Full-stack digital growth solution helping brands grow their revenue and leads through comprehensive digital marketing services.")}
      />
    </div>
  );
};
