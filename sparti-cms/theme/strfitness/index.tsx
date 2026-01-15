import React, { useMemo, useEffect, useState } from 'react';
import './theme.css';
import { useThemeBranding, useThemeStyles } from '../../hooks/useThemeSettings';

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
  // Effective tenant ID (stable calculation with useMemo)
  const effectiveTenantId = useMemo(() => {
    if (tenantId) return tenantId;
    if (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) {
      return (window as any).__CMS_TENANT__;
    }
    return null;
  }, [tenantId]);

  // Hooks are called unconditionally and always in the same order
  const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding(tenantSlug, effectiveTenantId ?? undefined);
  const { styles, loading: stylesLoading, error: stylesError } = useThemeStyles(tenantSlug, effectiveTenantId ?? undefined);

  // Favicon side-effect (safe, unconditional)
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

  // Derived presentation values
  const siteName = branding?.site_name || tenantName;
  const siteTagline = branding?.site_tagline || '1‑on‑1 Personal Training';
  const logoSrc = branding?.site_logo || null;

  // Loading UI
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

  // Log errors but continue with fallbacks
  if (brandingError || stylesError) {
    if (brandingError) console.warn('[strfitness-theme] Branding load error:', brandingError);
    if (stylesError) console.warn('[strfitness-theme] Styles load error:', stylesError);
  }

  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen theme-bg text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <img src={logoSrc} alt={siteName} className="h-8 w-auto" />
            ) : (
              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                {siteName.substring(0, 1)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold">{siteName}</span>
              <span className="text-xs text-muted-foreground">{siteTagline}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContactOpen(true)}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            >
              Book a 1‑on‑1 Session
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* HERO */}
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              1‑on‑1 Personal Training for Performance and Longevity
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              Personalised coaching in a physiotherapy‑informed environment. Assessment‑led, structured, and built for long‑term results—whether you're returning from injury, preparing for competition, or investing in your health.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setContactOpen(true)}
                className="px-5 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm md:text-base"
              >
                Book a 1‑on‑1 Session
              </button>
              <a
                href="#why"
                className="px-5 py-3 rounded-md border border-border hover:bg-muted text-sm md:text-base"
              >
                Why STR
              </a>
            </div>
            {effectiveTenantId && (
              <p className="mt-4 text-xs text-muted-foreground">
                Tenant ID: {effectiveTenantId}
              </p>
            )}
          </div>
        </section>

        {/* VALUE PROPOSITION */}
        <section className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Personal Training, Not a Membership</h2>
            <p className="text-muted-foreground max-w-3xl mb-4">
              STR is a premium training space for people who want individual attention and measurable progress. Every programme starts with assessment, then we build a plan for your goals—rehabilitation, performance, or long‑term health.
            </p>
            <p className="text-muted-foreground max-w-3xl">
              No classes. No crowds. Just focused, 1‑on‑1 coaching with a clear structure and expert supervision every session.
            </p>
          </div>
        </section>

        {/* WHY 1-ON-1 AT STR */}
        <section id="why" className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Why 1‑on‑1 at STR</h2>
            <ul className="grid md:grid-cols-2 gap-4 text-sm md:text-base">
              <li className="p-4 rounded-lg border border-border/60 bg-background">Individual assessment to understand your body, history, and goals</li>
              <li className="p-4 rounded-lg border border-border/60 bg-background">Coach supervision in every session for precision and safety</li>
              <li className="p-4 rounded-lg border border-border/60 bg-background">Injury‑aware programming informed by physiotherapy principles</li>
              <li className="p-4 rounded-lg border border-border/60 bg-background">Structured progression and accountability, tracked over time</li>
              <li className="p-4 rounded-lg border border-border/60 bg-background">Personalised plans that outperform generic workouts and classes</li>
              <li className="p-4 rounded-lg border border-border/60 bg-background">Calm, private environment—focused work, no distractions</li>
            </ul>
          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Who It's For</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground max-w-3xl">
              <li>Beginners who want proper guidance and a clear plan</li>
              <li>Athletes and HYROX competitors sharpening performance</li>
              <li>Individuals returning from injury who need intelligent progressions</li>
              <li>Busy professionals who value efficient, results‑driven sessions</li>
            </ul>
          </div>
        </section>

        {/* COACHING APPROACH */}
        <section className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Coaching Approach</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-border/60 bg-background">
                <h3 className="font-medium mb-1">Assessment</h3>
                <p className="text-sm text-muted-foreground">Movement screen, training history, and goal setting to build your starting point.</p>
              </div>
              <div className="p-4 rounded-lg border border-border/60 bg-background">
                <h3 className="font-medium mb-1">Plan</h3>
                <p className="text-sm text-muted-foreground">Evidence‑based programming tailored to your needs, capacity, and timeline.</p>
              </div>
              <div className="p-4 rounded-lg border border-border/60 bg-background">
                <h3 className="font-medium mb-1">Execution</h3>
                <p className="text-sm text-muted-foreground">1‑on‑1 coaching for technique, tempo, and load—every session is supervised.</p>
              </div>
              <div className="p-4 rounded-lg border border-border/60 bg-background">
                <h3 className="font-medium mb-1">Progression</h3>
                <p className="text-sm text-muted-foreground">Measured improvements across strength, conditioning, and resilience.</p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 max-w-3xl">
              Our programming is physiotherapy‑informed and built for sustainability—no shortcuts, no gimmicks, just steady, meaningful progress.
            </p>
          </div>
        </section>

        {/* COACH CREDENTIALS (SUMMARY) */}
        <section className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Coach Credentials</h2>
            <div className="max-w-3xl space-y-3 text-muted-foreground">
              <p><span className="text-foreground font-medium">Head Coach / Physiotherapist</span> — experienced in rehabilitation and performance coaching.</p>
              <p>Qualifications: recognised physiotherapy degree, strength & conditioning certifications.</p>
              <p>Competitive background: exposure to athletic preparation and event performance.</p>
              <p>Coaching philosophy: precise, structured, and patient—designed for long‑term results.</p>
            </div>
          </div>
        </section>

        {/* LOCATION & CTA */}
        <section className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">Location</h2>
            <p className="text-muted-foreground mb-6">Private training space in Singapore. Sessions by appointment only.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setContactOpen(true)}
                className="px-5 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm md:text-base"
              >
                Book Your 1‑on‑1 Personal Training Session
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/60 bg-background">
        <div className="max-w-6xl mx-auto p-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>

      {/* Contact modal */}
      {contactOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setContactOpen(false)}>
          <div className="bg-background rounded-lg p-6 w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Book a 1‑on‑1 Session</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Thanks for your interest. Replace this with your booking or contact form.
            </p>
            <button
              onClick={() => setContactOpen(false)}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default STRFitnessTheme;