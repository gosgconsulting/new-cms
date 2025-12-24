import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import { getPostBySlug, getRelatedPosts, WordPressPost, getFeaturedImageUrl, calculateReadTime, getPostCategories, getPostTags } from "@/services/wordpressApi";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch post data from WordPress API
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch the post by slug
        const postData = await getPostBySlug(slug);
        
        if (!postData) {
          setError('Post not found');
          setLoading(false);
          return;
        }
        
        setPost(postData);
        
        // Fetch related posts based on the post's categories
        if (postData.categories && postData.categories.length > 0) {
          const related = await getRelatedPosts(postData.categories, postData.id, 3);
          setRelatedPosts(related);
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [slug]);
  
  // Fallback static blog posts for development/testing
  const staticBlogPosts = [
    {
      id: 1,
      slug: "10-essential-seo-strategies-2024",
      title: "10 Essential SEO Strategies for 2024",
      excerpt: "Discover the latest SEO techniques that will help your website rank higher in search results and drive more organic traffic.",
      content: `
        <h2>Introduction</h2>
        <p>Search Engine Optimization continues to evolve, and staying ahead of the curve is crucial for online success. In this comprehensive guide, we'll explore the most effective SEO strategies that will help your website dominate search results in 2024.</p>
        
        <h2>1. Focus on User Experience (UX)</h2>
        <p>Google's algorithms increasingly prioritize websites that provide excellent user experiences. This means fast loading times, mobile responsiveness, intuitive navigation, and engaging content that keeps visitors on your site.</p>
        
        <h2>2. Optimize for Core Web Vitals</h2>
        <p>Core Web Vitals are essential metrics that Google uses to measure user experience. Focus on improving your Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS) scores.</p>
        
        <h2>3. Create High-Quality, E-E-A-T Content</h2>
        <p>Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) are crucial ranking factors. Create content that demonstrates your expertise and builds trust with your audience.</p>
        
        <h2>4. Implement Structured Data</h2>
        <p>Schema markup helps search engines understand your content better and can lead to rich snippets in search results, improving your click-through rates.</p>
        
        <h2>5. Optimize for Voice Search</h2>
        <p>With the rise of voice assistants, optimizing for conversational queries and long-tail keywords is more important than ever.</p>
        
        <h2>Conclusion</h2>
        <p>Implementing these SEO strategies will position your website for success in 2024 and beyond. Remember, SEO is a long-term game that requires consistent effort and adaptation to algorithm changes.</p>
      `,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "SEO Strategy",
      tags: ["SEO", "Digital Marketing", "Strategy"]
    },
    {
      id: 2,
      slug: "optimize-website-local-seo",
      title: "How to Optimize Your Website for Local SEO",
      excerpt: "Learn the key tactics to improve your local search visibility and attract more customers from your area.",
      content: `
        <h2>Why Local SEO Matters</h2>
        <p>Local SEO helps businesses promote their products and services to local customers at the exact time they're looking for them online. With mobile searches for "near me" queries growing exponentially, local SEO is more critical than ever.</p>
        
        <h2>Optimize Your Google Business Profile</h2>
        <p>Your Google Business Profile is the cornerstone of local SEO. Ensure all information is accurate, complete, and regularly updated with posts, photos, and customer reviews.</p>
        
        <h2>Build Local Citations</h2>
        <p>Consistent NAP (Name, Address, Phone) information across all online directories and platforms helps establish trust and authority with search engines.</p>
        
        <h2>Create Location-Specific Content</h2>
        <p>Develop content that speaks to your local audience, including local news, events, and community involvement.</p>
        
        <h2>Get Customer Reviews</h2>
        <p>Positive reviews not only influence potential customers but also signal to search engines that your business is trustworthy and relevant.</p>
      `,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
      date: "2024-01-10",
      readTime: "7 min read",
      category: "Local SEO",
      tags: ["Local SEO", "Google Business", "Reviews"]
    },
    {
      id: 3,
      slug: "complete-guide-technical-seo",
      title: "The Complete Guide to Technical SEO",
      excerpt: "Master the technical aspects of SEO to ensure your website is properly optimized for search engines.",
      content: `
        <h2>What is Technical SEO?</h2>
        <p>Technical SEO refers to optimizing your website's infrastructure to help search engines crawl, index, and understand your content more effectively.</p>
        
        <h2>Site Speed Optimization</h2>
        <p>Page speed is a critical ranking factor. Compress images, minify code, leverage browser caching, and use a Content Delivery Network (CDN) to improve load times.</p>
        
        <h2>Mobile-First Indexing</h2>
        <p>Google now primarily uses the mobile version of content for indexing and ranking. Ensure your site is fully responsive and provides an excellent mobile experience.</p>
        
        <h2>XML Sitemaps and Robots.txt</h2>
        <p>Submit an XML sitemap to help search engines discover your pages, and use robots.txt to control which pages should be crawled.</p>
        
        <h2>HTTPS Security</h2>
        <p>Secure your website with HTTPS. It's a ranking signal and builds trust with visitors.</p>
        
        <h2>Fix Crawl Errors</h2>
        <p>Regularly check Google Search Console for crawl errors and fix broken links, redirect chains, and 404 errors.</p>
      `,
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&h=600&fit=crop",
      date: "2024-01-05",
      readTime: "8 min read",
      category: "Technical SEO",
      tags: ["Technical SEO", "Website Speed", "Security"]
    },
    {
      id: 4,
      slug: "content-marketing-strategies",
      title: "Content Marketing Strategies That Actually Work",
      excerpt: "Explore proven content marketing strategies that drive engagement and boost your SEO performance.",
      content: `
        <h2>The Power of Content Marketing</h2>
        <p>Content marketing is about creating valuable, relevant content that attracts and retains your target audience, ultimately driving profitable customer action.</p>
        
        <h2>Know Your Audience</h2>
        <p>Create detailed buyer personas to understand your audience's pain points, interests, and content preferences.</p>
        
        <h2>Diversify Content Formats</h2>
        <p>Mix blog posts, videos, infographics, podcasts, and interactive content to reach different audience segments and keep your content fresh.</p>
        
        <h2>Tell Stories</h2>
        <p>People connect with stories. Use storytelling techniques to make your content more engaging and memorable.</p>
        
        <h2>Optimize for Search and Social</h2>
        <p>Create content that's optimized for both search engines and social sharing to maximize reach and engagement.</p>
      `,
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop",
      date: "2023-12-28",
      readTime: "6 min read",
      category: "Content Marketing",
      tags: ["Content Marketing", "Strategy", "Engagement"]
    },
    {
      id: 5,
      slug: "link-building-best-practices-2024",
      title: "Link Building Best Practices for 2024",
      excerpt: "Discover effective link building techniques that comply with search engine guidelines and deliver results.",
      content: `
        <h2>Why Links Still Matter</h2>
        <p>Backlinks remain one of the most important ranking factors. Quality links from authoritative sites signal to search engines that your content is valuable and trustworthy.</p>
        
        <h2>Create Link-Worthy Content</h2>
        <p>The foundation of any link building strategy is creating content that people naturally want to link to. Focus on original research, comprehensive guides, and unique insights.</p>
        
        <h2>Guest Blogging</h2>
        <p>Contribute high-quality guest posts to reputable sites in your industry. Focus on providing value rather than just getting links.</p>
        
        <h2>Build Relationships</h2>
        <p>Network with industry influencers, journalists, and other content creators. Genuine relationships lead to natural link opportunities.</p>
        
        <h2>Monitor Your Backlink Profile</h2>
        <p>Regularly audit your backlinks to identify and disavow toxic links that could harm your rankings.</p>
      `,
      image: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=1200&h=600&fit=crop",
      date: "2023-12-20",
      readTime: "9 min read",
      category: "Link Building",
      tags: ["Link Building", "Backlinks", "Authority"]
    },
    {
      id: 6,
      slug: "mobile-first-seo-guide",
      title: "Mobile-First SEO: Why It Matters More Than Ever",
      excerpt: "Learn why mobile optimization is crucial for SEO success and how to implement mobile-first strategies.",
      content: `
        <h2>The Mobile-First World</h2>
        <p>With mobile devices accounting for over 60% of web traffic, Google has shifted to mobile-first indexing, meaning it primarily uses the mobile version of your site for ranking.</p>
        
        <h2>Responsive Design is Essential</h2>
        <p>Ensure your website adapts seamlessly to all screen sizes. Responsive design is no longer optional—it's a necessity.</p>
        
        <h2>Optimize Touch Elements</h2>
        <p>Make buttons and links large enough to be easily tapped on mobile devices, with adequate spacing between clickable elements.</p>
        
        <h2>Streamline Mobile Navigation</h2>
        <p>Mobile users need quick, intuitive navigation. Use hamburger menus, sticky headers, and clear call-to-action buttons.</p>
        
        <h2>Accelerated Mobile Pages (AMP)</h2>
        <p>Consider implementing AMP for faster loading times on mobile devices, especially for content-heavy pages.</p>
      `,
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop",
      date: "2023-12-15",
      readTime: "5 min read",
      category: "Mobile SEO",
      tags: ["Mobile SEO", "Responsive Design", "UX"]
    }
  ];

  // Use static post as fallback if WordPress API fails
  const staticPost = staticBlogPosts.find(p => p.slug === slug);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onContactClick={() => setIsContactOpen(true)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-medium">Loading post...</h2>
          </div>
        </div>
        <Footer onContactClick={() => setIsContactOpen(true)} />
      </div>
    );
  }
  
  if (error || (!post && !staticPost)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onContactClick={() => setIsContactOpen(true)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </div>
        </div>
        <Footer onContactClick={() => setIsContactOpen(true)} />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If WordPress API failed but we have a static fallback, use it
  const displayPost = post || staticPost;
  
  if (!displayPost) {
    return null; // This shouldn't happen due to earlier checks, but TypeScript needs it
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onContactClick={() => setIsContactOpen(true)} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Button 
                variant="ghost" 
                onClick={() => navigate('/blog')}
                className="mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>

              <div className="mb-6">
                {post ? (
                  getPostCategories(post)[0] && (
                    <span className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium mb-4">
                      {getPostCategories(post)[0].name}
                    </span>
                  )
                ) : (
                  <span className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium mb-4">
                    {staticPost?.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {post ? (
                  <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                ) : (
                  staticPost?.title
                )}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{formatDate(post ? post.date : (staticPost?.date || ''))}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{post ? calculateReadTime(post.content.rendered) : staticPost?.readTime}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {post ? (
                  getPostTags(post).map((tag) => (
                    <span 
                      key={tag.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </span>
                  ))
                ) : staticPost?.tags ? (
                  staticPost.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))
                ) : null}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="px-4 py-8">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src={post ? getFeaturedImageUrl(post, 'large') : staticPost?.image}
                alt={post ? post.title.rendered : staticPost?.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </section>

        {/* Article Content */}
        <article className="px-4 py-8">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post ? post.content.rendered : (staticPost?.content || '') }}
            />
          </div>
        </article>

        {/* CTA Section */}
        <section className="px-4 py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Need Help with Your SEO Strategy?
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Get expert guidance tailored to your business goals
              </p>
              <Button 
                onClick={() => setIsContactOpen(true)}
                variant="cta-outline"
                size="lg"
              >
                Get Free Consultation
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Related Posts */}
        {((post && relatedPosts.length > 0) || (staticPost && staticBlogPosts.length > 0)) && (
          <section className="px-4 py-16">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {post ? relatedPosts.map((relatedPost) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  >
                    <div className="overflow-hidden rounded-lg mb-4">
                      <img 
                        src={getFeaturedImageUrl(relatedPost)}
                        alt={relatedPost.title.rendered}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors"
                      dangerouslySetInnerHTML={{ __html: relatedPost.title.rendered }}
                    />
                    <div className="text-muted-foreground text-sm line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: relatedPost.excerpt.rendered }}
                    />
                  </motion.div>
                )) : staticBlogPosts
                  .filter(p => p.id !== staticPost?.id && (p.category === staticPost?.category || p.tags?.some(tag => staticPost?.tags?.includes(tag))))
                  .slice(0, 3)
                  .map((relatedPost) => (
                    <motion.div
                      key={relatedPost.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                    >
                      <div className="overflow-hidden rounded-lg mb-4">
                        <img 
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </motion.div>
                  ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer onContactClick={() => setIsContactOpen(true)} />
      <ContactModal 
        open={isContactOpen} 
        onOpenChange={setIsContactOpen} 
      />
    </div>
  );
};

export default BlogPost;
