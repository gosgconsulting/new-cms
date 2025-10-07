import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { wordpressApi } from "@/services/wordpressApi";
import { useWordPressPosts } from "@/hooks/use-wordpress-posts";
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ContactModal from "@/components/ContactModal";

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const postsPerPage = 9;

  const { posts, isLoading, error } = useWordPressPosts({
    per_page: postsPerPage,
    page: currentPage,
    orderby: 'date',
    order: 'desc'
  });

  // Sample categories - in production, these would come from WordPress API
  const categories = [
    "All tags",
    "Time-Saving Tools",
    "Blogging Tips",
    "Content Marketing Trends",
    "Keyword Research",
    "SEO Best Practices"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onContactClick={() => setContactModalOpen(true)} />
        <main className="flex-grow container mx-auto px-4 py-8 pt-32">
          <div className="text-center">Loading blog posts...</div>
        </main>
        <Footer onContactClick={() => setContactModalOpen(true)} />
        <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onContactClick={() => setContactModalOpen(true)} />
        <main className="flex-grow container mx-auto px-4 py-8 pt-32">
          <div className="text-center text-red-600">
            Error loading blog posts. Please try again later.
          </div>
        </main>
        <Footer onContactClick={() => setContactModalOpen(true)} />
        <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onContactClick={() => setContactModalOpen(true)} />
      <main className="flex-grow bg-gradient-to-br from-gray-50 to-blue-50/30 pt-32 pb-20 px-4">
        <div className="container mx-auto">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              SEO <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Insights</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Expert tips, strategies, and industry insights to help you dominate search rankings
            </p>
          </motion.div>

          {/* Main Content with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Categories */}
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(category === "All tags" ? null : category)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                        (category === "All tags" && !selectedCategory) || selectedCategory === category
                          ? "bg-gradient-to-r from-brandPurple/10 to-brandTeal/10 text-gray-900 font-medium border border-brandPurple/20"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>

            {/* Right Content - Blog Grid */}
            <div className="flex-1">
              {posts && posts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                      <Link 
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="block"
                      >
                        <motion.article
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col"
                        >
                          <div className="relative overflow-hidden">
                            <img 
                              src={post.featured_image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop"}
                              alt={wordpressApi.stripHtml(post.title.rendered)}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-4 left-4 bg-brandPurple text-white px-3 py-1 rounded-full text-sm font-medium">
                              SEO
                            </div>
                          </div>
                          
                          <div className="p-6 flex flex-col flex-grow">
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{wordpressApi.formatDate(post.date)}</span>
                              <Clock className="w-4 h-4 ml-4 mr-2" />
                              <span>{Math.ceil(wordpressApi.stripHtml(post.content.rendered).length / 250)} min read</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-brandPurple transition-colors duration-300">
                              {wordpressApi.stripHtml(post.title.rendered)}
                            </h3>
                            
                            <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                              {post.excerpt.rendered ? 
                                wordpressApi.stripHtml(post.excerpt.rendered) : 
                                wordpressApi.generateExcerpt(post.content.rendered, 120)
                              }
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-sm font-medium text-gray-700">
                                act@gosgconsulting
                              </span>
                              
                              <span className="inline-flex items-center text-brandPurple group-hover:text-brandTeal font-medium text-sm transition-colors duration-300">
                                Read More
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                              </span>
                            </div>
                          </div>
                        </motion.article>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-2 mt-12">
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
                <div className="text-center py-12 bg-white rounded-xl">
                  <h2 className="text-2xl font-semibold mb-4">No blog posts yet</h2>
                  <p className="text-muted-foreground">
                    Check back soon for updates and insights from our team.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer onContactClick={() => setContactModalOpen(true)} />
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};

export default Blog;
