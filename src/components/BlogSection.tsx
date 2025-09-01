import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
}

const BlogSection = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [scrollPosition, setScrollPosition] = useState(0);

  // Mock blog posts data
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "The Future of SEO in 2024",
      excerpt: "Discover the latest trends and strategies that will dominate search engine optimization in the coming year.",
      category: "SEO",
      tags: ["SEO", "Digital Marketing", "Trends"]
    },
    {
      id: 2,
      title: "Maximizing ROI with Paid Advertising",
      excerpt: "Learn how to optimize your paid advertising campaigns for better returns on investment.",
      category: "Paid Ads",
      tags: ["Advertising", "ROI", "Marketing"]
    },
    {
      id: 3,
      title: "Building a Strong Social Media Presence",
      excerpt: "Essential tips for creating engaging content and growing your audience on social platforms.",
      category: "Social Media",
      tags: ["Social Media", "Content", "Engagement"]
    },
    {
      id: 4,
      title: "Website Design Best Practices",
      excerpt: "Key principles for creating user-friendly and conversion-optimized websites.",
      category: "Web Design",
      tags: ["Web Design", "UX", "Conversion"]
    },
    {
      id: 5,
      title: "Content Marketing Strategies That Work",
      excerpt: "Proven content marketing techniques to attract and retain your target audience.",
      category: "Content Marketing",
      tags: ["Content", "Marketing", "Strategy"]
    },
    {
      id: 6,
      title: "Email Marketing Automation Tips",
      excerpt: "How to set up effective email automation sequences that drive engagement and sales.",
      category: "Email Marketing",
      tags: ["Email", "Automation", "Marketing"]
    }
  ];

  // Unique categories
  const categories = ["All", ...Array.from(new Set(blogPosts.map(post => post.category)))];

  // Filter posts by category
  const filteredPosts = activeCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Search Engine Marketing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay updated with the latest trends, strategies, and insights in digital marketing
          </p>
        </motion.div>

        {/* Categories Tabs */}
        <div className="relative mb-12">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <h3 className="text-lg font-semibold">Categories</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => scroll('left')}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => scroll('right')}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex space-x-2 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setActiveCategory(category)}
                variant={activeCategory === category ? "default" : "outline"}
                className={`whitespace-nowrap ${activeCategory === category ? 'bg-coral text-white hover:bg-coral/90' : ''}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-xl overflow-hidden border border-border hover:border-coral/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-block px-3 py-1 bg-coral/10 text-coral text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, tagIndex) => (
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
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;