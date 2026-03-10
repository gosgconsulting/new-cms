import { useState, useEffect, useMemo } from "react";
import { Layout } from "../components/Layout";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  categories?: Array<{ id: number; name: string; slug: string }>;
  terms?: Array<{ id: number; name: string; slug: string; taxonomy: string }>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
}

export default function BlogPage({ basePath, tenantId }: { basePath: string; tenantId?: string }) {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const postsPerPage = 10;

  useEffect(() => {
    const effectiveTenantId =
      tenantId || 
      (typeof window !== "undefined" ? (window as any).__CMS_TENANT__ : undefined) ||
      'tenant-nail-queen'; // Fallback for nail-queen theme

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

        // Fetch all posts (we'll paginate on client side)
        const res = await fetch(
          `/api/v1/blog/posts?tenantId=${encodeURIComponent(effectiveTenantId)}&limit=200&status=published&order=published_at DESC`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch posts (${res.status})`);
        }

        const json = await res.json();
        const fetchedPosts: BlogPost[] = Array.isArray(json?.data) ? json.data : [];

        // Sort by published_at DESC (most recent first)
        fetchedPosts.sort((a, b) => {
          const dateA = a.published_at || a.created_at || a.date || '';
          const dateB = b.published_at || b.created_at || b.date || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        if (!cancelled) {
          setAllPosts(fetchedPosts);
          
          // Extract unique categories from posts
          const categoryMap = new Map<string, Category>();
          
          fetchedPosts.forEach(post => {
            // Check categories array first
            if (post.categories && post.categories.length > 0) {
              post.categories.forEach(cat => {
                if (!categoryMap.has(cat.slug)) {
                  categoryMap.set(cat.slug, {
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    post_count: 0
                  });
                }
              });
            }
            // Also check terms array for backward compatibility
            if (post.terms && post.terms.length > 0) {
              post.terms.forEach(term => {
                if (term.taxonomy === 'category' && !categoryMap.has(term.slug)) {
                  categoryMap.set(term.slug, {
                    id: term.id,
                    name: term.name,
                    slug: term.slug,
                    post_count: 0
                  });
                }
              });
            }
          });
          
          // Count posts per category
          const categoriesWithCounts = Array.from(categoryMap.values()).map(cat => {
            const count = fetchedPosts.filter(post => {
              const postCategories = post.categories || [];
              const postTerms = (post.terms || []).filter(t => t.taxonomy === 'category');
              return postCategories.some(c => c.slug === cat.slug) || 
                     postTerms.some(t => t.slug === cat.slug);
            }).length;
            return { ...cat, post_count: count };
          });
          
          // Sort categories by post count (descending)
          categoriesWithCounts.sort((a, b) => (b.post_count || 0) - (a.post_count || 0));
          
          setCategories(categoriesWithCounts);
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

  // Filter posts by selected category
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      return allPosts;
    }
    
    return allPosts.filter(post => {
      const postCategories = post.categories || [];
      const postTerms = (post.terms || []).filter(t => t.taxonomy === 'category');
      return postCategories.some(c => c.slug === selectedCategory) || 
             postTerms.some(t => t.slug === selectedCategory);
    });
  }, [allPosts, selectedCategory]);

  // Paginate filtered posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return filteredPosts.slice(startIndex, endIndex);
  }, [filteredPosts, currentPage, postsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of blog section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Layout basePath={basePath} tenantId={tenantId}>
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold text-center text-nail-queen-brown mb-8">Our Blog</h1>
          
          {/* Category Tabs */}
          {!isLoading && categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-nail-queen-brown text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({allPosts.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.slug
                      ? 'bg-nail-queen-brown text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.post_count || 0})
                </button>
              ))}
            </div>
          )}
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

          {!isLoading && !error && paginatedPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No blog posts found{selectedCategory ? ` in this category` : ''}.</p>
            </div>
          )}

          {!isLoading && !error && paginatedPosts.length > 0 && (
            <>
              <div className="space-y-8 mb-12">
                {paginatedPosts.map((post) => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-nail-queen-brown hover:bg-gray-100 border border-gray-200'
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      
                      const pageNum = page as number;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[40px] h-10 px-3 rounded-full text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-nail-queen-brown text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-nail-queen-brown hover:bg-gray-100 border border-gray-200'
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
