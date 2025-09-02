import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogCategory {
  id: number;
  name: string;
  description: string;
  subcategories: string[];
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
}

const BlogSection = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Blog categories with subcategories
  const blogCategories: BlogCategory[] = [
    {
      id: 1,
      name: "Social Media Advertising",
      description: "Master the art of social media marketing across all platforms",
      subcategories: ["Facebook Ads", "Instagram Advertising", "LinkedIn Marketing", "TikTok Advertising"]
    },
    {
      id: 2,
      name: "Search Engine Optimisation",
      description: "Boost your website's visibility and organic traffic",
      subcategories: ["On-Page SEO", "Technical SEO", "Link Building", "Local SEO"]
    },
    {
      id: 3,
      name: "Technology",
      description: "Stay ahead with the latest marketing technology trends",
      subcategories: ["Marketing Automation", "Analytics & Tracking", "AI & Machine Learning", "Web Development"]
    }
  ];
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
            Digital Marketing Insights
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay updated with the latest trends, strategies, and insights in digital marketing
          </p>
        </motion.div>

        {/* Blog Categories */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold">Categories</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {blogCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border hover:border-coral/50 transition-all duration-300 hover:shadow-lg"
              >
                <h4 className="text-xl font-semibold mb-3 text-coral">{category.name}</h4>
                <p className="text-muted-foreground mb-4 text-sm">{category.description}</p>
                <div className="space-y-2">
                  {category.subcategories.map((subcategory, subIndex) => (
                    <div 
                      key={subIndex}
                      className="flex items-center space-x-2 text-sm hover:text-coral transition-colors cursor-pointer"
                    >
                      <span className="w-2 h-2 bg-coral/60 rounded-full"></span>
                      <span>{subcategory}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div 
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {blogPosts.slice(0, 3).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 bg-card rounded-xl overflow-hidden border border-border hover:border-coral/50 transition-all duration-300 hover:shadow-lg"
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
                    {post.tags.slice(0, 2).map((tag, tagIndex) => (
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
          </div>
        </div>

        {/* View More Button */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Button asChild variant="coral" size="lg">
            <Link to="/blog">
              View More Articles
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;