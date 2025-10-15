import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";

const Blog = () => {
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "All",
    "SEO Strategy",
    "Local SEO",
    "Technical SEO",
    "Content Marketing",
    "Link Building",
    "Mobile SEO"
  ];

  // Static blog posts for demonstration
  const blogPosts = [
    {
      id: 1,
      slug: "10-essential-seo-strategies-2024",
      title: "10 Essential SEO Strategies for 2024",
      excerpt: "Discover the latest SEO techniques that will help your website rank higher in search results and drive more organic traffic.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "SEO Strategy"
    },
    {
      id: 2,
      slug: "optimize-website-local-seo",
      title: "How to Optimize Your Website for Local SEO",
      excerpt: "Learn the key tactics to improve your local search visibility and attract more customers from your area.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
      date: "2024-01-10",
      readTime: "7 min read",
      category: "Local SEO"
    },
    {
      id: 3,
      slug: "complete-guide-technical-seo",
      title: "The Complete Guide to Technical SEO",
      excerpt: "Master the technical aspects of SEO to ensure your website is properly optimized for search engines.",
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=500&fit=crop",
      date: "2024-01-05",
      readTime: "8 min read",
      category: "Technical SEO"
    },
    {
      id: 4,
      slug: "content-marketing-strategies",
      title: "Content Marketing Strategies That Actually Work",
      excerpt: "Explore proven content marketing strategies that drive engagement and boost your SEO performance.",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop",
      date: "2023-12-28",
      readTime: "6 min read",
      category: "Content Marketing"
    },
    {
      id: 5,
      slug: "link-building-best-practices-2024",
      title: "Link Building Best Practices for 2024",
      excerpt: "Discover effective link building techniques that comply with search engine guidelines and deliver results.",
      image: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=500&fit=crop",
      date: "2023-12-20",
      readTime: "9 min read",
      category: "Link Building"
    },
    {
      id: 6,
      slug: "mobile-first-seo-guide",
      title: "Mobile-First SEO: Why It Matters More Than Ever",
      excerpt: "Learn why mobile optimization is crucial for SEO success and how to implement mobile-first strategies.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop",
      date: "2023-12-15",
      readTime: "5 min read",
      category: "Mobile SEO"
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onContactClick={() => setIsContactOpen(true)} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                SEO Insights & <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Expert Tips</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-8">
                Stay ahead of the curve with our latest SEO strategies, industry insights, and actionable tips to grow your online presence.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full border-2"
                />
              </div>

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="max-w-4xl mx-auto">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-2 h-auto bg-transparent">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category}
                      value={category === "All" ? "all" : category}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No articles found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <div className="relative overflow-hidden">
                        <img 
                          src={post.image}
                          alt={post.title}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </div>
                      </div>
                      
                      <CardHeader>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(post.date)}</span>
                          <Clock className="w-4 h-4 ml-4 mr-2" />
                          <span>{post.readTime}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {post.title}
                        </h3>
                      </CardHeader>

                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            GOSG Consulting
                          </span>
                          
                          <span className="inline-flex items-center text-primary group-hover:text-secondary font-medium text-sm transition-colors duration-300">
                            Read More
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
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

export default Blog;
