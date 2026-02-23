import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BLOG_POSTS } from "../../data/blog";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function blogIndexUrl(basePath: string) {
  const base = basePath.replace(/\/+$/, "");
  return `${base}/blog`;
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
  featured_image?: string | null;
  categories?: Array<{ name: string }>;
  tags?: Array<{ name: string }>;
};

function getHeroImage(post: any): { src: string; alt: string } | null {
  const title = String(post?.title || "");

  // Static demo posts
  if (post?.featuredImage?.src) {
    return {
      src: String(post.featuredImage.src),
      alt: String(post.featuredImage.alt || title || "Blog post hero image"),
    };
  }

  // CMS posts
  if (post?.featured_image) {
    return {
      src: String(post.featured_image),
      alt: title || "Blog post hero image",
    };
  }

  return null;
}

export default function BlogPostPage({
  basePath,
  slug,
  tenantId,
  tenantName,
  tenantSlug,
  logoSrc,
  onContactClick
}: {
  basePath: string;
  slug: string;
  tenantId?: string;
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  onContactClick?: () => void;
}) {
  const [cmsPost, setCmsPost] = useState<CmsPost | null>(null);

  const staticPost = useMemo(() => BLOG_POSTS.find((p) => p.slug === slug), [slug]);

  useEffect(() => {
    const effectiveTenantId = import.meta.env.VITE_DEPLOY_TENANT_ID;

    if (!effectiveTenantId || !slug) {
      setCmsPost(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/v1/blog/posts/${encodeURIComponent(slug)}?tenantId=${encodeURIComponent(effectiveTenantId)}`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch post (${res.status})`);
        }

        const json = await res.json();
        const data: CmsPost | null = json?.data ?? null;

        if (!cancelled) {
          setCmsPost(data && data.slug ? data : null);
        }
      } catch {
        if (!cancelled) {
          setCmsPost(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, tenantId]);

  const post = cmsPost || staticPost;

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          tenantName={tenantName}
          tenantSlug={tenantSlug}
          logoSrc={logoSrc}
          onContactClick={onContactClick}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl rounded-2xl border border-border bg-card p-8">
            <h1 className="text-xl font-bold text-foreground">Post not found</h1>
            <p className="mt-2 text-muted-foreground">The article you're looking for doesn't exist.</p>
            <a
              href={blogIndexUrl(basePath)}
              className="mt-6 inline-flex items-center font-semibold text-primary hover:underline"
            >
              ← Back to blog
            </a>
          </div>
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

  const publishedAt =
    (post as any).publishedAt ||
    (post as any).published_at ||
    (post as any).created_at ||
    new Date().toISOString();

  const category = (post as any).category || (post as any).categories?.[0]?.name || "General";
  const authorName = (post as any).author?.name || "Team";
  const readTimeMinutes =
    (post as any).readTimeMinutes || estimateReadTimeMinutes((post as any).content || (post as any).excerpt || "");

  const heroImage = getHeroImage(post);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        onContactClick={onContactClick}
      />
      
      <div className="bg-background">
        {/* 1) Hero image (editorial, no overlays) */}
        {heroImage ? (
          <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mt-14 sm:mt-16 mb-8 sm:mb-10">
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-md">
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={heroImage.src}
                    alt={heroImage.alt}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                </AspectRatio>
              </div>
            </div>
          </section>
        ) : (
          <div className="mt-14 sm:mt-16" />
        )}

        <section className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 pb-14">
          {/* 2) Post metadata (before title) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <Badge className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border font-normal">
              {category}
            </Badge>
            <span>{formatDate(publishedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{readTimeMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <span>{authorName}</span>
          </div>

          {/* 3) Post title */}
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {(post as any).title}
          </h1>

          {/* 4) Intro paragraph */}
          {(post as any).excerpt ? (
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{(post as any).excerpt}</p>
          ) : null}

          {/* 5) Main content */}
          <article className="mt-10">
            {cmsPost?.content ? (
              <div
                className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-foreground"
                dangerouslySetInnerHTML={{ __html: cmsPost.content }}
              />
            ) : (
              <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-foreground">
                {((staticPost as any)?.content || []).map((block: any, idx: number) => {
                  if (block.type === "h2") {
                    return <h2 key={idx} className="text-foreground">{block.text}</h2>;
                  }

                  if (block.type === "ul") {
                    return (
                      <ul key={idx} className="text-muted-foreground">
                        {block.items.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === "quote") {
                    return (
                      <blockquote key={idx} className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                        <p>"{block.text}"</p>
                      </blockquote>
                    );
                  }

                  return <p key={idx} className="text-muted-foreground">{block.text}</p>;
                })}

                {(!staticPost?.content || staticPost.content.length === 0) && (
                  <p className="text-muted-foreground">
                    This is a sample post. Add content blocks to <code className="bg-secondary px-1 py-0.5 rounded text-foreground">sparti-cms/theme/landingpage/data/blog.ts</code> to
                    expand it.
                  </p>
                )}
              </div>
            )}
          </article>

          {/* Back link (kept out of the editorial flow above) */}
          <div className="mt-12">
            <a href={blogIndexUrl(basePath)} className="inline-flex items-center font-semibold text-primary hover:text-primary/80 transition-colors">
              ← Back to blog
            </a>
          </div>
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
