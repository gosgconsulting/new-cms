import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategory, type BlogPost } from "../../data/blog";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function postUrl(basePath: string, slug: string) {
  const base = basePath.replace(/\/+$/, "");
  return `${base}/blog/${slug}`;
}

function estimateReadTimeMinutes(htmlOrText: string) {
  const text = String(htmlOrText || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

type CmsPost = {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  created_at?: string;
  published_at?: string;
  categories?: Array<{ name: string }>;
  tags?: Array<{ name: string }>;
};

function toThemePost(p: CmsPost): BlogPost {
  const publishedAt = p.published_at || p.created_at || new Date().toISOString();
  const category = p.categories?.[0]?.name || "General";

  return {
    slug: p.slug,
    title: p.title || "Untitled",
    excerpt: p.excerpt || "",
    category,
    publishedAt,
    readTimeMinutes: estimateReadTimeMinutes(p.content || p.excerpt || ""),
    author: { name: "Team" },
  };
}

function BlogCard({ post, basePath }: { post: BlogPost; basePath: string }) {
  return (
    <a
      href={postUrl(basePath, post.slug)}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        {post.featuredImage ? (
          <img
            src={post.featuredImage.src}
            alt={post.featuredImage.alt}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-44 w-full bg-gradient-to-br from-primary/20 to-primary/10" />
        )}

        <div className="absolute left-4 top-4">
          <Badge className="bg-card/90 text-foreground hover:bg-card/95 border border-border">
            {post.category}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-2">
          <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTimeMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.author.name}
          </span>
        </div>

        <div className="mt-5 text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
          Read article <span className="transition-transform group-hover:translate-x-0.5 inline-block">→</span>
        </div>
      </div>
    </a>
  );
}

export default function BlogListPage({ 
  basePath, 
  tenantId,
  tenantName,
  tenantSlug,
  logoSrc,
  onContactClick
}: { 
  basePath: string; 
  tenantId?: string;
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  onContactClick?: () => void;
}) {
  const [category, setCategory] = useState<"all" | BlogCategory>("all");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: "all" | BlogCategory }[]>([]);

  useEffect(() => {
    const effectiveTenantId = tenantId || import.meta.env.VITE_DEPLOY_TENANT_ID;

    if (!effectiveTenantId) {
      setPosts(BLOG_POSTS);
      setCategories(BLOG_CATEGORIES);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/v1/blog/posts?tenantId=${encodeURIComponent(effectiveTenantId)}&limit=30`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch posts (${res.status})`);
        }

        const json = await res.json();
        const rows: CmsPost[] = Array.isArray(json?.data) ? json.data : [];
        const mapped = rows.map(toThemePost);

        if (cancelled) return;

        if (mapped.length > 0) {
          setPosts(mapped);

          const seen = new Set<string>();
          const dynamicCategories: Array<{ label: string; value: "all" | BlogCategory }> = [
            { label: "All", value: "all" },
          ];

          for (const p of mapped) {
            const key = String(p.category || "").trim();
            if (!key || seen.has(key)) continue;
            seen.add(key);
            dynamicCategories.push({ label: key, value: key });
          }

          setCategories(dynamicCategories);
        } else {
          setPosts(BLOG_POSTS);
          setCategories(BLOG_CATEGORIES);
        }
      } catch {
        if (cancelled) return;
        setPosts(BLOG_POSTS);
        setCategories(BLOG_CATEGORIES);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const filtered = useMemo(() => {
    return posts.filter((p) => (category === "all" ? true : p.category === category));
  }, [category, posts]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        onContactClick={onContactClick}
      />
      
      <div className="bg-background">
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Blog</h1>
              <p className="mt-3 text-base text-muted-foreground">
                Simple, practical posts about conversion, SEO, design and product.
              </p>

              <div className="mt-6">
                <Tabs value={category} onValueChange={(v) => setCategory(v as any)}>
                  <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0 text-muted-foreground">
                    {categories.map((c) => (
                      <TabsTrigger
                        key={c.value}
                        value={c.value}
                        className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground shadow-none data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none"
                      >
                        {c.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <BlogCard key={post.slug} post={post} basePath={basePath} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              No articles found for this category.
            </div>
          )}
        </section>
      </div>

      <Footer 
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        companyDescription="Empowering businesses with professional, efficient, and scalable support. Your trusted partner for business success from day one."
      />
    </div>
  );
}
