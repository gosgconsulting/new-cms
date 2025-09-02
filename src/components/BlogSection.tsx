import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  description: string;
  postCount: number;
}

interface BlogSectionProps {
  title: string;
  description: string;
  categories: Category[];
  bgColor: string;
}

const CategorySection: React.FC<BlogSectionProps> = ({ title, description, categories, bgColor }) => {
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

        {/* Categories Carousel */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Categories</h3>
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
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 bg-card rounded-xl overflow-hidden border border-border hover:border-coral/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{category.name}</h3>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-coral font-medium">
                      {category.postCount} articles
                    </span>
                    <Button variant="ghost" size="sm" className="text-coral hover:text-coral/80">
                      View Category →
                    </Button>
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
  // Category data for each main section
  const semCategories: Category[] = [
    { id: 1, name: "Google Ads", description: "Master Google advertising campaigns and PPC strategies", postCount: 24 },
    { id: 2, name: "Bing Ads", description: "Maximize your reach with Microsoft advertising platform", postCount: 12 },
    { id: 3, name: "Display Advertising", description: "Create compelling visual ads that convert", postCount: 18 },
    { id: 4, name: "Shopping Campaigns", description: "Optimize product listings and e-commerce ads", postCount: 15 }
  ];

  const smaCategories: Category[] = [
    { id: 5, name: "Facebook Advertising", description: "Build effective campaigns on Facebook and Instagram", postCount: 32 },
    { id: 6, name: "LinkedIn Marketing", description: "B2B advertising strategies for professional networks", postCount: 19 },
    { id: 7, name: "TikTok Advertising", description: "Reach younger audiences with creative video content", postCount: 14 },
    { id: 8, name: "Twitter Ads", description: "Leverage real-time conversations for brand awareness", postCount: 11 }
  ];

  const seoCategories: Category[] = [
    { id: 9, name: "Technical SEO", description: "Optimize website structure and performance for search engines", postCount: 28 },
    { id: 10, name: "Content Optimization", description: "Create search-friendly content that ranks and converts", postCount: 35 },
    { id: 11, name: "Local SEO", description: "Improve visibility in local search results", postCount: 22 },
    { id: 12, name: "Link Building", description: "Build authority through strategic link acquisition", postCount: 17 }
  ];

  const techCategories: Category[] = [
    { id: 13, name: "Marketing Automation", description: "Streamline campaigns with advanced automation tools", postCount: 21 },
    { id: 14, name: "Analytics & Tracking", description: "Master data collection and performance measurement", postCount: 26 },
    { id: 15, name: "AI in Marketing", description: "Leverage artificial intelligence for better results", postCount: 16 },
    { id: 16, name: "Web Development", description: "Build high-converting websites and landing pages", postCount: 19 }
  ];

  return (
    <>
      <CategorySection
        title="Search Engine Marketing"
        description="Master paid search advertising and drive targeted traffic to your website"
        categories={semCategories}
        bgColor="bg-background"
      />
      <CategorySection
        title="Social Media Advertising"
        description="Reach and engage your audience across all major social media platforms"
        categories={smaCategories}
        bgColor="bg-muted/30"
      />
      <CategorySection
        title="Search Engine Optimisation"
        description="Improve your organic visibility and rank higher in search results"
        categories={seoCategories}
        bgColor="bg-background"
      />
      <CategorySection
        title="Technology"
        description="Stay ahead with the latest marketing technology and tools"
        categories={techCategories}
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