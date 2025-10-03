
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { wordpressApi } from "@/services/wordpressApi";
import { useWordPressPosts } from "@/hooks/use-wordpress-posts";
import { Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const { posts, isLoading, error } = useWordPressPosts({
    per_page: postsPerPage,
    page: currentPage,
    orderby: 'date',
    order: 'desc'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pt-32">
          <div className="text-center">Loading blog posts...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pt-32">
          <div className="text-center text-red-600">
            Error loading blog posts. Please try again later.
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pt-32">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
              <p className="text-xl text-muted-foreground">
                Insights, tips, and updates from our team
              </p>
            </div>

          {posts && posts.length > 0 ? (
            <>
              <div className="grid gap-8">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <div className="md:flex">
                      {post.featured_image_url && (
                        <div className="md:w-1/3">
                          <img
                            src={post.featured_image_url}
                            alt={wordpressApi.stripHtml(post.title.rendered)}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                      )}
                      <div className={post.featured_image_url ? "md:w-2/3" : "w-full"}>
                        <CardHeader>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {wordpressApi.formatDate(post.date)}
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {post.author_name || 'GOSG Team'}
                            </div>
                          </div>
                          <CardTitle className="text-2xl hover:text-coral transition-colors">
                            <Link to={`/blog/${post.slug}`}>
                              {wordpressApi.stripHtml(post.title.rendered)}
                            </Link>
                          </CardTitle>
                          <CardDescription className="text-base">
                            {post.excerpt.rendered ? 
                              wordpressApi.stripHtml(post.excerpt.rendered) : 
                              wordpressApi.generateExcerpt(post.content.rendered, 200)
                            }
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="text-coral hover:text-coral/80 font-medium"
                          >
                            Read more →
                          </Link>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls - Modern Minimal Design */}
              <div className="flex justify-center items-center gap-2 mt-16 mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="h-10 w-10 rounded-full hover:bg-brandPurple/10 hover:text-brandPurple disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-300"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-brandPurple/10 to-brandTeal/10 border border-brandPurple/20">
                    <span className="text-sm font-medium bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                      Page {currentPage}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentPage(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={!posts || posts.length < postsPerPage}
                  className="h-10 w-10 rounded-full hover:bg-brandPurple/10 hover:text-brandPurple disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-300"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No blog posts yet</h2>
              <p className="text-muted-foreground">
                Check back soon for updates and insights from our team.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
