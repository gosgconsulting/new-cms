
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BlogHero } from "@/components/ui/blog-hero";
import { useWordPressPosts, useWordPressCategories, useWordPressTags } from "@/hooks/use-wordpress";
import { ChevronLeft, ChevronRight } from "lucide-react";

const POSTS_PER_PAGE = 12;

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: posts, isLoading, error } = useWordPressPosts({
    status: 'publish',
    per_page: 100, // Get more posts for pagination
    orderby: 'date',
    order: 'desc'
  });

  const { data: categories } = useWordPressCategories();
  const { data: tags } = useWordPressTags();

  // Calculate pagination
  const totalPosts = posts?.length || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">Loading blog posts...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center text-red-600">
              Error loading blog posts. Please try again later.
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <BlogHero 
        title="Our Blog"
        description="Insights, strategies, and expert tips to help grow your business through digital marketing. Stay updated with the latest trends and proven techniques from our team."
        ctaText="Contact Us"
        ctaLink="/contact"
      />

      {/* Blog Posts Section */}
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-20">
          {currentPosts.length > 0 ? (
            <>
              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentPosts.map((post, index) => {
                  const categoryName = categories?.find(cat => post.categories.includes(cat.id))?.name || '';
                  const postTags = post.tags.map(tagId => 
                    tags?.find(tag => tag.id === tagId)?.name
                  ).filter(Boolean);
                  const postDate = new Date(post.date).toLocaleDateString();

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-card rounded-xl overflow-hidden border border-border hover:border-coral/50 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                      onClick={() => window.location.href = `/blog/${post.slug}`}
                    >
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {categoryName && (
                            <Badge variant="secondary" className="bg-coral/10 text-coral text-xs font-medium">
                              {categoryName}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {postDate}
                          </span>
                        </div>
                        <h3 
                          className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-coral transition-colors"
                          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                        <div 
                          className="text-muted-foreground mb-4 line-clamp-3 text-sm"
                          dangerouslySetInnerHTML={{ 
                            __html: post.excerpt?.rendered 
                              ? post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                              : post.content.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {postTags.slice(0, 2).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className="text-xs px-2 py-1 bg-muted rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`rounded-full min-w-[40px] ${
                        currentPage === page 
                          ? "bg-coral text-white hover:bg-coral/90" 
                          : "hover:bg-coral/10 hover:text-coral hover:border-coral/50"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-semibold mb-4">No blog posts yet</h2>
                <p className="text-muted-foreground mb-6">
                  Check back soon for insights and updates from our team.
                </p>
                <Button asChild variant="coral" size="lg">
                  <a href="/contact">Contact Us</a>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
