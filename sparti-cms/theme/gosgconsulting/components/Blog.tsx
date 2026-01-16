import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import Header from './Header';
import Footer from './Footer';
import ContactModal from './ContactModal';
import { getPosts, getCategories, WordPressPost, WordPressCategory, getFeaturedImageUrl, calculateReadTime, getPostCategories } from '../services/wordpressApi';

interface BlogProps {
  tenantName?: string;
  tenantSlug?: string;
}

const Blog: React.FC<BlogProps> = ({ 
  tenantName = 'GO SG Consulting',
  tenantSlug = 'gosgconsulting'
}) => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts and categories from WordPress API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch categories first
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Fetch posts with selected category if applicable
        const categoryId = selectedCategory !== "all" 
          ? categoriesData.find(cat => cat.slug === selectedCategory.toLowerCase().replace(/ /g, '-'))?.id 
          : undefined;
          
        const postsData = await getPosts(1, 20, categoryId);
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching blog data:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCategory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPosts = posts.filter(post => {
    const postTitle = post.title.rendered.toLowerCase();
    const postExcerpt = post.excerpt.rendered.toLowerCase();
    const postCategories = getPostCategories(post).map(cat => cat.name.toLowerCase()).join(' ');
    
    const matchesSearch = searchQuery === '' || 
      postTitle.includes(searchQuery.toLowerCase()) ||
      postExcerpt.includes(searchQuery.toLowerCase()) ||
      postCategories.includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handlePostClick = (slug: string) => {
    // This would be handled by the CMS routing system
    window.location.href = `/theme/${tenantSlug}/blog/${slug}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        onContactClick={() => setIsContactOpen(true)} 
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-40 md:pt-32 pb-12 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                SEO Insights & <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Expert Tips</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-8">
                Stay ahead of the curve with our latest SEO strategies, industry insights, and actionable tips to grow your online presence.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 text-lg rounded-full border-2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts with Sidebar */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="bg-card rounded-lg border p-6 sticky top-8">
                  <h3 className="text-lg font-semibold mb-4">Categories</h3>
                  <ScrollArea className="h-[400px]">
                    <nav className="space-y-1">
                    <button
                      key="all"
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-4 py-2.5 rounded-md transition-colors ${
                        selectedCategory === "all"
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => {
                      const isActive = selectedCategory === category.slug;
                      // Only show categories that have posts
                      if (category.count === 0) return null;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.slug)}
                          className={`w-full text-left px-4 py-2.5 rounded-md transition-colors ${
                            isActive
                              ? "bg-muted text-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          {category.name}
                          <span className="ml-1 text-xs text-muted-foreground">({category.count})</span>
                        </button>
                      );
                    })}
                    </nav>
                  </ScrollArea>
                </div>
              </aside>

              {/* Blog Posts Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg">Loading posts...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 text-lg">{error}</p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No articles found matching your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredPosts.map((post, index) => (
                      <div
                        key={post.id}
                        className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                        onClick={() => handlePostClick(post.slug)}
                      >
                        <div className="relative overflow-hidden">
                          <img 
                            src={getFeaturedImageUrl(post)}
                            alt={post.title.rendered}
                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {getPostCategories(post)[0] && (
                            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                              {getPostCategories(post)[0].name}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center text-sm text-muted-foreground mb-3">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(post.date)}</span>
                            <Clock className="w-4 h-4 ml-4 mr-2" />
                            <span>{calculateReadTime(post.content.rendered)}</span>
                          </div>
                          
                          <h3 
                            className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300"
                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                          />
                          
                          <div 
                            className="text-muted-foreground mb-4 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                          />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {tenantName}
                            </span>
                            
                            <span className="inline-flex items-center text-primary group-hover:text-secondary font-medium text-sm transition-colors duration-300">
                              Read More
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer 
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        onContactClick={() => setIsContactOpen(true)} 
      />
      <ContactModal 
        open={isContactOpen} 
        onOpenChange={setIsContactOpen} 
      />
    </div>
  );
};

export default Blog;