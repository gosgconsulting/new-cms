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

/**
 * Process blog content HTML to improve markup and readability
 * - Ensures proper heading hierarchy
 * - Converts paragraphs with only bold text to headings when appropriate
 * - Improves structure for better readability
 */
function processBlogContent(html: string): string {
  if (typeof window === 'undefined' || !html) return html;
  
  try {
    // Create a temporary DOM element to parse and modify the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;
    
    // Process paragraphs that might be headings
    const paragraphs = Array.from(body.querySelectorAll('p'));
    
    paragraphs.forEach((p) => {
      const text = p.textContent?.trim() || '';
      const children = Array.from(p.children);
      
      // If paragraph contains only a single <strong> or <b> element
      if (children.length === 1 && (children[0].tagName === 'STRONG' || children[0].tagName === 'B')) {
        const boldText = children[0].textContent?.trim() || '';
        
        // Check if it looks like a heading:
        // - Short text (less than 100 chars)
        // - Doesn't end with punctuation
        // - Followed by another paragraph
        if (boldText.length < 100 && !boldText.match(/[.!?]$/) && boldText.length > 10) {
          const nextSibling = p.nextElementSibling;
          if (nextSibling && (nextSibling.tagName === 'P' || nextSibling.tagName === 'DIV')) {
            // Convert to h2 heading
            const h2 = doc.createElement('h2');
            h2.textContent = boldText;
            p.parentNode?.replaceChild(h2, p);
          }
        }
      }
      
      // Check if paragraph starts with bold text that matches heading patterns
      const firstChild = p.firstElementChild;
      if (firstChild && (firstChild.tagName === 'STRONG' || firstChild.tagName === 'B')) {
        const boldText = firstChild.textContent?.trim() || '';
        const headingPatterns = /^(Why|What|How|When|Where|Which|Who|The|Our|Your|This|These|Classic|Premium|Best|Top|Essential|Important|Key|Main|Types?|Benefits?|Features?|Services?|Packages?|Options?|Tips?|Steps?|Guide|Overview|Introduction|Conclusion|Summary)/i;
        
        if (headingPatterns.test(boldText) && boldText.length < 80 && boldText.length > 10) {
          const nextSibling = p.nextElementSibling;
          if (nextSibling && (nextSibling.tagName === 'P' || nextSibling.tagName === 'DIV')) {
            // Create h2 and move remaining content
            const h2 = doc.createElement('h2');
            h2.textContent = boldText;
            
            // Get remaining content after the bold element
            const remainingContent = p.cloneNode(true) as Element;
            if (remainingContent.firstElementChild) {
              remainingContent.removeChild(remainingContent.firstElementChild);
            }
            
            // Replace paragraph with heading
            p.parentNode?.replaceChild(h2, p);
            
            // If there's remaining content, add it as a new paragraph after the heading
            if (remainingContent.textContent?.trim()) {
              const newP = doc.createElement('p');
              newP.innerHTML = remainingContent.innerHTML;
              h2.parentNode?.insertBefore(newP, h2.nextSibling);
            }
          }
        }
      }
    });
    
    // Return the processed HTML
    return body.innerHTML;
  } catch (error) {
    console.error('[testing] Error processing blog content:', error);
    return html; // Return original HTML on error
  }
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
      tenantId || 
      (typeof window !== "undefined" ? (window as any).__CMS_TENANT__ : undefined) ||
      'tenant-nail-queen'; // Fallback for nail-queen theme

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
          <div className="blog-content">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: processBlogContent(post.content || post.excerpt || "") }}
            />
          </div>

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
