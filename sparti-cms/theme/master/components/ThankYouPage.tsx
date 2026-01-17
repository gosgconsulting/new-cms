import React, { useEffect, useMemo } from 'react';
import Header from './Header';
import Footer from './Footer';

interface ThankYouPageProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

const WHATSAPP_PHONE = '6580246850';

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  tenantName = 'Master Template',
  tenantSlug = 'master',
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

    const t = window.setTimeout(() => {
      window.location.href = url;
    }, 700);

    return () => window.clearTimeout(t);
  }, [isWhatsappRedirect, whatsappMessage]);

  const handleGoHome = () => {
    const currentPath = window.location.pathname;
    const basePath = currentPath.replace(/\/thank-you$/, '');
    if (!basePath || basePath === '/') {
      window.location.href = '/';
    } else {
      window.location.href = basePath;
    }
  };

  const Shell: React.FC<{ title: string; description: string; children?: React.ReactNode }> = ({
    title,
    description,
    children,
  }) => (
    <div className="min-h-screen bg-(--brand-background)">
      <Header tenantName={tenantName} tenantSlug={tenantSlug} />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
            <p className="mt-3 text-gray-600">{description}</p>
            {children}
          </div>
        </div>
      </main>

      <Footer tenantName={tenantName} tenantSlug={tenantSlug} />
    </div>
  );

  if (isWhatsappRedirect) {
    return (
      <Shell
        title="Redirecting to WhatsApp..."
        description="We saved your enquiry. Opening WhatsApp with your message."
      >
        <div className="mt-8 flex items-center justify-center gap-3 text-gray-700">
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
          <span className="text-sm">Please wait</span>
        </div>

        <div className="mt-10">
          <button onClick={handleGoHome} className="btn-cta">
            Return to Homepage
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title="Thank you for contacting us!"
      description="We've received your message and will get back to you within 4 hours."
    >
      <div className="mt-8 rounded-xl border border-black/10 bg-(--brand-background-alt) p-6 text-left">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-(--brand-primary)" />
            <span>We'll review your inquiry</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-(--brand-primary)" />
            <span>We'll respond via email or phone within 4 hours</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-(--brand-primary)" />
            <span>We'll provide expert guidance on your needs</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={handleGoHome} className="btn-cta">
          Return to Homepage
        </button>
        <button
          onClick={() => window.history.back()}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-black/10 bg-white/70 px-6 font-semibold text-gray-900 hover:bg-white transition-colors"
        >
          Go Back
        </button>
      </div>
    </Shell>
  );
};
