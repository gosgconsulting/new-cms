import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { BLOG_POSTS } from "../../data/blog";

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
  categories?: Array<{ name: string }>;
  tags?: Array<{ name: string }>;
};

export default function BlogPostPage({
  basePath,
  slug,
  tenantId,
}: {
  basePath: string;
  slug: string;
  tenantId?: string;
}) {
  const [cmsPost, setCmsPost] = useState<CmsPost | null>(null);

  const staticPost = useMemo(() => BLOG_POSTS.find((p) => p.slug === slug), [slug]);

  useEffect(() => {
    const effectiveTenantId =
      tenantId || (typeof window !== "undefined" ? (window as any).__CMS_TENANT__ : undefined);

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-2xl rounded-2xl border border-black/10 bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">Post not found</h1>
          <p className="mt-2 text-slate-600">The article you're looking for doesn't exist.</p>
          <a
            href={blogIndexUrl(basePath)}
            className="mt-6 inline-flex items-center font-semibold text-slate-900 hover:underline"
          >
            ← Back to blog
          </a>
        </div>
      </div>
    );
  }

  const publishedAt =
    (post as any).publishedAt || (post as any).published_at || (post as any).created_at || new Date().toISOString();
  const category =
    (post as any).category || (post as any).categories?.[0]?.name || "General";
  const authorName = (post as any).author?.name || "Team";
  const readTimeMinutes =
    (post as any).readTimeMinutes || estimateReadTimeMinutes((post as any).content || (post as any).excerpt || "");

  return (
    <div className="bg-(--brand-background)">
      <section className="border-b border-black/10 bg-(--brand-background-alt)">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-3xl">
            <a
              href={blogIndexUrl(basePath)}
              className="inline-flex items-center text-sm font-semibold text-slate-900 hover:underline"
            >
              ← Back to blog
            </a>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge className="bg-white/90 text-slate-900 hover:bg-white/95 border border-black/10">
                {category}
              </Badge>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {readTimeMinutes} min read
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {authorName}
                </span>
              </div>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {(post as any).title}
            </h1>
            {(post as any).excerpt && <p className="mt-3 text-base text-slate-600">{(post as any).excerpt}</p>}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="max-w-3xl">
          {"featuredImage" in (post as any) && (post as any).featuredImage && (
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[var(--shadow-sm)]">
              <img
                src={(post as any).featuredImage.src}
                alt={(post as any).featuredImage.alt}
                className="w-full object-cover max-h-[420px]"
                loading="lazy"
              />
            </div>
          )}

          <div className="mt-8 space-y-6 text-slate-700 leading-7">
            {cmsPost?.content ? (
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: cmsPost.content }}
              />
            ) : (
              <>
                {((staticPost as any)?.content || []).map((block: any, idx: number) => {
                  if (block.type === "h2") {
                    return (
                      <h2 key={idx} className="text-xl font-bold tracking-tight text-slate-900">
                        {block.text}
                      </h2>
                    );
                  }

                  if (block.type === "ul") {
                    return (
                      <ul key={idx} className="list-disc pl-6 space-y-2">
                        {block.items.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === "quote") {
                    return (
                      <blockquote
                        key={idx}
                        className="rounded-2xl border border-black/10 bg-white p-5 text-slate-900 shadow-[var(--shadow-sm)]"
                      >
                        <p className="font-medium">"{block.text}"</p>
                      </blockquote>
                    );
                  }

                  return <p key={idx}>{block.text}</p>;
                })}

                {(!staticPost?.content || staticPost.content.length === 0) && (
                  <p>
                    This is a sample post. Add content blocks to <code>sparti-cms/theme/master/data/blog.ts</code> to
                    expand it.
                  </p>
                )}
              </>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}