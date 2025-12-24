import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getPosts, WordPressPost, getFeaturedImageUrl, calculateReadTime, getPostCategories } from "@/services/wordpressApi";
import { handleButtonLink } from "@/utils/buttonLinkHandler";
import { usePopup } from "@/contexts/PopupContext";

interface BlogSectionProps {
  items?: Array<{
    key: string;
    type: string;
    content?: string;
    level?: number;
    icon?: string;
    link?: string;
  }>;
  onContactClick?: () => void;
  onPopupOpen?: (popupName: string) => void;
}

/**
 * BlogSection Component
 * 
 * Renders a section showcasing blog posts with content from the CMS
 */
const BlogSection = ({ items = [], onContactClick, onPopupOpen }: BlogSectionProps) => {
  const { openPopup } = usePopup();
  const navigate = useNavigate();
  
  // Find items by key
  const title = items.find(item => item.key === 'title');
  const subtitle = items.find(item => item.key === 'subtitle');
  const button = items.find(item => item.key === 'button');
  
  // State for WordPress blog posts
  const [blogPosts, setBlogPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch latest WordPress blog posts from SEO categories
  useEffect(() => {
    const fetchLatestPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch SEO related categories first
        // You can adjust the category IDs based on your WordPress setup
        // For now, we'll fetch the latest posts and filter them in the component
        const postsData = await getPosts(1, 3);
        
        // Filter posts that have SEO related categories
        // This is a simple filter - you may want to adjust based on your actual categories
        const seoPosts = postsData.filter(post => {
          const categories = getPostCategories(post);
          return categories.some(cat => 
            cat.name.toLowerCase().includes('seo') || 
            cat.name.toLowerCase().includes('search engine') ||
            cat.name.toLowerCase().includes('digital marketing')
          );
        });
        
        // If we don't have enough SEO posts, just use the latest posts
        const postsToShow = seoPosts.length >= 3 ? seoPosts.slice(0, 3) : postsData.slice(0, 3);
        setBlogPosts(postsToShow);
      } catch (err) {
        console.error('Error fetching blog posts for BlogSection:', err);
        setError('Failed to load latest blog posts');
        // Use fallback static data if available
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestPosts();
  }, []);
  
  // Fallback static blog posts in case the API fails
  const staticBlogPosts = [
    {
      id: 1,
      slug: "10-essential-seo-strategies-2024",
      title: "10 Essential SEO Strategies for 2024",
      excerpt: "Discover the latest SEO techniques that will help your website rank higher in search results and drive more organic traffic.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
      date: "2024-01-15",
      readTime: "5 min read"
    },
    {
      id: 2,
      slug: "optimize-website-local-seo",
      title: "How to Optimize Your Website for Local SEO",
      excerpt: "Learn the key tactics to improve your local search visibility and attract more customers from your area.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
      date: "2024-01-10",
      readTime: "7 min read"
    },
    {
      id: 3,
      slug: "complete-guide-technical-seo",
      title: "The Complete Guide to Technical SEO",
      excerpt: "Master the technical aspects of SEO to ensure your website is properly optimized for search engines.",
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&h=300&fit=crop",
      date: "2024-01-05",
      readTime: "8 min read"
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          {title && (
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              {title.content && title.content.split(' ').map((word, i, arr) => 
                i === arr.length - 1 ? (
                  <span key={i} className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                    {word}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h2>
          )}
          
          {subtitle && (
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
              {subtitle.content}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            <div className="col-span-3 flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brandPurple" />
              <span className="ml-2 text-lg">Loading latest posts...</span>
            </div>
          ) : error ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : blogPosts.length > 0 ? (
            blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={getFeaturedImageUrl(post)}
                  alt={post.title.rendered}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {getPostCategories(post)[0] && (
                  <div className="absolute top-4 left-4 bg-brandPurple text-white px-3 py-1 rounded-full text-sm font-medium">
                    {getPostCategories(post)[0].name}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(post.date)}</span>
                  <Clock className="w-4 h-4 ml-4 mr-2" />
                  <span>{calculateReadTime(post.content.rendered)}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-brandPurple transition-colors duration-300"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
                
                <div className="text-gray-600 mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    GOSG Consulting
                  </span>
                  
                  <span className="inline-flex items-center text-brandPurple group-hover:text-brandTeal font-medium text-sm transition-colors duration-300">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))
          ) : (
            // Fallback to static posts if no WordPress posts are available
            staticBlogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-brandPurple text-white px-3 py-1 rounded-full text-sm font-medium">
                    SEO
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(post.date)}</span>
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-brandPurple transition-colors duration-300">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      GOSG Consulting
                    </span>
                    
                    <span className="inline-flex items-center text-brandPurple group-hover:text-brandTeal font-medium text-sm transition-colors duration-300">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {button && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button 
              onClick={() => {
                if (button.link) {
                  handleButtonLink(button.link, onPopupOpen || openPopup);
                } else if (onContactClick) {
                  onContactClick(); // Fallback for backward compatibility
                }
              }}
              variant="cta-outline" 
              size="lg"
            >
              {button.content}
              {button.icon === 'arrowRight' && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;