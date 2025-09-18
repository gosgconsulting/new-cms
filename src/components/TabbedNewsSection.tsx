import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useWordPressPosts, useWordPressCategories, useWordPressTags } from '@/hooks/use-wordpress';

const categories = [
  { value: 'sem', label: 'SEM', slug: 'sem', fullName: 'Search Engine Marketing' },
  { value: 'sma', label: 'SMA', slug: 'sma', fullName: 'Social Media Advertising' },
  { value: 'seo', label: 'SEO', slug: 'seo', fullName: 'Search Engine Optimization' },
  { value: 'technology', label: 'Tech', slug: 'technology', fullName: 'Technology & Web Development' }
];

const TabbedNewsSection = () => {
  const [activeTab, setActiveTab] = useState('sem');
  const { data: posts } = useWordPressPosts();
  const { data: wpCategories } = useWordPressCategories();
  const { data: tags } = useWordPressTags();
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scroll = (direction: 'left' | 'right', category: string) => {
    const scrollElement = scrollRefs.current[category];
    if (scrollElement) {
      const { scrollLeft, clientWidth } = scrollElement;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      scrollElement.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const getPostsByCategory = (categorySlug: string) => {
    if (!posts || !wpCategories) return [];
    
    const categoryId = wpCategories.find(cat => cat.slug === categorySlug)?.id;
    if (!categoryId) return [];
    
    return posts.filter(post => post.categories.includes(categoryId)).slice(0, 6);
  };

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-primary/5" />
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 mb-4 bg-primary/20 text-primary text-sm font-medium rounded-full">
            LATEST NEWS & INSIGHTS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-headline">
            Stay Updated with Digital Marketing Trends
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            Expert insights, industry news, and actionable tips to help your business succeed online.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 md:grid-cols-4 mb-12 h-auto p-1 bg-muted/50 backdrop-blur-sm">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex flex-col items-center py-4 px-6 data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 rounded-lg"
                >
                  <span className="text-sm font-bold">{category.label}</span>
                  <span className="text-xs text-muted-foreground mt-1 hidden sm:block">{category.fullName}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {categories.map((category) => {
            const categoryPosts = getPostsByCategory(category.slug);
            
            return (
              <TabsContent key={category.value} value={category.value} className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-foreground">
                      Latest {category.fullName} News
                    </h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => scroll('left', category.value)}
                        className="rounded-full"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => scroll('right', category.value)}
                        className="rounded-full"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Posts carousel */}
                  <div 
                    ref={(el) => { scrollRefs.current[category.value] = el; }}
                    className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {categoryPosts.length > 0 ? (
                      categoryPosts.map((post, index) => {
                        const postTags = post.tags.map(tagId => 
                          tags?.find(tag => tag.id === tagId)?.name
                        ).filter(Boolean);
                        
                        const tagLabel = postTags.length > 0 ? postTags[0] : "Blog";
                        const postDate = new Date(post.date);
                        const formattedDate = `${postDate.getDate().toString().padStart(2, '0')}/${(postDate.getMonth() + 1).toString().padStart(2, '0')}/${postDate.getFullYear()}`;

                        return (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex-shrink-0 w-80"
                          >
                            <Link to={`/blog/${post.slug}`}>
                              <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer h-full">
                                {/* Article image placeholder */}
                                <div className="h-48 bg-gradient-to-br from-primary/20 to-coral/20 flex items-center justify-center">
                                  <div className="text-6xl font-bold text-primary/30">
                                    {category.label}
                                  </div>
                                </div>
                                
                                <div className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                      {tagLabel}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formattedDate}
                                    </span>
                                  </div>
                                  
                                  <h4 
                                    className="text-lg font-semibold mb-3 line-clamp-2 hover:text-primary transition-colors duration-300"
                                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                  />
                                  
                                  <div 
                                    className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                  />
                                  
                                  <div className="flex items-center text-primary hover:text-coral transition-colors duration-300">
                                    <span className="text-sm font-medium">Read More</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="flex-shrink-0 w-80 bg-card rounded-xl p-8 border border-border">
                        <p className="text-muted-foreground text-center">
                          No articles available for {category.fullName}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* View All Articles CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link to="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default TabbedNewsSection;