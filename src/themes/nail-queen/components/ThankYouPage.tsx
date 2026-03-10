import React, { useEffect, useMemo } from 'react';
import { Layout } from './Layout';

interface ThankYouPageProps {
  basePath: string;
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

const WHATSAPP_PHONE = '6597916789';
const INSTAGRAM_HANDLE = 'nailqueen_bymichelletran';
const FACEBOOK_URL = 'https://www.facebook.com/nailqueenfep';

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  basePath,
  tenantName = 'Nail Queen',
  tenantSlug = 'nail-queen',
  tenantId
}) => {
  const searchParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const via = searchParams.get('via');
  const whatsappMessage = searchParams.get('message') || '';
  const instagramMessage = searchParams.get('instagram_message') || '';
  const callPhone = searchParams.get('phone') || WHATSAPP_PHONE;

  const isWhatsappRedirect = via === 'whatsapp';
  const isInstagramRedirect = via === 'instagram';
  const isFacebookRedirect = via === 'facebook';
  const isCallRedirect = via === 'call';

  useEffect(() => {
    if (isWhatsappRedirect) {
      // If message is provided, include it; otherwise just open WhatsApp
      const url = whatsappMessage 
        ? `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(whatsappMessage)}`
        : `https://wa.me/${WHATSAPP_PHONE}`;
      
      // Small delay so the thank-you page is registered (tracking) before leaving.
      const t = window.setTimeout(() => {
        window.location.href = url;
      }, 1000);

      return () => window.clearTimeout(t);
    }

    if (isInstagramRedirect) {
      // Redirect to Instagram DM
      const url = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;
      
      // Small delay so the thank-you page is registered (tracking) before leaving.
      const t = window.setTimeout(() => {
        window.location.href = url;
      }, 1000);

      return () => window.clearTimeout(t);
    }

    if (isCallRedirect) {
      // Redirect to phone dialer
      const url = `tel:+${callPhone}`;
      
      // Small delay so the thank-you page is registered (tracking) before leaving.
      const t = window.setTimeout(() => {
        window.location.href = url;
      }, 1000);

      return () => window.clearTimeout(t);
    }
  }, [isWhatsappRedirect, isInstagramRedirect, isFacebookRedirect, isCallRedirect, whatsappMessage, callPhone]);

  const handleGoHome = () => {
    // Navigate to homepage - remove /thank-you from current path
    const currentPath = window.location.pathname;
    const basePath = currentPath.replace(/\/thank-you.*$/, '');
    // If basePath is empty or just '/', navigate to theme root
    if (!basePath || basePath === '/') {
      window.location.href = '/';
    } else {
      window.location.href = basePath;
    }
  };

  if (isWhatsappRedirect) {
    return (
      <Layout basePath={basePath}>
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

              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                Redirecting to WhatsApp...
              </h1>
              <p className="text-gray-600 mb-8">
                We saved your enquiry. Opening WhatsApp with your message.
              </p>

              <div className="flex items-center justify-center gap-3 text-gray-700">
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-nail-queen-brown animate-spin" />
                <span className="text-sm">Please wait</span>
              </div>

              <div className="mt-10">
                <button
                  onClick={handleGoHome}
                  className="px-6 py-3 bg-nail-queen-brown text-white rounded-full font-medium hover:bg-nail-queen-brown/90 transition-colors"
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

  if (isInstagramRedirect) {
    return (
      <Layout basePath={basePath}>
        <div className="min-h-screen bg-white pt-24">
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                Redirecting to Instagram...
              </h1>
              <p className="text-gray-600 mb-8">
                We saved your enquiry. Opening Instagram for you to send us a DM.
              </p>

              <div className="flex items-center justify-center gap-3 text-gray-700">
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-pink-500 animate-spin" />
                <span className="text-sm">Please wait</span>
              </div>

              <div className="mt-10">
                <button
                  onClick={handleGoHome}
                  className="px-6 py-3 bg-nail-queen-brown text-white rounded-full font-medium hover:bg-nail-queen-brown/90 transition-colors"
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

  if (isFacebookRedirect) {
    return (
      <Layout basePath={basePath}>
        <div className="min-h-screen bg-white pt-24">
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                Redirecting to Facebook...
              </h1>
              <p className="text-gray-600 mb-8">
                We saved your enquiry. Opening Facebook for you to visit our page.
              </p>

              <div className="flex items-center justify-center gap-3 text-gray-700">
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                <span className="text-sm">Please wait</span>
              </div>

              <div className="mt-10">
                <button
                  onClick={handleGoHome}
                  className="px-6 py-3 bg-nail-queen-brown text-white rounded-full font-medium hover:bg-nail-queen-brown/90 transition-colors"
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

  if (isCallRedirect) {
    return (
      <Layout basePath={basePath}>
        <div className="min-h-screen bg-white pt-24">
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                Redirecting to Phone...
              </h1>
              <p className="text-gray-600 mb-8">
                We saved your enquiry. Opening phone dialer for you to call us.
              </p>

              <div className="flex items-center justify-center gap-3 text-gray-700">
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
                <span className="text-sm">Please wait</span>
              </div>

              <div className="mt-10">
                <button
                  onClick={handleGoHome}
                  className="px-6 py-3 bg-nail-queen-brown text-white rounded-full font-medium hover:bg-nail-queen-brown/90 transition-colors"
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
    <Layout basePath={basePath}>
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
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Thank You for Contacting Us!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We've received your message and will get back to you soon.
            </p>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">What happens next?</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-nail-queen-brown mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Our team will review your booking request</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-nail-queen-brown mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>We'll respond via email or phone within 24 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-nail-queen-brown mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>We'll confirm your appointment details</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoHome}
                className="px-6 py-3 bg-nail-queen-brown text-white rounded-full font-medium hover:bg-nail-queen-brown/90 transition-colors"
              >
                Return to Homepage
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 border-2 border-nail-queen-brown bg-white text-nail-queen-brown rounded-full font-medium hover:bg-nail-queen-brown/10 transition-colors"
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
