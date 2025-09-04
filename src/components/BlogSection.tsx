import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useWordPressPosts, useWordPressCategories, useWordPressTags } from "@/hooks/use-wordpress";

interface BlogPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  categories: number[];
  tags: number[];
  date: string;
  slug: string;
}

interface BlogSectionProps {
  title: string;
  description: string;
  categorySlug: string;
  bgColor: string;
}

const CategorySection: React.FC<BlogSectionProps> = ({ title, description, categorySlug, bgColor }) => {
  const { data: posts } = useWordPressPosts();
  const { data: categories } = useWordPressCategories();
  const { data: tags } = useWordPressTags();
  const [activeTag, setActiveTag] = useState<string>('');
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

  // Find the category ID by slug
  const categoryId = categories?.find(cat => cat.slug === categorySlug)?.id;
  
  // Filter posts by category
  const categoryPosts = posts?.filter(post => 
    post.categories.includes(categoryId || 0)
  ) || [];

  // Get unique tags from posts in this category
  const categoryTags = Array.from(new Set(
    categoryPosts.flatMap(post => 
      post.tags.map(tagId => tags?.find(tag => tag.id === tagId)?.name).filter(Boolean)
    )
  )).filter(Boolean) as string[];

  // Set initial active tag
  useEffect(() => {
    if (categoryTags.length > 0 && !activeTag) {
      setActiveTag(categoryTags[0]);
    }
  }, [categoryTags, activeTag]);

  // Filter posts by active tag
  const filteredPosts = activeTag 
    ? categoryPosts.filter(post => {
        const postTagNames = post.tags.map(tagId => 
          tags?.find(tag => tag.id === tagId)?.name
        );
        return postTagNames.includes(activeTag);
      })
    : categoryPosts;

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

        {/* Tag Tabs */}
        {categoryTags.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 p-1 bg-muted rounded-lg flex-wrap">
              {categoryTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTag === tag
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

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
            {filteredPosts.length > 0 ? (
              filteredPosts.slice(0, 3).map((post, index) => {
                const postTags = post.tags.map(tagId => 
                  tags?.find(tag => tag.id === tagId)?.name
                ).filter(Boolean);
                
                // Use the first tag as the label, or fallback to "Blog" if no tags
                const tagLabel = postTags.length > 0 ? postTags[0] : "Blog";
                
                // Format date in European style (DD/MM/YYYY)
                const postDate = new Date(post.date);
                const formattedDate = `${postDate.getDate().toString().padStart(2, '0')}/${(postDate.getMonth() + 1).toString().padStart(2, '0')}/${postDate.getFullYear()}`;

                return (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex-shrink-0 w-80 bg-card rounded-xl overflow-hidden border border-border hover:border-coral/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
                    >
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="inline-block px-3 py-1 bg-coral/10 text-coral text-xs font-medium rounded-full">
                            {categoryName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {postDate}
                          </span>
                        </div>
                        <h3 
                          className="text-xl font-semibold mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                        <div 
                          className="text-muted-foreground mb-4 line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {postTags.slice(0, 2).map((tag, tagIndex) => (
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
                  </Link>
                );
              })
            ) : (
              <div className="flex-shrink-0 w-80 bg-card rounded-xl p-6 border border-border">
                <p className="text-muted-foreground text-center">No posts available for this category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const BlogSection = () => {
  return (
    <>
      <CategorySection
        title="Search Engine Marketing"
        description="Master paid search advertising and drive targeted traffic to your website"
        categorySlug="sem"
        bgColor="bg-background"
      />
      <CategorySection
        title="Social Media Advertising"
        description="Reach and engage your audience across all major social media platforms"
        categorySlug="sma"
        bgColor="bg-muted/30"
      />
      <CategorySection
        title="Search Engine Optimisation"
        description="Improve your organic visibility and rank higher in search results"
        categorySlug="seo"
        bgColor="bg-background"
      />
      <CategorySection
        title="Technology"
        description="Stay ahead with the latest marketing technology and tools"
        categorySlug="technology"
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