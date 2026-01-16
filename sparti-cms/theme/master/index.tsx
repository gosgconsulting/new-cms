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
  const siteTagline = branding?.site_tagline || 'A tenant-aware base theme';
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

  const PageTitle = () => {
    if (page.key === 'blog') return 'Blog';
    if (page.key === 'blogPost') return 'Blog post';
    if (page.key === 'shop') return 'Shop';
    if (page.key === 'product') return 'Product';
    return 'Home';
  };

  const HomeContent = () => (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="text-4xl font-bold mb-3">{siteName}</h1>
          <p className="text-lg text-muted-foreground mb-6">Tenant-aware base theme for fast migrations.</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/admin"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            >
              Go to CMS
            </a>
            <a href={`${baseUrl}/blog`} className="px-4 py-2 rounded-md border border-border hover:bg-muted text-sm">
              Blog
            </a>
            <a href={`${baseUrl}/shop`} className="px-4 py-2 rounded-md border border-border hover:bg-muted text-sm">
              Shop
            </a>
          </div>

          {!cmsEnabled && (
            <p className="mt-4 text-xs text-muted-foreground">
              Running in hardcoded mode (no tenant selected → no CMS API calls).
            </p>
          )}

          {effectiveTenantId && (
            <p className="mt-2 text-xs text-muted-foreground">Tenant ID: {effectiveTenantId}</p>
          )}

          {cmsEnabled && stylesError && (
            <p className="mt-2 text-xs text-destructive">
              Styles could not be loaded for this tenant/theme (showing defaults).
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Theme assets preview</p>
            <span className="text-xs text-muted-foreground">{baseUrl}</span>
          </div>
          <div className="mt-4 rounded-xl overflow-hidden border border-border bg-background">
            <img
              src={assetUrl('hero.svg')}
              alt="Theme illustration"
              className="w-full h-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <ul className="mt-4 text-sm text-muted-foreground space-y-1">
            <li>• Assets: /public/theme/{tenantSlug}/assets</li>
            <li>• Pages: /, /blog, /shop</li>
            <li>• CMS branding/styles are optional and can be enabled later</li>
          </ul>
        </div>
      </div>
    </section>
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

  return (
    <div className="min-h-screen theme-bg text-foreground flex flex-col">
      {/* Header */}
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
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden lg:inline text-xs text-muted-foreground">{PageTitle()}</span>
            <button
              onClick={() => setContactOpen(true)}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            >
              Contact
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{content}</main>

      {/* Footer */}
      <footer className="w-full border-t border-border/60 bg-background">
        <div className="max-w-6xl mx-auto p-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
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
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Replace this with your contact form component when needed.
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

export default MasterTheme;