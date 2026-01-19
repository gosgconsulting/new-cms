import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Link } from "react-router-dom";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  og_image?: string;
  published_at?: string;
  created_at?: string;
  categories?: Array<{ name: string; slug: string }>;
  tags?: Array<{ name: string; slug: string }>;
}

function formatDate(dateString?: string) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function stripHtml(html: string) {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export default function BlogPostPage({
  basePath,
  slug,
  tenantId,
}: {
  basePath: string;
  slug: string;
  tenantId?: string;
}) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const effectiveTenantId =
      tenantId || (typeof window !== "undefined" ? (window as any).__CMS_TENANT__ : undefined);

    if (!effectiveTenantId || !slug) {
      setIsLoading(false);
      setError("Missing tenant ID or post slug");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(
          `/api/v1/blog/posts/${encodeURIComponent(slug)}?tenantId=${encodeURIComponent(effectiveTenantId)}`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`Failed to fetch post (${res.status})`);
        }

        const json = await res.json();
        const data: BlogPost | null = json?.data ?? null;

        if (!cancelled) {
          if (data && data.slug) {
            setPost(data);
          } else {
            setError("Post not found");
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[testing] Error fetching blog post:", err);
          setError(err.message || "Failed to load blog post");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, tenantId]);

  const getFeaturedImage = (post: BlogPost | null) => {
    if (!post) return null;
    return post.og_image || post.featured_image || null;
  };

  if (isLoading) {
    return (
      <Layout basePath={basePath}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout basePath={basePath}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-nail-queen-brown mb-4">Post not found</h1>
            <p className="text-gray-600 mb-6">{error || "The article you're looking for doesn't exist."}</p>
            <Link
              to={`${basePath}/blog`}
              className="text-nail-queen-brown text-sm font-medium hover:underline"
            >
              ← Back to blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const featuredImage = getFeaturedImage(post);
  const publishedDate = formatDate(post.published_at || post.created_at);

  return (
    <Layout basePath={basePath}>
      <article className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Image */}
          {featuredImage && (
            <div className="mb-8">
              <img
                src={featuredImage}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Post Header */}
          <header className="mb-8">
            <Link
              to={`${basePath}/blog`}
              className="text-nail-queen-brown text-sm font-medium hover:underline mb-4 inline-block"
            >
              ← Back to blog
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-nail-queen-brown mb-4">{post.title}</h1>
            {publishedDate && (
              <p className="text-gray-600 text-sm mb-4">Published on {publishedDate}</p>
            )}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map((category) => (
                  <span
                    key={category.slug}
                    className="px-3 py-1 bg-nail-queen-brown/10 text-nail-queen-brown text-xs font-medium rounded-full"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Post Content */}
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || "" }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog Link */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              to={`${basePath}/blog`}
              className="text-nail-queen-brown text-sm font-medium hover:underline"
            >
              ← Back to blog
            </Link>
          </div>
        </div>
      </article>
    </Layout>
  );
}
