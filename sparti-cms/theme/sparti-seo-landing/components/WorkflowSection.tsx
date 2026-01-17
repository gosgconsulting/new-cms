import React from 'react';
import { Card } from './ui/Card';
import Button from './ui/Button';
import ImageCarousel from './ui/ImageCarousel';

interface ImageItem {
  src: string;
  alt: string;
}

interface WorkflowSectionProps {
  keywordImages?: ImageItem[];
  topicsImages?: ImageItem[];
  imageGenerationImages?: ImageItem[];
  tenantSlug?: string;
  onGetStarted?: () => void;
}

const WorkflowSection: React.FC<WorkflowSectionProps> = ({ 
  keywordImages = [],
  topicsImages = [],
  imageGenerationImages = [],
  tenantSlug = 'sparti-seo-landing',
  onGetStarted 
}) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = 'https://app.sparti.ai/seo-copilot-trial';
    }
  };

  // Fallback images if not provided
  const defaultKeywordImages = keywordImages.length > 0 ? keywordImages : [
    { src: `/theme/${tenantSlug}/assets/keywords-explorer.png`, alt: 'Keywords Explorer Interface' },
    { src: `/theme/${tenantSlug}/assets/keyword-table.png`, alt: 'Keywords Table with Search Volume' }
  ];

  const defaultTopicsImages = topicsImages.length > 0 ? topicsImages : [
    { src: `/theme/${tenantSlug}/assets/topics-research.png`, alt: 'Topics Research Management' },
    { src: `/theme/${tenantSlug}/assets/source-information.png`, alt: 'Source Information from Google Results' }
  ];

  const defaultImageGenerationImages = imageGenerationImages.length > 0 ? imageGenerationImages : [
    { src: `/theme/${tenantSlug}/assets/featured-image-placeholder.png`, alt: 'Featured Image Management Modal' },
    { src: `/theme/${tenantSlug}/assets/article-preview-placeholder.png`, alt: 'Article Preview with Generated Image' }
  ];

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "AI Content Generation",
      description: "Automatically generate SEO-optimized articles, blog posts, and web content that ranks higher in search results.",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Smart Keyword Research",
      description: "AI-powered keyword discovery finds high-value, low-competition keywords for your niche automatically.",
      gradient: "from-accent/20 to-accent/5"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: "Automated Publishing",
      description: "Schedule and publish your SEO content across multiple platforms with one-click automation.",
      gradient: "from-warning/20 to-warning/5"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Performance Tracking",
      description: "Monitor your content's SEO performance with real-time analytics and ranking improvements.",
      gradient: "from-success/20 to-success/5"
    }
  ];

  const benefits = [
    "AI-powered SEO content generation in minutes",
    "Automated keyword research and topic discovery", 
    "One-click publishing to multiple platforms",
    "Real-time SEO performance tracking",
    "Content optimization for search rankings",
    "24/7 automated SEO posting schedule"
  ];

  return (
    <>
      {/* SEO Workflow Section - "SEO is more important than ever" */}
      <section className="relative py-24 px-6 overflow-hidden bg-linear-to-b from-background via-card/30 to-background">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-linear-to-r from-primary/5 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-linear-to-l from-accent/5 to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent">
                SEO is more important
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                than ever
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              If you're not ranking, you're invisible.
            </p>
          </div>

          {/* Process Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Blog Management */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <Card className="relative p-8 text-center glass bg-card/80 border-border/50 rounded-3xl hover:border-primary/30 transition-all duration-500 hover-scale hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center glass border border-primary/20">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7V4a1 1 0 011-1h4l2 2h4a1 1 0 011 1v1M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Blog Management</h3>
                <p className="text-muted-foreground mb-4">Automate</p>
                <div className="w-12 h-1 bg-linear-to-r from-primary to-accent rounded-full mx-auto" />
              </Card>
            </div>

            {/* Daily SEO Articles */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <Card className="relative p-8 text-center glass bg-card/80 border-border/50 rounded-3xl hover:border-accent/30 transition-all duration-500 hover-scale hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 bg-linear-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center glass border border-accent/20">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Daily SEO Articles</h3>
                <p className="text-muted-foreground mb-4">Publish</p>
                <div className="w-12 h-1 bg-linear-to-r from-accent to-warning rounded-full mx-auto" />
              </Card>
            </div>

            {/* Schedule Feature */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-r from-warning/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <Card className="relative p-8 text-center glass bg-card/80 border-border/50 rounded-3xl hover:border-warning/30 transition-all duration-500 hover-scale hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-warning/20 to-warning/10 rounded-2xl flex items-center justify-center glass border border-warning/20">
                  <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Auto Schedule</h3>
                <p className="text-muted-foreground mb-4">Grow</p>
                <div className="w-12 h-1 bg-linear-to-r from-warning to-success rounded-full mx-auto" />
              </Card>
            </div>
          </div>

          {/* Flow Arrow */}
          <div className="flex justify-center mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center glass border border-primary/30 animate-bounce-in">
              <svg className="w-6 h-6 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Results Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Google Results */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <Card className="relative p-8 glass bg-card/80 border-border/50 rounded-3xl hover:border-success/30 transition-all duration-500 hover-scale">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Highlighted in Google, Bing, and more</h3>
                    <p className="text-sm text-muted-foreground">Rank higher in search results</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-background/80 to-card/50 rounded-2xl p-6 glass border border-border/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 rounded-full bg-success" />
                    <div className="w-4 h-4 rounded-full bg-warning" />
                    <div className="w-4 h-4 rounded-full bg-destructive" />
                    <span className="ml-2 text-sm text-muted-foreground">Search Results</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-primary/20 to-transparent rounded" />
                    <div className="h-3 bg-gradient-to-r from-muted/40 to-transparent rounded w-3/4" />
                    <div className="h-3 bg-gradient-to-r from-muted/30 to-transparent rounded w-1/2" />
                  </div>
                </div>
              </Card>
            </div>

            {/* ChatGPT Results */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <Card className="relative p-8 glass bg-card/80 border-border/50 rounded-3xl hover:border-primary/30 transition-all duration-500 hover-scale">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Mentioned in ChatGPT, Perplexity, and more</h3>
                    <p className="text-sm text-muted-foreground">AI-powered brand mentions</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-background/80 to-card/50 rounded-2xl p-6 glass border border-border/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">AI Assistant</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-primary/20 to-transparent rounded" />
                    <div className="h-3 bg-gradient-to-r from-accent/30 to-transparent rounded w-5/6" />
                    <div className="h-3 bg-gradient-to-r from-muted/20 to-transparent rounded w-2/3" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections - Alternating Layout */}
      
      {/* Section 1: Track User Intent - Text Left, Image Right */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Rank on keywords with search volume
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Discover high-volume keywords with precise search data and user intent analysis. Find the perfect keywords to target for maximum organic traffic growth.
              </p>
              <div className="flex items-center gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={handleGetStarted}>
                  Learn More
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </div>
            </div>
            
            {/* Keywords Interface with Carousel */}
            <div className="relative">
              <Card className="p-6 bg-gradient-to-br from-card/80 to-background/50 glass border-border/50">
                <ImageCarousel 
                  images={defaultKeywordImages}
                  interval={4000}
                  tenantSlug={tenantSlug}
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Search Volume Analytics - Text Right, Image Left */}
      <section className="py-20 px-6 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Topics Research Carousel */}
            <div className="relative order-2 lg:order-1">
              <Card className="p-6 bg-gradient-to-br from-card/80 to-background/50 glass border-border/50">
                <ImageCarousel 
                  images={defaultTopicsImages}
                  interval={3500}
                  tenantSlug={tenantSlug}
                />
              </Card>
            </div>
            
            {/* Text Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold">
                Find topics based on{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  real google search results
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Discover content opportunities by analyzing actual Google search results and user behavior. Get real insights from search data to create content that ranks and converts.
              </p>
              <div className="flex items-center gap-4">
                <Button size="lg" variant="outline" onClick={handleGetStarted}>
                  Start Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Image Generation - Text Left, Image Right */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Generate Images for your{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  blog articles and preview
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Create stunning featured images and visuals for your content automatically. Generate professional images that match your article topics and preview them before publishing.
              </p>
              <div className="space-y-3">
                {[
                  "AI-powered image generation",
                  "Article-specific visuals",
                  "Real-time preview functionality",
                  "Professional featured images"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Button size="lg" onClick={handleGetStarted}>
                  Start Free
                </Button>
              </div>
            </div>
            
            {/* Image Generation Carousel */}
            <div className="relative">
              <Card className="p-6 bg-gradient-to-br from-card/80 to-background/50 glass border-border/50">
                <ImageCarousel 
                  images={defaultImageGenerationImages}
                  interval={4000}
                  tenantSlug={tenantSlug}
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Content Automation - Text Left, Image Right */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Automate Your Entire SEO Content Pipeline
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From research to publishing, our AI handles everything. Generate SEO-optimized articles, schedule publication across platforms, and track performance automatically.
              </p>
              <div className="space-y-3">
                {[
                  "AI-powered content generation",
                  "Multi-platform publishing",
                  "Performance tracking & optimization",
                  "Competitor analysis automation"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Process Visualization */}
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-card/80 to-background/50 glass border-border/50">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Research Topics</div>
                      <div className="text-sm text-muted-foreground">AI finds trending keywords</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Generate Content</div>
                      <div className="text-sm text-muted-foreground">Create SEO-optimized articles</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-success/5 rounded-lg">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Auto Publish</div>
                      <div className="text-sm text-muted-foreground">Schedule across platforms</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WorkflowSection;
