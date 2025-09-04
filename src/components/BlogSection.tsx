import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
}

interface BlogSectionProps {
  title: string;
  description: string;
  posts: BlogPost[];
  categories: string[];
  bgColor: string;
}

const CategorySection: React.FC<BlogSectionProps> = ({ title, description, posts, categories, bgColor }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
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

  const filteredPosts = posts.filter(post => post.category === activeCategory);

  return (
    <section className={`py-20 px-4 ${bgColor}`}>
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 p-1 bg-muted rounded-lg">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Carousel */}
        <div className="relative">
          <div className="flex items-center justify-end mb-6">
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
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredPosts.slice(0, 3).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 bg-card rounded-xl overflow-hidden border border-border hover:border-coral/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-block px-3 py-1 bg-coral/10 text-coral text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.date}
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
      </div>
    </section>
  );
};

const BlogSection = () => {
  // Blog posts data - Connect to your WordPress API or CMS
  const semPosts: BlogPost[] = [];
  const smaPosts: BlogPost[] = [];
  const seoPosts: BlogPost[] = [];
  const techPosts: BlogPost[] = [];

  return (
    <>
      <CategorySection
        title="Search Engine Marketing"
        description="Master paid search advertising and drive targeted traffic to your website"
        posts={semPosts}
        categories={["Google Ads", "Bing Ads", "Display Advertising", "Shopping Campaigns"]}
        bgColor="bg-background"
      />
      <CategorySection
        title="Social Media Advertising"
        description="Reach and engage your audience across all major social media platforms"
        posts={smaPosts}
        categories={["Facebook Advertising", "LinkedIn Marketing", "TikTok Advertising", "Twitter Ads"]}
        bgColor="bg-muted/30"
      />
      <CategorySection
        title="Search Engine Optimisation"
        description="Improve your organic visibility and rank higher in search results"
        posts={seoPosts}
        categories={["Technical SEO", "Content Optimization", "Local SEO", "Link Building"]}
        bgColor="bg-background"
      />
      <CategorySection
        title="Technology"
        description="Stay ahead with the latest marketing technology and tools"
        posts={techPosts}
        categories={["Marketing Automation", "Analytics & Tracking", "AI in Marketing", "Web Development"]}
        bgColor="bg-muted/30"
      />
      
      {/* View More Button */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Button asChild variant="coral" size="lg">
              <Link to="/blog">
                View All Articles
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BlogSection;