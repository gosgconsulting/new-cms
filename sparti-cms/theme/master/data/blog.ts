export type BlogCategory = "Growth" | "SEO" | "Design" | "Product";

export type BlogContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string; // ISO date
  readTimeMinutes: number;
  author: {
    name: string;
    role?: string;
  };
  featuredImage?: {
    src: string;
    alt: string;
  };
  content?: BlogContentBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "conversion-first-homepage",
    title: "Conversion-first homepage: a simple checklist",
    excerpt:
      "A clean layout is not enough. Here’s the short checklist we use to turn traffic into leads.",
    category: "Growth",
    publishedAt: "2026-01-10",
    readTimeMinutes: 6,
    author: { name: "Greg", role: "Growth" },
    featuredImage: {
      src: "/assets/seo-results-1.png",
      alt: "Analytics dashboard preview",
    },
    content: [
      {
        type: "p",
        text: "Most websites fail for one reason: they don’t tell visitors what to do next. This post is a simple, practical checklist you can apply in one afternoon.",
      },
      { type: "h2", text: "1) One clear promise" },
      {
        type: "p",
        text: "Your hero section should answer: what is this, who is it for, and what result do I get? Keep it specific and measurable.",
      },
      { type: "h2", text: "2) Proof early" },
      {
        type: "p",
        text: "Add testimonials, logos, or outcomes above the fold. People want to trust you before they read.",
      },
      { type: "h2", text: "3) Reduce friction" },
      {
        type: "ul",
        items: [
          "Use one primary CTA",
          "Keep forms short",
          "Explain what happens after clicking",
          "Show pricing ranges or a clear ‘starting from’",
        ],
      },
      {
        type: "quote",
        text: "If visitors can’t repeat your offer in one sentence, the page is too complicated.",
      },
      { type: "h2", text: "4) Make the next step obvious" },
      {
        type: "p",
        text: "End each section with a small prompt: ‘Book a call’, ‘Get a quote’, or ‘See plans’. Consistency beats cleverness.",
      },
    ],
  },
  {
    slug: "seo-basics-that-compound",
    title: "SEO basics that actually compound",
    excerpt:
      "The fundamentals that keep working: search intent, internal links, and content structure.",
    category: "SEO",
    publishedAt: "2025-12-18",
    readTimeMinutes: 5,
    author: { name: "Maya", role: "SEO" },
  },
  {
    slug: "design-system-in-3-rules",
    title: "A tiny design system in 3 rules",
    excerpt:
      "Consistency doesn’t require a huge design system. Start with these three rules and scale later.",
    category: "Design",
    publishedAt: "2025-11-30",
    readTimeMinutes: 4,
    author: { name: "Alex", role: "Design" },
  },
  {
    slug: "launch-page-that-sells",
    title: "Launch page that sells: structure over flair",
    excerpt:
      "A simple page structure that works for services, products, and newsletters.",
    category: "Product",
    publishedAt: "2025-10-06",
    readTimeMinutes: 7,
    author: { name: "Sam", role: "Product" },
    featuredImage: {
      src: "/assets/go-sg-logo-official.png",
      alt: "Brand mark",
    },
  },
  {
    slug: "writing-cta-copy",
    title: "Writing CTA copy that gets clicks",
    excerpt:
      "Small changes to button text and microcopy can increase conversion without redesigning anything.",
    category: "Growth",
    publishedAt: "2025-09-12",
    readTimeMinutes: 3,
    author: { name: "Priya", role: "Marketing" },
  },
  {
    slug: "internal-linking-playbook",
    title: "Internal linking playbook for small sites",
    excerpt:
      "How to connect pages so Google (and users) understand what matters most.",
    category: "SEO",
    publishedAt: "2025-08-22",
    readTimeMinutes: 6,
    author: { name: "Jordan", role: "SEO" },
  },
];

export const BLOG_CATEGORIES: Array<{ label: string; value: "all" | BlogCategory }> = [
  { label: "All", value: "all" },
  { label: "Growth", value: "Growth" },
  { label: "SEO", value: "SEO" },
  { label: "Design", value: "Design" },
  { label: "Product", value: "Product" },
];
