import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Link } from "react-router-dom";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featured_image?: string;
  og_image?: string;
  published_at?: string;
  created_at?: string;
  date?: string;
}

export default function BlogPage({ basePath, tenantId }: { basePath: string; tenantId?: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const effectiveTenantId =
      tenantId || (typeof window !== "undefined" ? (window as any).__CMS_TENANT__ : undefined);

    if (!effectiveTenantId) {
      setIsLoading(false);
      setError("Tenant ID not available");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(
          `/api/v1/blog/posts?tenantId=${encodeURIComponent(effectiveTenantId)}&limit=20&status=published`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch posts (${res.status})`);
        }

        const json = await res.json();
        const fetchedPosts: BlogPost[] = Array.isArray(json?.data) ? json.data : [];

        if (!cancelled) {
          setPosts(fetchedPosts);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[testing] Error fetching blog posts:", err);
          setError(err.message || "Failed to load blog posts");
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
  }, [tenantId]);

  const formatDate = (dateString?: string) => {
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
  };

  const getFeaturedImage = (post: BlogPost) => {
    return post.og_image || post.featured_image || "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  return (
    <Layout basePath={basePath}>
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold text-center text-nail-queen-brown mb-16">Our Blog</h1>
        </div>
      </section>

      <section className="pb-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading blog posts...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No blog posts found.</p>
            </div>
          )}

          {!isLoading && !error && posts.length > 0 && (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={getFeaturedImage(post)}
                        alt={post.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <h2 className="text-xl font-bold text-nail-queen-brown mb-3">{post.title}</h2>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {post.excerpt || "No excerpt available."}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {formatDate(post.published_at || post.created_at || post.date)}
                        </span>
                        <Link
                          to={`${basePath}/blog/${post.slug}`}
                          className="text-nail-queen-brown text-sm font-medium hover:underline"
                        >
                          Read more
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
