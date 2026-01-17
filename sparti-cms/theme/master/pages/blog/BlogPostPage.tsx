import React from "react";
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

export default function BlogPostPage({ basePath, slug }: { basePath: string; slug: string }) {
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-2xl rounded-2xl border border-black/10 bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">Post not found</h1>
          <p className="mt-2 text-slate-600">
            The article you’re looking for doesn’t exist.
          </p>
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
                {post.category}
              </Badge>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
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
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {post.title}
            </h1>
            <p className="mt-3 text-base text-slate-600">{post.excerpt}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="max-w-3xl">
          {post.featuredImage && (
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[var(--shadow-sm)]">
              <img
                src={post.featuredImage.src}
                alt={post.featuredImage.alt}
                className="w-full object-cover max-h-[420px]"
                loading="lazy"
              />
            </div>
          )}

          <div className="mt-8 space-y-6 text-slate-700 leading-7">
            {(post.content || []).map((block, idx) => {
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
                    {block.items.map((item, i) => (
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
                    <p className="font-medium">“{block.text}”</p>
                  </blockquote>
                );
              }

              return <p key={idx}>{block.text}</p>;
            })}

            {(!post.content || post.content.length === 0) && (
              <p>
                This is a sample post. Add content blocks to <code>sparti-cms/theme/master/data/blog.ts</code> to
                expand it.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
