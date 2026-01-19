import React, { useEffect, useMemo, useState } from 'react';
import './theme.css';
import { useThemeBranding, useThemeStyles } from '../../hooks/useThemeSettings';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Download,
  Globe,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string | null;
  pageSlug?: string;
}

type PageKey = 'home' | 'blog' | 'blogPost' | 'shop' | 'product' | 'service';

type ServiceKey = 'assessments' | 'academy' | 'consulting';

const SERVICES: Array<{
  key: ServiceKey;
  title: string;
  description: string;
  benefit: string;
  metric: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'assessments',
    title: 'Assessments',
    description: 'Explore world-class psychometric assessment tools to gain insights into your current and to-be talent.',
    benefit: 'Make faster, higher-confidence talent decisions with predictive insight.',
    metric: 'World-class tools',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    key: 'academy',
    title: 'Academy',
    description: 'Equip your organisation with the skills to administer assessment tools, interpret profiling outcomes and bridge performance gaps with development intervention programmes.',
    benefit: 'Scale leadership standards with consistent assessment language and tools.',
    metric: 'Build expertise',
    icon: <Users className="h-5 w-5" />,
  },
  {
    key: 'consulting',
    title: 'Services',
    description: 'Entrust the prediction of leadership potential and succession readiness for your organisation to our trained and experienced consultants.',
    benefit: 'Link leadership behaviours to outcomes with pragmatic, data-driven roadmaps.',
    metric: 'Expert consultants',
    icon: <Briefcase className="h-5 w-5" />,
  },
];

const PARTNERS = [
  {
    name: 'Hogan',
    logo: 'partner-hogan.svg',
    note: 'Leadership potential, derailers, and values for robust selection and development decisions.',
  },
  {
    name: 'Mosaic',
    logo: 'partner-mosaic.svg',
    note: 'Competency-based frameworks and analytics to standardise leadership behaviours at scale.',
  },
  {
    name: 'SMG',
    logo: 'partner-smg.svg',
    note: 'Regional delivery expertise and enabling tools for consistent rollout across Asia.',
  },
];

const RESOURCES = [
  {
    title: 'Optimal Consulting – Brochure',
    description: 'Overview of services, methodology, and delivery model.',
    file: 'optimal-consulting-brochure.pdf',
  },
  {
    title: 'Whitepaper: Building a Predictable Leadership Pipeline',
    description: 'Practical steps for measuring potential and accelerating readiness.',
    file: 'leadership-pipeline-whitepaper.pdf',
  },
  {
    title: 'Talent Optimisation Playbook (Executive Summary)',
    description: 'A quick guide to align talent strategy with business outcomes.',
    file: 'talent-optimisation-playbook.pdf',
  },
];

function normalizeSlug(input?: string) {
  return (input || '').replace(/^\/+/, '').trim();
}

function resolvePage(pageSlug?: string): { key: PageKey; param?: string } {
  const slug = normalizeSlug(pageSlug);
  if (!slug) return { key: 'home' };

  if (slug === 'blog') return { key: 'blog' };
  if (slug.startsWith('blog/')) return { key: 'blogPost', param: slug.slice('blog/'.length) };

  if (slug === 'shop') return { key: 'shop' };
  if (slug.startsWith('shop/')) return { key: 'product', param: slug.slice('shop/'.length) };

  if (slug.startsWith('services/')) {
    const serviceKey = slug.slice('services/'.length) as ServiceKey;
    return { key: 'service', param: serviceKey };
  }

  return { key: 'home' };
}

function useLeadForm(opts: { themeSlug: string; tenantId?: string | null }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<'idle' | 'success' | 'error'>('idle');

  const submit = async (payload: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message?: string;
  }) => {
    setSubmitting(true);
    setSubmitted('idle');

    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: `${opts.themeSlug}-consultation`,
          form_name: 'Consultation Request',
          tenant_id: opts.tenantId ?? undefined,
          ...payload,
        }),
      });

      if (!res.ok) throw new Error('Request failed');
      setSubmitted('success');
    } catch {
      setSubmitted('error');
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitted, submit };
}

function LeadForm({
  themeSlug,
  tenantId,
  variant = 'full',
}: {
  themeSlug: string;
  tenantId?: string | null;
  variant?: 'full' | 'compact';
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const { submitting, submitted, submit } = useLeadForm({ themeSlug, tenantId });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({ name, email, company, phone, message });
  };

  const showAllFields = variant === 'full';

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Work Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            placeholder="name@company.com"
          />
        </div>
      </div>

      {showAllFields && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Company</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Organisation" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Phone (optional)</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+65 …" />
          </div>
        </div>
      )}

      {showAllFields && (
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">What are you trying to achieve?</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="E.g., identify high potentials, accelerate readiness, strengthen succession…"
            rows={4}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button type="submit" disabled={submitting} className="min-w-[160px]">
          {submitting ? 'Sending…' : 'Request a consultation'}
        </Button>
        <p className="text-xs text-muted-foreground">
          We reply within 1–2 business days.
        </p>
      </div>

      {submitted === 'success' && (
        <p className="text-sm text-green-600">Thanks—your request has been sent.</p>
      )}
      {submitted === 'error' && (
        <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

const BLOG_POSTS = [
  {
    slug: 'predictable-pipeline',
    title: 'Predictable leadership pipelines: what to measure',
    excerpt: 'A data-driven approach to assessing potential, readiness, and fit—without slowing hiring.',
    body: [
      'Decision-makers need a reliable way to identify and develop future leaders. The most effective systems combine validated assessment data with structured development pathways.',
      'Optimal Consulting helps HR leaders operationalise this with clear success profiles, consistent psychometrics, and scalable enablement via our Academy.'
    ],
  },
  {
    slug: 'high-potential',
    title: 'High potential is not high performance',
    excerpt: 'How to differentiate potential from performance and reduce costly promotion risks.',
    body: [
      'High performance today does not always translate to success at the next level. Predictive indicators (motives, interpersonal style, derailers) provide additional clarity.',
      'We use proven tools and a pragmatic methodology to help organisations reduce risk while accelerating development.'
    ],
  },
] as const;

const SHOP_PRODUCTS = [
  {
    slug: 'discovery-session',
    name: 'Discovery Session',
    price: 'SGD 0',
    description: 'A complimentary 30-minute scoping call to understand your outcomes and constraints.',
  },
  {
    slug: 'leadership-diagnostic',
    name: 'Leadership Diagnostic (Pilot)',
    price: 'From SGD 8,000',
    description: 'A small cohort pilot assessment + insights report to validate your success profile.',
  },
  {
    slug: 'academy-certification',
    name: 'HR Certification (2-day)',
    price: 'From SGD 3,500',
    description: 'Enable internal HR teams to interpret assessment outputs and coach effectively.',
  },
] as const;

/**
 * Optimal Consulting Theme
 * Landing page geared to convert organisational decision-makers.
 */
const OptimalConsultingTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'Optimal Consulting',
  tenantSlug = 'optimalconsulting',
  tenantId,
  pageSlug,
}) => {
  // IMPORTANT: hooks must be declared unconditionally
  const [contactOpen, setContactOpen] = useState(false);

  const page = useMemo(() => resolvePage(pageSlug), [pageSlug]);

  const effectiveTenantId = useMemo(() => {
    if (tenantId) return tenantId;
    if (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) return (window as any).__CMS_TENANT__;
    return null;
  }, [tenantId]);

  // Hardcoded-first mode unless tenant id exists
  const cmsEnabled = !!effectiveTenantId;

  const { branding, loading: brandingLoading } = useThemeBranding(tenantSlug, effectiveTenantId ?? undefined, {
    enabled: cmsEnabled,
  });
  const { loading: stylesLoading } = useThemeStyles(tenantSlug, effectiveTenantId ?? undefined, {
    enabled: cmsEnabled,
  });

  const siteName = branding?.site_name || tenantName;
  const siteTagline =
    branding?.site_tagline || 'Strategic leadership and talent optimisation across Asia.';

  const baseUrl = `/theme/${tenantSlug}`;
  const assetUrl = (file: string) => `${baseUrl}/assets/${file}`;
  
  // Use logo from branding or default to white logo asset
  const logoSrc = branding?.site_logo || assetUrl('logo-white.svg');

  // Set brand colors as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', '#145598');
    root.style.setProperty('--brand-secondary', '#4ED1CE');
    root.style.setProperty('--brand-primary-dark', '#0f3f6f');
    root.style.setProperty('--brand-primary-light', '#1a6bb8');
    root.style.setProperty('--brand-secondary-dark', '#3db8b5');
    root.style.setProperty('--brand-secondary-light', '#6dd9d6');
  }, []);

  // Handle #contact hash by opening the modal
  useEffect(() => {
    const openFromHash = () => {
      if (typeof window === 'undefined') return;
      if (window.location.hash === '#contact') {
        setContactOpen(true);
      }
    };

    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  if (cmsEnabled && (brandingLoading || stylesLoading)) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 theme-primary-border" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const HomeLanding = () => (
    <div>
      {/* 1) HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Singapore HQ • Asia delivery
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              Developing Leaders, Optimising Performance
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
              We deliver comprehensive consulting services aimed at transforming talent into strategic impact and translating organisational strategy into success.
            </p>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl">
              {siteName} has been partnering clients across the globe since 2002 to deliver people solutions for businesses, with a focus on:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground max-w-xl">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Assessments and Prediction of Leadership Potential and Succession Readiness</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Talent and Leadership Development Interventions</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>High-performing Team Assessments and Development Interventions</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl">
              We are headquartered in Singapore, with a physical presence in Kuala Lumpur, Hong Kong, Shanghai and Tokyo.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="min-w-[200px]">
                <a href={`${baseUrl}#contact`}>
                  Book consultation <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="min-w-[200px]">
                <a href={assetUrl('optimal-consulting-brochure.pdf')} download>
                  <Download className="mr-2 h-4 w-4" /> Download brochure
                </a>
              </Button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">For</p>
                <p className="mt-1 font-medium">HR Leaders</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">For</p>
                <p className="mt-1 font-medium">Executives</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">For</p>
                <p className="mt-1 font-medium">Talent Teams</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-primary/20 to-transparent blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
              <img
                src={assetUrl('hero-illustration.svg')}
                alt="Leadership development illustration"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Data-driven, evidence-based
              </span>
              <span className="inline-flex items-center gap-2">
                <Globe className="h-4 w-4" /> Regional presence
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2) WHAT WE DO */}
      <section id="what-we-do" className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">What we do</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Three connected offerings to assess potential, build capability, and deliver outcomes.
              </p>
            </div>
            <Button asChild variant="outline">
              <a href={`${baseUrl}/services/assessments`}>Explore services</a>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <div key={s.key} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-sm font-medium">
                    <span style={{ color: '#145598' }}>{s.icon}</span>
                    {s.title}
                  </div>
                  <span className="text-xs rounded-full border border-border px-2 py-1 text-muted-foreground">
                    {s.metric}
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{s.description}</p>
                <p className="mt-3 text-sm">
                  <span className="font-medium">Benefit:</span> {s.benefit}
                </p>
                <div className="mt-5">
                  <a
                    href={`${baseUrl}/services/${s.key}`}
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    View details <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3) WHY CHOOSE US */}
      <section id="why" className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-semibold">Why choose us</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Modern consulting—people-centric and data-led—built for regional execution.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Data-driven tools</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Predictive assessments and structured diagnostics to reduce decision risk.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Global psychometrics partners</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Licensed tools and best-practice methodology to ensure defensible decisions.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Regional presence</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Singapore HQ with delivery capability across Asia for consistent rollout.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Proven methodology</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Clear success profiles, calibrated decision standards, and scalable enablement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4) IMPACT METRICS */}
      <section id="impact" className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">By the numbers</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Credibility you can reference in the boardroom.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { stat: '38', label: 'Served across locations', icon: <Globe className="h-4 w-4" /> },
              { stat: '3,000+', label: 'Certified licensed users', icon: <Users className="h-4 w-4" /> },
              { stat: '7,000+', label: 'Predicted high potentials', icon: <BarChart3 className="h-4 w-4" /> },
              { stat: '70,000+', label: 'Assessed professionals', icon: <Building2 className="h-4 w-4" /> },
              { stat: '100,000+', label: 'Delivered assessments', icon: <BarChart3 className="h-4 w-4" /> },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="inline-flex items-center gap-2 text-xs">
                    {m.icon}
                    Impact
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight">{m.stat}</p>
                <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              In 2022, Optimal celebrated twenty years of predicting leadership potential and delivering talent development interventions across Asia.
            </p>
          </div>
        </div>
      </section>

      {/* 5) STRATEGIC PARTNERS */}
      <section id="partners" className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-semibold">Strategic partners</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            We collaborate with trusted assessment and enablement partners to deliver robust outcomes.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PARTNERS.map((p) => (
              <div key={p.name} className="rounded-2xl border border-border bg-card p-6">
                <img src={assetUrl(p.logo)} alt={`${p.name} logo`} className="h-8 w-auto" />
                <p className="mt-4 text-sm text-muted-foreground">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6) TESTIMONIALS */}
      <section id="testimonials" className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">Client impact</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Specific outcomes—clear signals—credible decisions.
              </p>
            </div>
            <Button asChild variant="outline">
              <a href={`${baseUrl}/blog`}>
                <BookOpen className="mr-2 h-4 w-4" /> Insights
              </a>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                quote:
                  'We reduced promotion risk by introducing validated potential indicators and a calibrated success profile for critical roles.',
                by: 'Regional HR Director, Financial Services',
              },
              {
                quote:
                  'The Academy enabled our HR team to interpret assessment outputs consistently and coach leaders with confidence.',
                by: 'Head of Talent, Technology',
              },
              {
                quote:
                  'We aligned leadership behaviours to strategy and built a practical pipeline plan that business leaders could sponsor.',
                by: 'Chief People Officer, Consumer',
              },
            ].map((t, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm leading-6">“{t.quote}”</p>
                <p className="mt-4 text-xs text-muted-foreground">— {t.by}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7) RESOURCES */}
      <section id="resources" className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-semibold">Featured resources</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Practical, board-ready materials you can share internally.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {RESOURCES.map((r) => (
              <div key={r.file} className="rounded-2xl border border-border bg-card p-6 flex flex-col">
                <p className="font-medium">{r.title}</p>
                <p className="mt-2 text-sm text-muted-foreground flex-1">{r.description}</p>
                <div className="mt-5">
                  <a
                    href={assetUrl(r.file)}
                    download
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8) CTA / CONTACT */}
      <section id="contact" className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 py-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Ready to partner with us?</h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Tell us what you’re trying to achieve. We’ll propose a practical approach—assessment,
              academy enablement, and/or consulting—aligned to your context.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-medium">What you’ll get</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {[
                  'A short discovery call with a consultant',
                  'A recommended scope and timeline',
                  'A clear view of expected outcomes and metrics',
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <LeadForm themeSlug={tenantSlug} tenantId={effectiveTenantId} />
          </div>
        </div>
      </section>

      {/* 9) FOOTER */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              {logoSrc ? (
                <img src={logoSrc} alt={siteName} className="h-8 w-auto" />
              ) : (
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {siteName.substring(0, 1)}
                </div>
              )}
              <div>
                <p className="font-medium">{siteName}</p>
                <p className="text-xs text-muted-foreground">{siteTagline}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Strategic leadership and talent optimisation consulting firm headquartered in Singapore with a presence across Asia.
            </p>
          </div>

          <div>
            <p className="font-medium">Offices</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Singapore</li>
              <li>Kuala Lumpur</li>
              <li>Hong Kong</li>
              <li>Shanghai</li>
              <li>Tokyo</li>
            </ul>
          </div>

          <div>
            <p className="font-medium">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a className="hover:underline" href="mailto:hello@optimalconsulting.com">
                  hello@optimalconsulting.com
                </a>
              </li>
              <li>
                <a className="hover:underline" href="tel:+6560000000">
                  +65 6000 0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Singapore HQ
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <a className="text-muted-foreground hover:text-foreground" href="/privacy-policy">
                Privacy
              </a>
              <a className="text-muted-foreground hover:text-foreground" href="/terms-conditions">
                Terms
              </a>
              <a className="text-muted-foreground hover:text-foreground" href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>
    </div>
  );

  const BlogList = () => (
    <section>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold">Insights</h1>
        <p className="mt-2 text-muted-foreground">Short, practical perspectives for leaders and HR teams.</p>

        <div className="mt-8 grid gap-4">
          {BLOG_POSTS.map((post) => (
            <a
              key={post.slug}
              href={`${baseUrl}/blog/${post.slug}`}
              className="block rounded-2xl border border-border bg-card p-6 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-medium">{post.title}</h2>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  const BlogPost = ({ slug }: { slug: string }) => {
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (!post) {
      return (
        <section>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-semibold">Post not found</h1>
            <p className="mt-2 text-muted-foreground">No post with slug: {slug}</p>
            <a className="inline-block mt-6 text-sm underline" href={`${baseUrl}/blog`}>
              Back to Insights
            </a>
          </div>
        </section>
      );
    }

    return (
      <section>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <a className="text-sm text-muted-foreground hover:text-foreground" href={`${baseUrl}/blog`}>
            ← Back to Insights
          </a>
          <h1 className="mt-4 text-3xl font-semibold">{post.title}</h1>
          <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
          <div className="mt-8 space-y-4 text-sm leading-6">
            {post.body.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const ShopList = () => (
    <section>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold">Offerings</h1>
        <p className="mt-2 text-muted-foreground">Starter engagements you can use to begin.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_PRODUCTS.map((product) => (
            <a
              key={product.slug}
              href={`${baseUrl}/shop/${product.slug}`}
              className="block rounded-2xl border border-border bg-card p-6 hover:bg-muted/40 transition-colors"
            >
              <p className="font-medium">{product.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold">{product.price}</span>
                <span className="text-xs text-primary">View</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  const Product = ({ slug }: { slug: string }) => {
    const product = SHOP_PRODUCTS.find((p) => p.slug === slug);
    if (!product) {
      return (
        <section>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-semibold">Not found</h1>
            <p className="mt-2 text-muted-foreground">No item with slug: {slug}</p>
            <a className="inline-block mt-6 text-sm underline" href={`${baseUrl}/shop`}>
              Back to Offerings
            </a>
          </div>
        </section>
      );
    }

    return (
      <section>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <a className="text-sm text-muted-foreground hover:text-foreground" href={`${baseUrl}/shop`}>
            ← Back to Offerings
          </a>
          <div className="mt-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold">{product.name}</h1>
                <p className="mt-2 text-muted-foreground">{product.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold">{product.price}</p>
                <Button className="mt-3" onClick={() => setContactOpen(true)}>
                  Enquire
                </Button>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              This is a starter page. Connect it to your product/catalog system when ready.
            </p>
          </div>
        </div>
      </section>
    );
  };

  const ServicePage = ({ keyName }: { keyName: string }) => {
    const svc = SERVICES.find((s) => s.key === keyName);
    if (!svc) {
      return (
        <section>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-semibold">Service not found</h1>
            <p className="mt-2 text-muted-foreground">Unknown service: {keyName}</p>
            <a className="inline-block mt-6 text-sm underline" href={`${baseUrl}#what-we-do`}>
              Back to services
            </a>
          </div>
        </section>
      );
    }

    return (
      <section>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <a className="text-sm text-muted-foreground hover:text-foreground" href={`${baseUrl}#what-we-do`}>
            ← Back to services
          </a>
          <h1 className="mt-4 text-3xl font-semibold">{svc.title}</h1>
          <p className="mt-3 text-muted-foreground">{svc.description}</p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-medium">What you get</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5" /> Evidence-based tools and structured interpretation</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5" /> Role-based success profiles and decision criteria</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5" /> Actionable insights for selection, development, and succession</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-medium">Outcome</p>
              <p className="mt-2 text-sm text-muted-foreground">{svc.benefit}</p>
              <p className="mt-3 text-sm"><span className="font-medium">Metric focus:</span> {svc.metric}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <p className="font-medium">Speak to a consultant</p>
            <p className="mt-2 text-sm text-muted-foreground">Share your outcomes and context—we’ll propose a practical scope.</p>
            <div className="mt-4">
              <LeadForm themeSlug={tenantSlug} tenantId={effectiveTenantId} variant="compact" />
            </div>
          </div>
        </div>
      </section>
    );
  };

  const content =
    page.key === 'blog'
      ? <BlogList />
      : page.key === 'blogPost' && page.param
        ? <BlogPost slug={page.param} />
        : page.key === 'shop'
          ? <ShopList />
          : page.key === 'product' && page.param
            ? <Product slug={page.param} />
            : page.key === 'service' && page.param
              ? <ServicePage keyName={page.param} />
              : <HomeLanding />;

  const headerLinks = [
    { href: baseUrl, label: 'Home' },
    { href: `${baseUrl}#what-we-do`, label: 'Services' },
    { href: `${baseUrl}#impact`, label: 'Impact' },
    { href: `${baseUrl}#resources`, label: 'Resources' },
    { href: `${baseUrl}/blog`, label: 'Insights' },
  ];

  return (
    <div className="min-h-screen theme-bg text-foreground flex flex-col">
      {/* Header */}
      <header className="optimal-header sticky top-0 z-40 w-full border-b border-white/10" style={{ backgroundColor: '#145598' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <a href={baseUrl} className="flex items-center gap-3 min-w-0">
            {logoSrc ? (
              <img src={logoSrc} alt={siteName} className="h-8 w-auto" />
            ) : (
              <div className="h-8 px-3 flex items-center justify-center text-white font-bold text-lg">
                optimal
              </div>
            )}
            <div className="hidden sm:block min-w-0">
              <p className="font-medium truncate text-white">{siteName}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{siteTagline}</p>
            </div>
          </a>

          <nav className="hidden lg:flex items-center">
            {headerLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm px-3 py-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="hidden sm:inline-flex border-white/20 text-white hover:bg-white/10 hover:text-white">
              <a href={assetUrl('optimal-consulting-brochure.pdf')} download>
                <Download className="mr-2 h-4 w-4" /> Brochure
              </a>
            </Button>
            <Button onClick={() => setContactOpen(true)} style={{ backgroundColor: '#4ED1CE', color: '#145598' }} className="hover:opacity-90">
              Book consultation
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{content}</main>

      {/* Contact modal */}
      {contactOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Book a consultation</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us your objective—we’ll respond with a recommended approach.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setContactOpen(false)}>
                Close
              </Button>
            </div>
            <div className="mt-5">
              <LeadForm themeSlug={tenantSlug} tenantId={effectiveTenantId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimalConsultingTheme;
