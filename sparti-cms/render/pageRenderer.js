import { query, getPublicSEOSettings } from '../db/index.js';

// Minimal HTML shell creator
function buildHtml({ head, body, lang = 'en' }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${head}
</head>
<body>
${body}
</body>
</html>`;
}

// Basic head builder using site/page SEO
export function buildHead(seo, pageMeta) {
  const title = pageMeta?.meta_title || seo?.meta_title || 'Website';
  const description = pageMeta?.meta_description || seo?.meta_description || '';
  const ogImage = seo?.og_image || '';

  return [
    `<title>${escapeHtml(title)}</title>`,
    description ? `<meta name="description" content="${escapeAttr(description)}" />` : '',
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    description ? `<meta property="og:description" content="${escapeAttr(description)}" />` : '',
    ogImage ? `<meta property="og:image" content="${escapeAttr(ogImage)}" />` : '',
  ].filter(Boolean).join('\n');
}

// Very small escape helpers
export function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function escapeAttr(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// Minimal component registry (server templates)
const components = {
  Header: (props) => `
    <header class="fixed top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 bg-background/95 backdrop-blur-md border-b border-border">
      <div class="container mx-auto">
        <div class="flex items-center justify-between">
          <a href="/" class="flex items-center z-10">
            <span class="h-12 inline-flex items-center font-bold">${escapeHtml(props?.brand || 'GO SG CONSULTING')}</span>
          </a>
          <a href="/contact" class="hidden md:inline-flex bg-destructive text-destructive-foreground px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all">Contact Us</a>
          <a href="/contact" class="md:hidden bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-medium">Contact</a>
        </div>
      </div>
    </header>
  `,
  HeroSection: (props) => `
    <section class="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-4 pt-28 overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background text-center">
      <div class="container mx-auto max-w-5xl">
        <div class="space-y-6">
          <div>
            <span class="inline-flex items-center px-4 py-2 text-sm font-medium border border-brandPurple/20 text-brandPurple bg-brandPurple/5 rounded-full">Get Results in 3 Months</span>
          </div>
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span class="bg-gradient-to-r from-brandPurple via-brandTeal to-coral bg-clip-text text-transparent">${escapeHtml(props?.headline || 'Rank #1 on Google')}</span><br />
            <span class="text-foreground">${escapeHtml(props?.subheadline || 'In 3 Months')}</span>
          </h1>
          ${props?.description ? `<p class="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">${escapeHtml(props.description)}</p>` : ''}
          <div>
            <a href="/contact" class="inline-flex items-center px-8 py-4 text-lg font-semibold bg-coral text-white rounded-lg shadow hover:shadow-md transition-all">Get a Quote</a>
          </div>
        </div>
      </div>
    </section>
  `,
  SEOResultsSection: () => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-4">SEO Results</h2>
      <p class="text-muted-foreground">Real results from real clients.</p>
    </section>
  `,
  NewTestimonials: () => `
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-6 text-center">What our clients say</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="testimonial-card">“GoSG's SEO strategies boosted our organic traffic by 400%.”</div>
          <div class="testimonial-card">“From page 5 to page 1 in Google in just 4 months.”</div>
        </div>
      </div>
    </section>
  `,
  FAQAccordion: (props) => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-2xl md:text-3xl font-bold mb-4 text-center">${escapeHtml(props?.title || 'Frequently Asked Questions')}</h2>
    </section>
  `,
  BlogSection: () => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-4">Latest SEO Insights</h2>
    </section>
  `,
  SEOServicesShowcase: (props) => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-6 text-center">Our SEO Services</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="service-card p-6 border rounded-lg">
          <h3 class="font-semibold mb-2">Technical SEO</h3>
          <p class="text-muted-foreground">Fix crawl issues and optimize site structure.</p>
        </div>
        <div class="service-card p-6 border rounded-lg">
          <h3 class="font-semibold mb-2">Content & On-page</h3>
          <p class="text-muted-foreground">Publish content that ranks and converts.</p>
        </div>
        <div class="service-card p-6 border rounded-lg">
          <h3 class="font-semibold mb-2">Off-page & Links</h3>
          <p class="text-muted-foreground">Build authority with quality backlinks.</p>
        </div>
      </div>
      <div class="text-center mt-8">
        <a href="/contact" class="inline-flex items-center px-6 py-3 bg-coral text-white rounded-lg">${escapeHtml(props?.cta || 'Get a Quote')}</a>
      </div>
    </section>
  `,
  ContactForm: () => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-2xl font-bold mb-4">Contact Us</h2>
      <p class="text-muted-foreground">Form available on SPA version.</p>
    </section>
  `,
  Footer: () => `
    <footer class="bg-slate-900 text-white py-16 px-4">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
          <div class="space-y-6">
            <h2 class="text-3xl md:text-5xl font-bold mb-4"><span class="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Get Your SEO Strategy</span></h2>
            <p class="text-gray-300 text-lg">Ready to dominate search results? Let's discuss how we can help your business grow.</p>
            <a href="/contact" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brandPurple to-brandTeal rounded-lg">Start Your Journey</a>
          </div>
          <div class="lg:text-right">
            <h3 class="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">Contact</h3>
            <div class="space-y-3">
              <a href="#" class="block text-xl text-white hover:text-brandTeal">WhatsApp</a>
              <a href="#" class="block text-xl text-white hover:text-brandTeal">Book a Meeting</a>
            </div>
          </div>
        </div>
        <div class="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
            <a href="#" class="hover:text-brandTeal">Privacy Policy</a>
            <a href="#" class="hover:text-brandTeal">Terms of Service</a>
            <a href="/blog" class="hover:text-brandTeal">Blog</a>
          </div>
          <p class="text-sm text-gray-400">© ${new Date().getFullYear()} GO SG CONSULTING. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `
};

function renderComponent(node, settings) {
  const tpl = components[node.key];
  if (!tpl) return `<!-- unknown component: ${node.key} -->`;
  // Optionally map settings (colors/typography) into props later
  return tpl(node.props || {}, settings);
}

export async function renderPageBySlug(slug, tenantId = null) {
  // 1) Load page meta - filter by tenant_id if provided
  let pageRes;
  if (tenantId) {
    pageRes = await query(`SELECT * FROM pages WHERE slug = $1 AND tenant_id = $2`, [slug, tenantId]);
  } else {
    pageRes = await query(`SELECT * FROM pages WHERE slug = $1`, [slug]);
  }
  const page = pageRes.rows[0];
  if (!page) return { status: 404, html: '<h1>Not Found</h1>' };

  // 2) Load layout JSON
  const layoutRes = await query(`SELECT layout_json FROM page_layouts WHERE page_id = $1`, [page.id]);
  const layout = layoutRes.rows[0]?.layout_json || { components: [] };

  // 3) Load SEO/site settings - use tenant_id if provided, otherwise use page's tenant_id
  const settingsTenantId = tenantId || page.tenant_id || 'tenant-gosg';
  const seo = await getPublicSEOSettings(settingsTenantId);

  // 4) Render components
  const body = (layout.components || [])
    .map(node => renderComponent(node, seo))
    .join('\n');

  // 5) Build full HTML
  const head = buildHead(seo, page);
  const html = buildHtml({ head, body });
  return { status: 200, html };
}

export default {
  renderPageBySlug,
};


