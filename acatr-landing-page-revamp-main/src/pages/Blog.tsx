import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/useBlogData";
import { BlogPost } from "@/types/blog";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch blog posts from API
  const { data: blogPostsData, isLoading, error } = useBlogPosts();

  // Transform API data to match component structure
  const blogPosts: BlogPost[] = useMemo(() => {
    if (!blogPostsData) return [];
    
    return blogPostsData.map((post) => {
      // Format date if needed
      const formattedDate = post.date || post.created_at 
        ? new Date(post.date || post.created_at || '').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : '';
      
      // Calculate read time if not provided (rough estimate: 200 words per minute)
      const wordCount = post.content ? post.content.split(/\s+/).length : 0;
      const readTime = post.readTime || `${Math.ceil(wordCount / 200)} min read`;
      
      return {
        ...post,
        date: formattedDate,
        readTime,
        excerpt: post.excerpt || post.content?.substring(0, 200) + '...' || '',
        image: post.image || '/api/placeholder/400/250',
      };
    });
  }, [blogPostsData]);

  // Use API data
  const postsToUse = blogPosts;

  const categories = useMemo(() => {
    const allCategories = postsToUse.map(post => post.category).filter(Boolean);
    const uniqueCategories = Array.from(new Set(allCategories));
    
    return [
      { name: "All", value: "all", count: postsToUse.length },
      ...uniqueCategories.map(cat => ({
        name: cat,
        value: cat,
        count: postsToUse.filter(post => post.category === cat).length
      }))
    ];
  }, [postsToUse]);

  const filteredPosts = postsToUse.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Company Incorporation":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200";
      case "Accounting & Tax":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "Corporate Secretary":
        return "bg-pink-100 text-pink-700 hover:bg-pink-200";
      case "Compliance & Regulations":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state (still show UI but log error)
  if (error) {
    console.error("Error loading blog posts:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Singapore Business <span className="text-primary">Insights & Expert Tips</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay ahead with our latest insights on Singapore company incorporation, accounting services, corporate compliance, and actionable tips to grow your business in Singapore.
            </p>
            <div className="relative max-w-2xl mx-auto mt-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h2 className="text-xl font-semibold text-foreground mb-4">Categories</h2>
                <nav className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedCategory === category.value
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <span className={`text-sm ${
                          selectedCategory === category.value
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}>
                          ({category.count})
                        </span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Blog Posts Grid */}
            <main className="flex-1">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                      <div className="relative w-full h-48 bg-muted overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to a gradient if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.style.background = 'linear-gradient(135deg, hsl(263 70% 59%), hsl(263 60% 45%))';
                          }}
                        />
                      </div>
                      <CardContent className="flex-1 p-6 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{post.date}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3">
                          {post.excerpt}
                        </p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0 flex items-center justify-between">
                        <Badge className={getCategoryBadgeColor(post.category)}>
                          {post.category}
                        </Badge>
                        <Button
                          variant="ghost"
                          className="text-primary hover:text-primary/80 group"
                          asChild
                        >
                          <Link to={`/blog/${post.slug}`}>
                            Read more
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;

