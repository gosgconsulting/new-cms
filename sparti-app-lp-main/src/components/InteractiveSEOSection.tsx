import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Eye, Zap, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import keywordAnalysis from '@/assets/keyword-analysis.png';
import editTopicAi from '@/assets/edit-topic-ai.png';
import articleGeneration from '@/assets/article-generation.png';

const seoFeatures = [
  {
    id: 'keywords-research',
    title: 'Keywords Research',
    description: 'Discover high-value, low-competition keywords that your competitors are ranking for. Our AI analyzes search trends to find opportunities.',
    icon: Search,
    image: keywordAnalysis,
  },
  {
    id: 'topics-research',
    title: 'Topics Research',
    description: 'Generate content ideas based on real search data and trending topics in your niche. Stay ahead with AI-powered topic discovery.',
    icon: Zap,
    image: editTopicAi,
  },
  {
    id: 'article-generation',
    title: 'Article Generation',
    description: 'Create SEO-optimized articles automatically and schedule them to publish across your CMS platforms on autopilot.',
    icon: Eye,
    image: articleGeneration,
  },
];

export const InteractiveSEOSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll-based animation for the sticky section - only on desktop
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 60%", "end start"]
  });

  // Map scroll progress to feature activation - only for desktop (faster transitions)
  const activeIndex = useTransform(scrollYProgress, 
    isMobile ? [0, 1] : [0, 0.3, 0.6, 1], 
    isMobile ? [0, 0] : [0, 1, 2, 2]
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsubscribe = activeIndex.on('change', (latest) => {
      if (!isMobile) {
        setActiveFeature(Math.round(latest));
      }
    });
    
    return unsubscribe;
  }, [activeIndex, isMobile]);

  const nextFeature = () => {
    setActiveFeature((prev) => (prev + 1) % seoFeatures.length);
  };

  const prevFeature = () => {
    setActiveFeature((prev) => (prev - 1 + seoFeatures.length) % seoFeatures.length);
  };

  return (
    <section ref={containerRef} className="min-h-[200vh] bg-gradient-to-b from-background to-card/20">
      {/* Non-sticky Header Section */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-6 text-primary border-primary/20 backdrop-blur-sm bg-background/80">
              <Zap className="w-4 h-4 mr-2" />
              Quick Article Generation
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Get your first article in 2 minutes
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Start creating high-quality, SEO-optimized content instantly. Our AI handles the research, writing, and optimization—you just publish and watch your rankings grow.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Sticky Interactive Section */}
      <div className="sticky top-0 h-screen flex items-center py-20 px-6 bg-background/95 backdrop-blur-sm border-t border-border/50">
        <div className="max-w-7xl mx-auto w-full">
          {/* Desktop Interactive Section */}
          <div className="hidden md:grid md:grid-cols-2 gap-16 items-center">
            {/* Left Side - Feature Blocks with Progress Line */}
            <div className="relative">
              {/* Continuous Progress Line Background */}
              <div className="absolute left-0 top-0 w-1 bg-border/30 rounded-full h-full">
                <motion.div
                  className="absolute left-0 top-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full origin-top h-full"
                  style={{ 
                    scaleY: isMobile ? 0 : useTransform(scrollYProgress, [0, 0.7, 1], [0, 1, 1])
                  }}
                />
              </div>

              <div className="space-y-8 ml-8">
                {seoFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <motion.div 
                      className="rounded-2xl border overflow-hidden"
                      animate={{
                        backgroundColor: activeFeature === index ? 'hsl(var(--card) / 0.9)' : 'hsl(var(--card) / 0.4)',
                        borderColor: activeFeature === index ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--border) / 0.5)',
                        boxShadow: activeFeature === index ? '0 10px 40px hsl(var(--primary) / 0.15)' : '0 1px 3px hsl(var(--foreground) / 0.1)'
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      {/* Always visible header */}
                      <div className="p-6 flex items-center gap-4">
                        <motion.div 
                          className="p-3 rounded-xl flex-shrink-0"
                          animate={{
                            backgroundColor: activeFeature === index ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--muted) / 0.5)',
                            color: activeFeature === index ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <feature.icon className="w-6 h-6" />
                        </motion.div>
                        
                        <motion.h3 
                          className="text-xl font-semibold"
                          animate={{
                            color: activeFeature === index ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {feature.title}
                        </motion.h3>
                      </div>
                      
                      {/* Expandable content */}
                      <motion.div
                        initial={false}
                        animate={{ 
                          height: activeFeature === index ? 'auto' : 0,
                          opacity: activeFeature === index ? 1 : 0
                        }}
                        transition={{ 
                          duration: 0.5, 
                          ease: "easeInOut",
                          opacity: { duration: 0.3, delay: activeFeature === index ? 0.2 : 0 }
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <motion.p 
                            className="leading-relaxed text-base"
                            animate={{
                              color: 'hsl(var(--foreground) / 0.8)'
                            }}
                          >
                            {feature.description}
                          </motion.p>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side - Sticky Image */}
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeFeature}
                    src={seoFeatures[activeFeature].image}
                    alt={seoFeatures[activeFeature].title}
                    className="w-full h-auto"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

      {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="relative bg-card/40 border border-border/50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="p-6"
                >
                  {/* Mobile Image */}
                  <div className="mb-6">
                    <img
                      src={seoFeatures[activeFeature].image}
                      alt={seoFeatures[activeFeature].title}
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Mobile Content */}
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-xl bg-primary/20 text-primary mb-4">
                      {React.createElement(seoFeatures[activeFeature].icon, { className: "w-6 h-6" })}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {seoFeatures[activeFeature].title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {seoFeatures[activeFeature].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Mobile Navigation */}
              <div className="flex justify-between items-center px-6 pb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevFeature}
                  className="border-border/50 hover:border-primary/30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex gap-2">
                  {seoFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeFeature === index 
                          ? 'bg-primary w-6' 
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextFeature}
                  className="border-border/50 hover:border-primary/30"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};