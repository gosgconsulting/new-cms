import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Tag, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";

// Import placeholder images for fallback
const placeholderImage = "/placeholder.svg";

// Define BlogPost type
interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  tags?: string[];
}

// Static blog posts for demonstration (fallback data)
const staticBlogPosts: BlogPost[] = [
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
    tags: ["Technical SEO", "Site Speed", "Mobile"]
  },
  {
    id: 4,
    slug: "content-marketing-strategies",
    title: "Content Marketing Strategies That Actually Work",
    excerpt: "Explore proven content marketing strategies that drive engagement and boost your SEO performance.",
    content: `
      <h2>The Power of Strategic Content</h2>
      <p>Content marketing remains one of the most effective ways to attract, engage, and convert your target audience. But not all content strategies are created equal.</p>
      
      <h2>Know Your Audience</h2>
      <p>Develop detailed buyer personas and create content that addresses their specific pain points, questions, and interests at each stage of the buyer's journey.</p>
      
      <h2>Focus on Quality Over Quantity</h2>
      <p>One comprehensive, well-researched piece of content will outperform multiple mediocre articles. Invest in depth, accuracy, and presentation.</p>
      
      <h2>Embrace Different Content Formats</h2>
      <p>Diversify your content strategy with blog posts, videos, podcasts, infographics, and interactive tools to reach different segments of your audience.</p>
      
      <h2>Measure and Optimize</h2>
      <p>Use analytics to track performance metrics and continuously refine your content strategy based on what resonates with your audience.</p>
    `,
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop",
    date: "2023-12-28",
    readTime: "6 min read",
    category: "Content Marketing",
    tags: ["Content Marketing", "Engagement", "Strategy"]
  },
  {
    id: 5,
    slug: "link-building-best-practices-2024",
    title: "Link Building Best Practices for 2024",
    excerpt: "Discover effective link building techniques that comply with search engine guidelines and deliver results.",
    content: `
      <h2>The Evolving Landscape of Link Building</h2>
      <p>Link building remains a crucial aspect of SEO, but the tactics that worked years ago may now result in penalties. Modern link building focuses on quality, relevance, and natural acquisition.</p>
      
      <h2>Create Link-Worthy Content</h2>
      <p>The best link building strategy starts with creating valuable content that people naturally want to reference and share.</p>
      
      <h2>Build Relationships, Not Just Links</h2>
      <p>Focus on developing genuine relationships with industry influencers, bloggers, and complementary businesses that can lead to natural link opportunities.</p>
      
      <h2>Guest Blogging Done Right</h2>
      <p>Guest blogging is still effective when done with a focus on providing value to the host site's audience rather than just acquiring links.</p>
      
      <h2>Monitor Your Backlink Profile</h2>
      <p>Regularly audit your backlink profile and disavow toxic links that could harm your search rankings.</p>
    `,
    image: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=1200&h=600&fit=crop",
    date: "2023-12-20",
    readTime: "9 min read",
    category: "Link Building",
    tags: ["Link Building", "Backlinks", "SEO"]
  },
  {
    id: 6,
    slug: "mobile-first-seo-guide",
    title: "Mobile-First SEO: Why It Matters More Than Ever",
    excerpt: "Learn why mobile optimization is crucial for SEO success and how to implement mobile-first strategies.",
    content: `
      <h2>The Mobile-First Reality</h2>
      <p>With most web traffic now coming from mobile devices, Google has shifted to mobile-first indexing, meaning it primarily uses the mobile version of your website for ranking and indexing.</p>
      
      <h2>Responsive Design Is Just the Beginning</h2>
      <p>While having a responsive website is essential, true mobile optimization goes beyond just fitting content to different screen sizes.</p>
      
      <h2>Optimize Page Speed for Mobile</h2>
      <p>Mobile users expect fast-loading pages. Compress images, leverage browser caching, and minimize code to improve mobile load times.</p>
      
      <h2>Simplify Navigation for Touch Interfaces</h2>
      <p>Design navigation elements that are easy to use with fingers of all sizes, with adequate spacing between clickable elements.</p>
      
      <h2>Optimize for Local Searches</h2>
      <p>Mobile searches often have local intent. Ensure your mobile SEO strategy includes local optimization elements like Google Business Profile and local keywords.</p>
    `,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop",
    date: "2023-12-15",
    readTime: "5 min read",
    category: "Mobile SEO",
    tags: ["Mobile SEO", "Responsive Design", "Page Speed"]
  }
];

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbConnectionFailed, setDbConnectionFailed] = useState(false);

  // Fetch post data from API
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError("No post slug provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch post data from API
        const response = await fetch(`/api/blog/posts/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError(`Post with slug "${slug}" not found`);
          } else {
            setError('Failed to fetch post data');
            setDbConnectionFailed(true);
          }
          
          // Try to fall back to static data
          const fallbackPost = staticBlogPosts.find(p => p.slug === slug);
          if (fallbackPost) {
            setPost(fallbackPost);
            setDbConnectionFailed(true);
            setError(null); // Clear error since we found a fallback
          }
          
          setIsLoading(false);
          return;
        }
        
        const postData = await response.json();
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post:', err);
        setDbConnectionFailed(true);
        
        // Try to fall back to static data
        const fallbackPost = staticBlogPosts.find(p => p.slug === slug);
        if (fallbackPost) {
          setPost(fallbackPost);
          setError(null); // Clear error since we found a fallback
        } else {
          setError('An error occurred while fetching the post');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onContactClick={() => setIsContactOpen(true)} />
        
        <main className="flex-1">
          <div />
        </main>
        
        <Footer onContactClick={() => setIsContactOpen(true)} />
        <ContactModal 
          open={isContactOpen} 
          onOpenChange={setIsContactOpen} 
        />
      </div>
    );
  }

  // Show 404 if post not found
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onContactClick={() => setIsContactOpen(true)} />
        
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been moved.</p>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </main>
        
        <Footer onContactClick={() => setIsContactOpen(true)} />
        <ContactModal 
          open={isContactOpen} 
          onOpenChange={setIsContactOpen} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onContactClick={() => setIsContactOpen(true)} />
      
      <main className="flex-1">
        {/* Database Connection Alert */}
        {dbConnectionFailed && (
          <div className="container mx-auto px-4 mt-8 pt-20">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-800">Database Connection Notice</AlertTitle>
              <AlertDescription className="text-amber-700">
                Currently displaying demo content. Database connection could not be established.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Hero Section */}
        <section className="pt-32 md:pt-24 pb-12 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto">
            <div className="flex items-center mb-8">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/blog')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {post.category}
                </span>
                {post.tags && post.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {post.title}
              </h1>
              
              <div className="flex items-center text-sm text-muted-foreground mb-8">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(post.date)}</span>
                <Clock className="w-4 h-4 ml-6 mr-2" />
                <span>{post.readTime}</span>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Featured Image */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="relative rounded-xl overflow-hidden mb-12">
              <img 
                src={imageError ? placeholderImage : post.image}
                alt={post.title}
                className="w-full h-auto max-h-[500px] object-cover"
                onError={handleImageError}
              />
            </div>
          </div>
        </section>
        
        {/* Content */}
        <section className="py-8 px-4 mb-20">
          <div className="container mx-auto">
            <div className="prose prose-lg max-w-none mx-auto" dangerouslySetInnerHTML={{ __html: post.content }} />
            
            {/* Share Section */}
            <div className="mt-12 pt-6 border-t border-border max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Share this article:</div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
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
