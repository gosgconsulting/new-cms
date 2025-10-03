import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { wordpressApi } from "@/services/wordpressApi";
import { useLatestWordPressPosts } from "@/hooks/use-wordpress-posts";

interface BlogSectionProps {
  onContactClick?: () => void;
}

const BlogSection = ({ onContactClick }: BlogSectionProps) => {
  const { posts: blogPosts, isLoading, error } = useLatestWordPressPosts(3);

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="text-muted-foreground">Loading latest blog posts...</div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state or empty state
  if (error || !blogPosts || blogPosts.length === 0) {
    return (
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Latest SEO <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Insights</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
              Check back soon for expert SEO tips, strategies, and industry insights.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Latest SEO <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Insights</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
            Stay ahead of the curve with our expert SEO tips, strategies, and industry insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
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
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{wordpressApi.formatDate(post.date)}</span>
                  <Clock className="w-4 h-4 ml-4 mr-2" />
                  <span>{Math.ceil(wordpressApi.stripHtml(post.content.rendered).length / 250)} min read</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-brandPurple transition-colors duration-300">
                  {wordpressApi.stripHtml(post.title.rendered)}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt.rendered ? 
                    wordpressApi.stripHtml(post.excerpt.rendered) : 
                    wordpressApi.generateExcerpt(post.content.rendered, 120)
                  }
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    By {post.author_name || 'GOSG Team'}
                  </span>
                  
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-brandPurple hover:text-brandTeal font-medium text-sm transition-colors duration-300"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Implement These SEO Strategies?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our SEO experts can help you implement these proven strategies for your business. 
            Get personalized SEO recommendations that drive real results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <button
              onClick={onContactClick}
              className="bg-gradient-to-r from-brandPurple to-brandTeal text-white px-6 md:px-8 py-3 text-sm md:text-base rounded-lg font-semibold hover:shadow-lg transition-all duration-300 cursor-pointer w-full sm:w-auto"
            >
              Get Your SEO Strategy
            </button>
            
            <Link 
              to="/blog"
              className="text-brandPurple hover:text-brandTeal font-semibold px-6 md:px-8 py-3 text-sm md:text-base rounded-lg hover:bg-brandPurple/5 transition-colors duration-300 w-full sm:w-auto text-center"
            >
              View All Articles
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;