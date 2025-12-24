import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import Badge from './ui/Badge';

interface SEOFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

interface InteractiveSEOSectionProps {
  seoFeatureImages?: {
    keywordAnalysis?: string;
    editTopicAI?: string;
    articleGeneration?: string;
  };
  tenantSlug?: string;
}

export const InteractiveSEOSection: React.FC<InteractiveSEOSectionProps> = ({
  seoFeatureImages,
  tenantSlug = 'sparti-seo-landing'
}) => {
  // Default images if not provided
  const defaultImages = {
    keywordAnalysis: `/theme/${tenantSlug}/assets/keyword-analysis.png`,
    editTopicAI: `/theme/${tenantSlug}/assets/edit-topic-ai.png`,
    articleGeneration: `/theme/${tenantSlug}/assets/article-generation.png`
  };

  const images = seoFeatureImages || defaultImages;

  const seoFeatures: SEOFeature[] = [
    {
      id: 'keywords-research',
      title: 'Keywords Research',
      description: 'Discover high-value, low-competition keywords that your competitors are ranking for. Our AI analyzes search trends to find opportunities.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      image: images.keywordAnalysis || defaultImages.keywordAnalysis,
    },
    {
      id: 'topics-research',
      title: 'Topics Research',
      description: 'Generate content ideas based on real search data and trending topics in your niche. Stay ahead with AI-powered topic discovery.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      image: images.editTopicAI || defaultImages.editTopicAI,
    },
    {
      id: 'article-generation',
      title: 'Article Generation',
      description: 'Create SEO-optimized articles automatically and schedule them to publish across your CMS platforms on autopilot.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      image: images.articleGeneration || defaultImages.articleGeneration,
    },
  ];
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-cycle through features on mobile
  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        setActiveFeature((prev) => (prev + 1) % seoFeatures.length);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  const nextFeature = () => {
    setActiveFeature((prev) => (prev + 1) % seoFeatures.length);
  };

  const prevFeature = () => {
    setActiveFeature((prev) => (prev - 1 + seoFeatures.length) % seoFeatures.length);
  };

  return (
    <section ref={containerRef} className="min-h-screen bg-gradient-to-b from-background to-card/20">
      {/* Header Section */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="secondary" className="mb-6 text-primary border-primary/20 glass bg-background/80">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Article Generation
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Get your first article in 2 minutes
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Start creating high-quality, SEO-optimized content instantly. Our AI handles the research, writing, and optimization—you just publish and watch your rankings grow.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Section */}
      <div className="py-20 px-6 bg-background/95 glass border-t border-border/50">
        <div className="max-w-7xl mx-auto w-full">
          {/* Desktop Interactive Section */}
          <div className="hidden md:grid md:grid-cols-2 gap-16 items-center">
            {/* Left Side - Feature Blocks */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-0 top-0 w-1 bg-border/30 rounded-full h-full">
                <div 
                  className="absolute left-0 top-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full origin-top transition-all duration-1000"
                  style={{ 
                    height: `${((activeFeature + 1) / seoFeatures.length) * 100}%`
                  }}
                />
              </div>

              <div className="space-y-8 ml-8">
                {seoFeatures.map((feature, index) => (
                  <div
                    key={feature.id}
                    className="relative cursor-pointer"
                    onClick={() => setActiveFeature(index)}
                  >
                    <Card className={`rounded-2xl border overflow-hidden transition-all duration-500 hover-scale ${
                      activeFeature === index 
                        ? 'bg-card/90 border-primary/30 shadow-lg shadow-primary/15' 
                        : 'bg-card/40 border-border/50 hover:border-primary/20'
                    }`}>
                      {/* Header */}
                      <div className="p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${
                          activeFeature === index 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          {feature.icon}
                        </div>
                        
                        <h3 className={`text-xl font-semibold transition-colors duration-300 ${
                          activeFeature === index ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {feature.title}
                        </h3>
                      </div>
                      
                      {/* Expandable content */}
                      <div className={`overflow-hidden transition-all duration-500 ${
                        activeFeature === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="px-6 pb-6">
                          <p className="leading-relaxed text-base text-foreground/80">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Image */}
            <div>
              <div className="relative animate-fade-in">
                <div className="transition-all duration-600">
                  <img
                    src={seoFeatures[activeFeature].image}
                    alt={seoFeatures[activeFeature].title}
                    className="w-full h-auto rounded-lg border border-border/30 shadow-lg"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/theme/${tenantSlug}/assets/placeholder.svg`;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <Card className="relative bg-card/40 border border-border/50">
              <div className="p-6">
                {/* Mobile Image */}
                <div className="mb-6">
                  <img
                    src={seoFeatures[activeFeature].image}
                    alt={seoFeatures[activeFeature].title}
                    className="w-full h-auto rounded-lg border border-border/30"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/theme/${tenantSlug}/assets/placeholder.svg`;
                    }}
                  />
                </div>

                {/* Mobile Content */}
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-xl bg-primary/20 text-primary mb-4">
                    {seoFeatures[activeFeature].icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {seoFeatures[activeFeature].title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {seoFeatures[activeFeature].description}
                  </p>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex justify-between items-center px-6 pb-6">
                <button
                  onClick={prevFeature}
                  className="p-2 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-2">
                  {seoFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeFeature === index 
                          ? 'bg-primary w-6' 
                          : 'bg-muted-foreground/30 w-2'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextFeature}
                  className="p-2 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
