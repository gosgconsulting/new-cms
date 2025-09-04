import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, User, Search, Filter, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  author_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

const BlogArchive = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['blog-posts-archive'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as BlogCategory[];
    },
  });

  const filteredPosts = posts
    ?.filter(post => 
      searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    ?.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      } else if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* SEO Head */}
      <title>Blog Archive - GO SG | Latest Digital Marketing Insights</title>
      <meta 
        name="description" 
        content="Browse our complete collection of digital marketing articles, SEO guides, and business growth insights. Filter by category and find the content you need." 
      />
      <meta name="keywords" content="blog archive, digital marketing, SEO, business growth, marketing insights" />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Blog Archive
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Explore our complete collection of digital marketing insights, SEO strategies, and business growth tips.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {postsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4">Loading articles...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "No articles available at the moment"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-muted-foreground">
                      Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
                      {searchTerm && ` for "${searchTerm}"`}
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => (
                      <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-300">
                        {post.featured_image && (
                          <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        <CardHeader>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(post.published_at)}
                            </div>
                            {post.author_id && (
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                Author
                              </div>
                            )}
                          </div>
                          
                          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {post.excerpt || truncateContent(post.content)}
                          </p>
                          
                          <Button asChild variant="ghost" className="p-0 h-auto font-semibold">
                            <Link to={`/blog/${post.slug}`} className="flex items-center">
                              Read More
                              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogArchive;