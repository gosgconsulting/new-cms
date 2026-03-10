import React, { useEffect, useMemo } from 'react';
import { Layout } from './Layout';

interface ThankYouPageProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

const WHATSAPP_PHONE = '659730951';

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  tenantName = 'Sissonne Dance Academy',
  tenantSlug = 'sissonne',
  tenantId
}) => {
  const searchParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const via = searchParams.get('via');
  const whatsappMessage = searchParams.get('message') || '';

  const isWhatsappRedirect = via === 'whatsapp';

  useEffect(() => {
    if (!isWhatsappRedirect) return;

    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(whatsappMessage)}`;

    // 1 second delay so the thank-you page is registered (tracking) before leaving.
    const t = window.setTimeout(() => {
      window.location.href = url;
    }, 1000);

    return () => window.clearTimeout(t);
  }, [isWhatsappRedirect, whatsappMessage]);

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

  if (isWhatsappRedirect) {
    return (
      <Layout tenantSlug={tenantSlug}>
        <div className="min-h-screen bg-white pt-24">
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3 text-dance-black">
                Redirecting to WhatsApp...
              </h1>
              <p className="text-dance-gray-700 mb-8 font-body">
                We saved your enquiry. Opening WhatsApp with your message.
              </p>

              <div className="flex items-center justify-center gap-3 text-dance-gray-700">
                <div className="h-5 w-5 rounded-full border-2 border-dance-gray-300 border-t-dance-pink animate-spin" />
                <span className="text-sm font-body">Please wait</span>
              </div>

              <div className="mt-10">
                <button
                  onClick={handleGoHome}
                  className="px-6 py-3 bg-dance-pink text-white rounded-full font-button font-medium hover:bg-dance-pink/90 transition-colors"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout tenantSlug={tenantSlug}>
      <div className="min-h-screen bg-white pt-24">
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
            <h1 className="text-4xl font-heading font-bold mb-4 text-dance-black">
              Thank You for Contacting Us!
            </h1>
            <p className="text-xl text-dance-gray-700 mb-8 font-body">
              We've received your message and will get back to you soon.
            </p>

            {/* Additional Information */}
            <div className="bg-dance-gray-50 rounded-lg p-6 mb-8 text-left border border-dance-gray-200">
              <h2 className="text-lg font-heading font-semibold mb-4 text-dance-black">What happens next?</h2>
              <ul className="space-y-3 text-dance-gray-700 font-body">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-dance-pink mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Our team will review your trial booking request</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-dance-pink mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>We'll respond via email within 24 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-dance-pink mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>We'll confirm your trial class date and time</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoHome}
                className="px-6 py-3 bg-dance-pink text-white rounded-full font-button font-medium hover:bg-dance-pink/90 transition-colors"
              >
                Return to Homepage
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 border-2 border-dance-pink bg-white text-dance-pink rounded-full font-button font-medium hover:bg-dance-pink/10 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};
