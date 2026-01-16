import React, { useMemo, useEffect, useState } from 'react';
import './theme.css';
import { useThemeBranding, useThemeStyles } from '../../hooks/useThemeSettings';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string | null;
  pageSlug?: string;
}

type PageKey = 'home' | 'blog' | 'blogPost' | 'shop' | 'product';

const BLOG_POSTS = [
  {
    slug: 'welcome-to-master',
    title: 'Welcome to the Master Theme Blog',
    excerpt: 'A clean starting point for tenant-aware sites. This post is a placeholder you can replace from CMS later.',
    body: [
      'This is a minimal blog page intended to verify routing and future CMS wiring.',
      'Replace this static content with CMS-driven content when ready.',
    ],
  },
  {
    slug: 'migrations-fast',
    title: 'Fast migrations with tenant-aware styles',
    excerpt: 'How branding + styles are loaded through the public API, keeping themes reusable across tenants.',
    body: [
      'The Master theme loads branding (name/logo/favicon) and styles (colors/typography) via the public API.',
      'That makes it a good base for migrations: you can keep UI consistent and swap tenant identity cleanly.',
    ],
  },
] as const;

const SHOP_PRODUCTS = [
  {
    slug: 'starter-kit',
    name: 'Starter Kit',
    price: '$29',
    description: 'A simple placeholder product to validate /shop routing and page structure.',
  },
  {
    slug: 'pro-kit',
    name: 'Pro Kit',
    price: '$99',
    description: 'Another placeholder product. Replace with real products when you connect a store.',
  },
] as const;

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

  return { key: 'home' };
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Master Theme
 * Minimal, tenant-aware base theme intended for duplication/migrations.
 *
 * Asset convention:
 * - Put assets in /public/theme/<themeSlug>/assets
 * - Refer to them with: /theme/<themeSlug>/assets/<file>
 */
const MasterTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'Master Theme',
  tenantSlug = 'master',
  tenantId,
  pageSlug,
}) => {
  // IMPORTANT: hooks must be declared unconditionally (before any early returns)
  const [contactOpen, setContactOpen] = useState(false);

  const page = useMemo(() => resolvePage(pageSlug), [pageSlug]);

  // Determine effective tenant ID: prefer prop, then window injection, then null
  const effectiveTenantId = useMemo(() => {
    if (tenantId) return tenantId;
    if (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) {
      return (window as any).__CMS_TENANT__;
    }
    return null;
  }, [tenantId]);

  // If no tenant is set, run fully hardcoded (no API/DB dependency).
  const cmsEnabled = !!effectiveTenantId;

  // Tenant-aware branding and style settings (optional)
  const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding(
    tenantSlug,
    effectiveTenantId ?? undefined,
    { enabled: cmsEnabled }
  );
  const { loading: stylesLoading, error: stylesError } = useThemeStyles(
    tenantSlug,
    effectiveTenantId ?? undefined,
    { enabled: cmsEnabled }
  );

  // Derived presentation values with safe fallbacks
  const siteName = branding?.site_name || tenantName;
  const siteTagline = branding?.site_tagline || 'High-converting websites with a built-in CMS';
  const logoSrc = branding?.site_logo || null;

  const baseUrl = `/theme/${tenantSlug}`;
  const assetUrl = (file: string) => `${baseUrl}/assets/${file}`;

  // Optional favicon application
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

  // Loading state (only when CMS fetch is enabled)
  if (cmsEnabled && (brandingLoading || stylesLoading)) {
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
    if (brandingError) console.warn('[master-theme] Branding load error:', brandingError);
    if (stylesError) console.warn('[master-theme] Styles load error:', stylesError);
  }

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = normalizeSlug(pageSlug) === normalizeSlug(href.replace(baseUrl + '/', ''));
    return (
      <a
        href={href}
        className={`text-sm px-3 py-2 rounded-md transition-colors ${
          active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
      >
        {label}
      </a>
    );
  };

  const HeaderAction = () => (
    <button
      onClick={() => setContactOpen(true)}
      className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
    >
      Book a call
    </button>
  );

  const PageTitle = () => {
    if (page.key === 'blog') return 'Blog';
    if (page.key === 'blogPost') return 'Blog post';
    if (page.key === 'shop') return 'Shop';
    if (page.key === 'product') return 'Product';
    return 'Home';
  };

  const SectionHeading = ({
    eyebrow,
    title,
    subtitle,
  }: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
  }) => (
    <div className="max-w-3xl">
      {eyebrow && <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl sm:text-3xl font-bold">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );

  const HomeContent = () => (
    <div>
      {/* 2. Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-border bg-background/60 text-muted-foreground">
              Sparti Website Builder
              <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
              CMS + high converting templates
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight">
              Launch a website that converts — in days, not weeks.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for service businesses. Pick a proven layout, customize it visually, and manage content in a simple
              CMS — without sacrificing speed, SEO, or design quality.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setContactOpen(true)}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
              >
                Get a quote
              </button>
              <button
                onClick={() => scrollToId('pricing')}
                className="px-4 py-2 rounded-md border border-border hover:bg-muted text-sm"
              >
                See pricing
              </button>
            </div>
            <div className="mt-6 text-xs text-muted-foreground">
              No long-term contracts. Transparent packages. Built-in CMS.
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Preview</p>
              <span className="text-xs text-muted-foreground">{baseUrl}</span>
            </div>
            <div className="mt-4 rounded-xl overflow-hidden border border-border bg-background">
              <img
                src={assetUrl('hero.svg')}
                alt="Website preview"
                className="w-full h-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="p-4 text-sm text-muted-foreground">
                Modern sections, clear CTAs, and structured content that can be edited in the CMS.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Signals */}
      <section className="border-y border-border/60 bg-background/40">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-medium">Credibility, fast</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Use trust signals out of the box: logos, numbers, and proof sections.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:col-span-2">
              {[
                { label: 'Sites shipped', value: '100+' },
                { label: 'Avg. time to launch', value: '7 days' },
                { label: 'Conversion-focused layouts', value: '12+' },
                { label: 'CMS-managed pages', value: 'Unlimited' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Problem → Solution */}
      <section id="problem-solution">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <SectionHeading
            eyebrow="Problem → Solution"
            title="Websites fail when the message is unclear and updates are painful."
            subtitle="Sparti Website Builder gives you a proven structure, then lets you update content in minutes with a CMS." 
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold">Common pain points</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>• Beautiful site, but no enquiries</li>
                <li>• Hard to edit content — you need a developer for everything</li>
                <li>• No trust built early, so visitors bounce</li>
                <li>• Pricing and process are unclear</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold">Our structured solution</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>• High-converting homepage layout (hero → proof → CTA)</li>
                <li>• CMS-managed sections (services, testimonials, FAQs)</li>
                <li>• Fast, responsive, SEO-ready components</li>
                <li>• Clear packages so leads self-qualify</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Services Overview */}
      <section id="services" className="bg-background/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <SectionHeading
            eyebrow="Services"
            title="Everything you need to ship and grow."
            subtitle="Outcome-focused building blocks that make your site a sales asset, not a brochure." 
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Conversion-first pages',
                desc: 'Proven sections and CTAs designed to generate enquiries.',
              },
              {
                title: 'Built-in CMS',
                desc: 'Edit content, publish pages, and update offers without dev help.',
              },
              {
                title: 'SEO-ready structure',
                desc: 'Clean markup and fast pages to support ranking and performance.',
              },
              {
                title: 'Ongoing iteration',
                desc: 'Add pages, refine copy, and improve conversion over time.',
              },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <p className="font-semibold">{s.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works */}
      <section id="how-it-works">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <SectionHeading
            eyebrow="How it works"
            title="A simple, transparent process."
            subtitle="No endless back-and-forth. You'll always know what's next." 
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {[
              { step: '01', title: 'Choose a structure', desc: 'Start with a high-converting homepage blueprint.' },
              { step: '02', title: 'Customize visually', desc: 'Swap copy, colors, images, and sections with ease.' },
              { step: '03', title: 'Connect your CMS', desc: 'Manage content, FAQs, pricing, and testimonials.' },
              { step: '04', title: 'Launch + improve', desc: 'Ship fast, then iterate with real user data.' },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-semibold text-muted-foreground">{item.step}</p>
                <p className="mt-2 font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Results / Case Studies */}
      <section id="results" className="bg-background/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <SectionHeading
            eyebrow="Results"
            title="Proof that structure works."
            subtitle="Dummy examples of what clients typically see when the homepage is built around conversion." 
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              {
                name: 'Local services brand',
                metric: '+38% enquiries',
                desc: 'Clear CTA + trust section reduced hesitation and increased form submissions.',
              },
              {
                name: 'Consulting practice',
                metric: '-22% bounce rate',
                desc: 'Better above-the-fold messaging and scannable services improved engagement.',
              },
              {
                name: 'B2B provider',
                metric: '2x faster edits',
                desc: 'CMS-managed pages removed dependency on developers for routine updates.',
              },
            ].map((c) => (
              <div key={c.name} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="mt-2 text-2xl font-bold">{c.metric}</p>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Testimonials / Reviews */}
      <section id="testimonials">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <SectionHeading
            eyebrow="Testimonials"
            title="Clients love the speed and clarity."
            subtitle="More trust. Less friction. Better leads." 
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              {
                quote:
                  'We finally have a homepage that explains what we do in 10 seconds — and enquiries started coming in immediately.',
                name: 'Operations Lead',
              },
              {
                quote:
                  'The CMS means we can update offers and FAQs ourselves. It feels like we got a marketing team in a box.',
                name: 'Founder',
              },
              {
                quote:
                  'Clean structure, fast pages, and a clear process. Launching was painless.',
                name: 'Marketing Manager',
              },
            ].map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border bg-card p-6">
                <blockquote className="text-sm leading-6 text-foreground">"{t.quote}"</blockquote>
                <figcaption className="mt-4 text-xs text-muted-foreground">— {t.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Pricing / Packages */}
      <section id="pricing" className="bg-background/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple packages that qualify leads."
            subtitle="Dummy pricing — replace with real packages in the CMS." 
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              {
                name: 'Starter',
                price: '$499',
                perks: ['Homepage + basic pages', 'Conversion-first layout', 'CMS for content'],
              },
              {
                name: 'Growth',
                price: '$999',
                perks: ['Everything in Starter', 'Services + case studies', 'SEO setup + tracking'],
                highlight: true,
              },
              {
                name: 'Scale',
                price: '$1,999',
                perks: ['Everything in Growth', 'Advanced sections + integrations', 'Ongoing optimization'],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border bg-card p-6 ${p.highlight ? 'border-primary/50' : 'border-border'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Perfect for service providers</p>
                  </div>
                  {p.highlight && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">Most popular</span>
                  )}
                </div>
                <p className="mt-4 text-3xl font-bold">{p.price}</p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {p.perks.map((perk) => (
                    <li key={perk}>• {perk}</li>
                  ))}
                </ul>
                <button
                  onClick={() => setContactOpen(true)}
                  className={`mt-6 w-full px-4 py-2 rounded-md text-sm ${
                    p.highlight
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  Choose {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section id="faq">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <SectionHeading
            eyebrow="FAQ"
            title="Answers to common questions."
            subtitle="Reduce friction and objections before the first call." 
          />

          <div className="mt-10 max-w-3xl space-y-3">
            {[
              {
                q: 'Can I update the website myself?',
                a: 'Yes. Sparti Website Builder includes a CMS so you can update text, images, FAQs, pricing, and pages without a developer.',
              },
              {
                q: 'Is it SEO-friendly?',
                a: 'Yes. The structure is built to be fast, responsive, and search-engine friendly, with clear content hierarchy.',
              },
              {
                q: 'How fast can we launch?',
                a: 'Most service sites can launch in under a week once content is ready. The structure and sections are already proven.',
              },
              {
                q: 'Do you offer ongoing support?',
                a: 'Yes. Choose an ongoing package if you want continuous improvements, new sections/pages, and conversion optimization.',
              },
            ].map((item) => (
              <details key={item.q} className="rounded-xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Final Call to Action */}
      <section className="border-y border-border/60 bg-background/40">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Ready to launch?</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Let's build your high-converting site.</h2>
              <p className="mt-3 text-muted-foreground">
                Get a homepage structure that sells, plus a CMS so your team can keep it fresh.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setContactOpen(true)}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
              >
                Book a call
              </button>
              <button
                onClick={() => scrollToId('services')}
                className="px-4 py-2 rounded-md border border-border hover:bg-muted text-sm"
              >
                Explore services
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const BlogListContent = () => (
    <section>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="mt-2 text-muted-foreground">Basic blog listing (static for now).</p>

        <div className="mt-8 grid gap-4">
          {BLOG_POSTS.map((post) => (
            <a
              key={post.slug}
              href={`${baseUrl}/blog/${post.slug}`}
              className="block rounded-xl border border-border bg-card p-5 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">{post.title}</h2>
                <span className="text-xs text-muted-foreground">Read</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  const BlogPostContent = ({ slug }: { slug: string }) => {
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (!post) {
      return (
        <section>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold">Post not found</h1>
            <p className="mt-2 text-muted-foreground">No blog post with slug: {slug}</p>
            <a href={`${baseUrl}/blog`} className="inline-block mt-6 text-sm underline">
              Back to blog
            </a>
          </div>
        </section>
      );
    }

    return (
      <section>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <a href={`${baseUrl}/blog`} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to blog
          </a>
          <h1 className="mt-4 text-3xl font-bold">{post.title}</h1>
          <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
          <div className="mt-8 space-y-4 text-sm leading-6 text-foreground">
            {post.body.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const ShopContent = () => (
    <section>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="mt-2 text-muted-foreground">Basic shop listing (static for now).</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_PRODUCTS.map((product) => (
            <a
              key={product.slug}
              href={`${baseUrl}/shop/${product.slug}`}
              className="block rounded-xl border border-border bg-card p-5 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                </div>
                <span className="text-sm font-semibold">{product.price}</span>
              </div>
              <div className="mt-4">
                <span className="text-xs text-muted-foreground">View product</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  const ProductContent = ({ slug }: { slug: string }) => {
    const product = SHOP_PRODUCTS.find((p) => p.slug === slug);
    if (!product) {
      return (
        <section>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="mt-2 text-muted-foreground">No product with slug: {slug}</p>
            <a href={`${baseUrl}/shop`} className="inline-block mt-6 text-sm underline">
              Back to shop
            </a>
          </div>
        </section>
      );
    }

    return (
      <section>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <a href={`${baseUrl}/shop`} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to shop
          </a>
          <div className="mt-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="mt-2 text-muted-foreground">{product.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold">{product.price}</p>
                <button
                  className="mt-3 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                  onClick={() => setContactOpen(true)}
                >
                  Enquire
                </button>
              </div>
            </div>
            <div className="mt-6 text-sm text-muted-foreground">
              This is a placeholder product detail page. Connect it to your real product/catalog system when ready.
            </div>
          </div>
        </div>
      </section>
    );
  };

  const content =
    page.key === 'blog'
      ? <BlogListContent />
      : page.key === 'blogPost' && page.param
        ? <BlogPostContent slug={page.param} />
        : page.key === 'shop'
          ? <ShopContent />
          : page.key === 'product' && page.param
            ? <ProductContent slug={page.param} />
            : <HomeContent />;

  const FooterContent = () => (
    <div className="max-w-6xl mx-auto p-6 sm:p-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="font-semibold">{siteName}</p>
              <p className="text-xs text-muted-foreground">{siteTagline}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Sparti Website Builder helps service businesses launch high-converting sites with a CMS.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Pages</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a className="hover:text-foreground" href={baseUrl}>
                Home
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href={`${baseUrl}/blog`}>
                Blog
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href={`${baseUrl}/shop`}>
                Shop
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Sections</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <button className="hover:text-foreground" onClick={() => scrollToId('services')}>
                Services
              </button>
            </li>
            <li>
              <button className="hover:text-foreground" onClick={() => scrollToId('pricing')}>
                Pricing
              </button>
            </li>
            <li>
              <button className="hover:text-foreground" onClick={() => scrollToId('faq')}>
                FAQ
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Contact</p>
          <p className="mt-3 text-sm text-muted-foreground">Let's talk about your next website.</p>
          <button
            onClick={() => setContactOpen(true)}
            className="mt-4 w-full px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
          >
            Book a call
          </button>
        </div>
      </div>

      <div className="mt-10 border-t border-border/60 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        <p>Built with Sparti Website Builder</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen theme-bg text-foreground flex flex-col">
      {/* 1. Header / Navigation */}
      <header className="w-full border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between gap-4">
          <a href={baseUrl} className="flex items-center gap-3 min-w-0">
            {logoSrc ? (
              <img src={logoSrc} alt={siteName} className="h-8 w-auto" />
            ) : (
              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                {siteName.substring(0, 1)}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-semibold truncate">{siteName}</span>
              <span className="text-xs text-muted-foreground truncate">{siteTagline}</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center">
            <NavLink href={baseUrl} label="Home" />
            <NavLink href={`${baseUrl}/blog`} label="Blog" />
            <NavLink href={`${baseUrl}/shop`} label="Shop" />
            <button
              onClick={() => scrollToId('pricing')}
              className="text-sm px-3 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToId('faq')}
              className="text-sm px-3 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden lg:inline text-xs text-muted-foreground">{PageTitle()}</span>
            <HeaderAction />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{content}</main>

      {/* 12. Footer */}
      <footer className="w-full border-t border-border/60 bg-background">
        <FooterContent />
      </footer>

      {/* Simple placeholder for contact modal */}
      {contactOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="bg-background rounded-lg p-6 w-full max-w-md border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-1">Book a call</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tell us about your site and we'll reply with next steps.
            </p>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setContactOpen(false);
              }}
            >
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">Name</span>
                <input className="h-10 rounded-md border border-border bg-background px-3" required />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">Email</span>
                <input
                  type="email"
                  className="h-10 rounded-md border border-border bg-background px-3"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">Message</span>
                <textarea className="min-h-24 rounded-md border border-border bg-background px-3 py-2" />
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  className="px-3 py-2 rounded-md border border-border hover:bg-muted text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dev hint: keep out of the main layout */}
      {!cmsEnabled && (
        <div className="fixed bottom-3 left-3 rounded-md border border-border bg-background/90 backdrop-blur px-3 py-2 text-xs text-muted-foreground">
          Hardcoded mode (no tenant selected)
        </div>
      )}
    </div>
  );
};

export default MasterTheme;