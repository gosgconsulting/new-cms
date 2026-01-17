import React, { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategory, type BlogPost } from "../../data/blog";

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function postUrl(basePath: string, slug: string) {
  const base = basePath.replace(/\/+$/, "");
  return `${base}/blog/${slug}`;
}

function BlogCard({ post, basePath }: { post: BlogPost; basePath: string }) {
  return (
    <a
      href={postUrl(basePath, post.slug)}
      className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
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
          <div className="h-44 w-full bg-brand-gradient-animated" />
        )}

        <div className="absolute left-4 top-4">
          <Badge className="bg-white/90 text-slate-900 hover:bg-white/95 border border-black/10">
            {post.category}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-2">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-950">
            {post.title}
          </h3>
          <p className="text-sm leading-6 text-slate-600">{post.excerpt}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
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

        <div className="mt-5 text-sm font-semibold text-slate-900">
          Read article <span className="transition-transform group-hover:translate-x-0.5 inline-block">→</span>
        </div>
      </div>
    </a>
  );
}

export default function BlogListPage({ basePath }: { basePath: string }) {
  const [category, setCategory] = useState<"all" | BlogCategory>("all");

  const filtered = useMemo(() => {
    return BLOG_POSTS.filter((p) => (category === "all" ? true : p.category === category));
  }, [category]);

  return (
    <div className="bg-(--brand-background)">
      <section className="border-b border-black/10 bg-(--brand-background-alt)">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Blog</h1>
            <p className="mt-3 text-base text-slate-600">
              Simple, practical posts about conversion, SEO, design and product.
            </p>

            <div className="mt-6">
              <Tabs value={category} onValueChange={(v) => setCategory(v as any)}>
                <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0 text-slate-600">
                  {BLOG_CATEGORIES.map((c) => (
                    <TabsTrigger
                      key={c.value}
                      value={c.value}
                      className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-none data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
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
          <div className="mt-10 rounded-2xl border border-dashed border-black/20 bg-white p-8 text-center text-slate-600">
            No articles found for this category.
          </div>
        )}
      </section>
    </div>
  );
}
