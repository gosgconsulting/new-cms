import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SpartiLogo from '@/components/LeadmapLogo';
import TestimonialsSection from '@/components/TestimonialsSection';
import keywordTableImage from '@/assets/keyword-table.png';
import keywordsExplorerImage from '@/assets/keywords-explorer.png';
import topicsResearchImage from '@/assets/google-search-topics.png';
import sourceInformationImage from '@/assets/source-information.png';
import featuredImageModal from '@/assets/featured-image-placeholder.png';
import articlePreview from '@/assets/article-preview-placeholder.png';
import { InteractiveSEOSection } from '@/components/InteractiveSEOSection';
import { 
  Search, 
  FileText, 
  BarChart, 
  TrendingUp, 
  Target,
  CheckCircle,
  ArrowRight,
  Zap,
  Bot,
  Database,
  Calendar,
  Link,
  ArrowDown,
  Sparkles,
  MessageSquare,
  Check,
  X
} from 'lucide-react';

const LandingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');

  // Carousel component for image slideshow
  const ImageCarousel = ({ images, interval = 3000 }: { images: Array<{ src: string; alt: string }>, interval?: number }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, interval);

      return () => clearInterval(timer);
    }, [images.length, interval]);

    return (
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-auto rounded-lg border border-border/30"
              />
            </div>
          ))}
        </div>
        
        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary' : 'bg-primary/30'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  };

  const plans = [
    { 
      id: "starter", 
      name: "Starter", 
      monthlyPrice: 20, 
      annualPrice: 192, // 20 × 12 × 0.8 (20% discount)
      brand_limit: 3, 
      tokenLimit: 20,
      features: ["3 brands", "Keywords research", "Topics research", "Article generation", "Scheduling"],
      popular: false
    },
    { 
      id: "pro", 
      name: "Pro", 
      monthlyPrice: 40, 
      annualPrice: 384, // 40 × 12 × 0.8 (20% discount)
      brand_limit: 10, 
      tokenLimit: 40,
      features: ["10 brands", "Keywords research", "Topics research", "Article generation", "Scheduling"],
      popular: true
    },
    { 
      id: "agency", 
      name: "Agency", 
      monthlyPrice: 100, 
      annualPrice: 960, // 100 × 12 × 0.8 (20% discount)
      brand_limit: 0, 
      tokenLimit: 100,
      features: ["Unlimited brands", "Keywords research", "Topics research", "Article generation", "Scheduling", "Priority support"],
      popular: false
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavingsPercentage = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    return Math.round(((plan.monthlyPrice * 12 - plan.annualPrice * 12) / (plan.monthlyPrice * 12)) * 100);
  };

  const handleGetStarted = () => {
    // Redirect to external Sparti app
    window.location.href = 'https://app.sparti.ai/seo-copilot-trial';
  };

  const handleGoToApp = () => {
    // Redirect to external Sparti app
    window.location.href = 'https://app.sparti.ai/seo-copilot-trial';
  };

  const features = [
    {
      icon: Bot,
      title: "AI Content Generation",
      description: "Automatically generate SEO-optimized articles, blog posts, and web content that ranks higher in search results.",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Search,
      title: "Smart Keyword Research",
      description: "AI-powered keyword discovery finds high-value, low-competition keywords for your niche automatically.",
      gradient: "from-accent/20 to-accent/5"
    },
    {
      icon: TrendingUp,
      title: "Automated Publishing",
      description: "Schedule and publish your SEO content across multiple platforms with one-click automation.",
      gradient: "from-warning/20 to-warning/5"
    },
    {
      icon: BarChart,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Navigation */}
      <nav className="w-full py-4 px-6 border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <SpartiLogo size="md" showText />
          <div className="flex items-center gap-4">
            <Button onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        {/* Background Chat Visualization */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-xl animate-pulse" />
          <div className="absolute top-40 right-20 w-48 h-24 bg-gradient-to-l from-success/10 to-primary/10 rounded-2xl blur-lg animate-pulse animation-delay-1000" />
          <div className="absolute bottom-32 left-1/4 w-56 h-28 bg-gradient-to-r from-accent/10 to-warning/10 rounded-2xl blur-xl animate-pulse animation-delay-2000" />
          
          {/* Organic Traffic Growth Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" fill="none">
            <path d="M100 600 Q300 400 500 350 T900 250 L1100 200" stroke="url(#gradient1)" strokeWidth="2" opacity="0.6" className="animate-pulse" />
            <path d="M150 650 Q350 450 550 400 T950 300 L1150 250" stroke="url(#gradient2)" strokeWidth="2" opacity="0.4" className="animate-pulse animation-delay-500" />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Floating SEO Icons */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Top Left - Search Icon */}
            <div className="absolute top-0 left-0 lg:left-20 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl backdrop-blur-sm border border-primary/20 flex items-center justify-center animate-float shadow-lg">
              <Search className="w-8 h-8 text-primary" />
            </div>
            
            {/* Top Right - Analytics */}
            <div className="absolute top-10 right-0 lg:right-20 w-14 h-14 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl backdrop-blur-sm border border-success/20 flex items-center justify-center animate-float animation-delay-1000 shadow-lg">
              <BarChart className="w-7 h-7 text-success" />
            </div>
            
            {/* Left Middle - Target */}
            <div className="absolute top-1/2 left-0 lg:left-10 w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl backdrop-blur-sm border border-accent/20 flex items-center justify-center animate-float animation-delay-2000 shadow-lg">
              <Target className="w-6 h-6 text-accent" />
            </div>
            
            {/* Right Middle - Trending Up */}
            <div className="absolute top-1/2 right-0 lg:right-10 w-18 h-18 bg-gradient-to-br from-warning/20 to-warning/10 rounded-2xl backdrop-blur-sm border border-warning/20 flex items-center justify-center animate-float animation-delay-500 shadow-lg">
              <TrendingUp className="w-9 h-9 text-warning" />
            </div>
            
            {/* Bottom Left - Bot AI */}
            <div className="absolute bottom-20 left-0 lg:left-32 w-15 h-15 bg-gradient-to-br from-primary/25 to-accent/15 rounded-2xl backdrop-blur-sm border border-primary/25 flex items-center justify-center animate-float animation-delay-1500 shadow-lg">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            
            {/* Bottom Right - FileText */}
            <div className="absolute bottom-10 right-0 lg:right-32 w-13 h-13 bg-gradient-to-br from-success/25 to-primary/15 rounded-xl backdrop-blur-sm border border-success/25 flex items-center justify-center animate-float animation-delay-3000 shadow-lg">
              <FileText className="w-7 h-7 text-success" />
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            <Badge variant="secondary" className="mb-6 text-primary border-primary/20 backdrop-blur-sm bg-background/80">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered SEO Automation Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
            Research, Write & Rank
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent">
              on Complete Autopilot
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            From keyword research to automated publishing - our AI handles your entire SEO content workflow. 
            Research trending topics, generate optimized articles, and schedule them across all your platforms.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={handleGetStarted} 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Growing Traffic
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Search Volume Chart */}
          <div className="max-w-md mx-auto">
            <Card className="p-6 bg-gradient-to-br from-card/80 to-background/50 backdrop-blur-sm border-border/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Search Volume</h3>
                <span className="text-sm text-success font-medium">High</span>
              </div>
              
              {/* Chart Area */}
              <div className="h-24 bg-gradient-to-t from-primary/5 to-transparent rounded-lg p-3 relative overflow-hidden mb-4">
                <svg viewBox="0 0 400 80" className="w-full h-full">
                  <defs>
                    <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path
                    d="M 0 60 Q 100 50 133 45 Q 200 38 266 30 Q 333 22 400 18 L 400 80 L 0 80 Z"
                    fill="url(#volumeGradient)"
                  />
                  {/* Line */}
                  <path
                    d="M 0 60 Q 100 50 133 45 Q 200 38 266 30 Q 333 22 400 18"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              
              {/* Data Points */}
              <div className="flex justify-between items-end text-center">
                <div>
                  <div className="text-xl font-bold text-foreground">28k</div>
                  <div className="text-xs text-muted-foreground">Oct 24</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">35k</div>
                  <div className="text-xs text-muted-foreground">Nov 24</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">42k</div>
                  <div className="text-xs text-muted-foreground">Dec 24</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">48k</div>
                  <div className="text-xs text-muted-foreground">Jan 25</div>
                </div>
              </div>
            </Card>
          </div>
          </div>
        </div>
      </section>

      {/* SEO Workflow Section - "SEO is more important than ever" - Korean Modern Style */}
      <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-background via-card/30 to-background">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-l from-accent/5 to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
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
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <Card className="relative p-8 text-center backdrop-blur-sm bg-card/80 border-border/50 rounded-3xl hover:border-primary/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/20">
                  <Database className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Blog Management</h3>
                <p className="text-muted-foreground mb-4">Automate</p>
                <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto" />
              </Card>
            </div>

            {/* Daily SEO Articles */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <Card className="relative p-8 text-center backdrop-blur-sm bg-card/80 border-border/50 rounded-3xl hover:border-accent/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-accent/20">
                  <Calendar className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Daily SEO Articles</h3>
                <p className="text-muted-foreground mb-4">Publish</p>
                <div className="w-12 h-1 bg-gradient-to-r from-accent to-warning rounded-full mx-auto" />
              </Card>
            </div>

            {/* Schedule Feature */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-warning/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <Card className="relative p-8 text-center backdrop-blur-sm bg-card/80 border-border/50 rounded-3xl hover:border-warning/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-warning/20 to-warning/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-warning/20">
                  <Link className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Auto Schedule</h3>
                <p className="text-muted-foreground mb-4">Grow</p>
                <div className="w-12 h-1 bg-gradient-to-r from-warning to-success rounded-full mx-auto" />
              </Card>
            </div>
          </div>

          {/* Flow Diagram */}
          <div className="relative mb-16">
            {/* Curved Flow Lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200" fill="none">
              <path 
                d="M200 50 Q400 100 600 50" 
                stroke="url(#flowGradient1)" 
                strokeWidth="2" 
                className="opacity-60 animate-pulse animation-delay-500"
              />
              <path 
                d="M150 150 Q400 100 650 150" 
                stroke="url(#flowGradient2)" 
                strokeWidth="2" 
                className="opacity-40 animate-pulse animation-delay-1000"
              />
              <defs>
                <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Flow Arrow */}
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30 animate-bounce-in">
                <ArrowDown className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Google Results */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <Card className="relative p-8 backdrop-blur-sm bg-card/80 border-border/50 rounded-3xl hover:border-success/30 transition-all duration-500 hover:scale-105">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Highlighted in Google, Bing, and more</h3>
                    <p className="text-sm text-muted-foreground">Rank higher in search results</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-background/80 to-card/50 rounded-2xl p-6 backdrop-blur-sm border border-border/30">
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
              <Card className="relative p-8 backdrop-blur-sm bg-card/80 border-border/50 rounded-3xl hover:border-primary/30 transition-all duration-500 hover:scale-105">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Mentioned in ChatGPT, Perplexity, and more</h3>
                    <p className="text-sm text-muted-foreground">AI-powered brand mentions</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-background/80 to-card/50 rounded-2xl p-6 backdrop-blur-sm border border-border/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
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

      {/* Comparison Section - Sparti vs Generic AI */}
      <section className="py-20 px-6 bg-gradient-to-br from-card/20 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Sparti Over Generic AI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See the difference between specialized SEO automation and generic AI tools
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sparti (Left Column) */}
            <Card className="p-8 bg-gradient-to-br from-card/80 to-background/50 backdrop-blur-sm border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Sparti</h3>
                </div>

                <div className="space-y-4">
                  {[
                    "Writes blog content in a human-like style",
                    "Creates tables to compare data insights",
                    "Copy/paste ready HTML and markdown",
                    "Tailored to your brand's style and tone",
                    "Ensures unique and original content",
                    "Generates topic ideas from trends",
                    "Custom visuals and illustrations",
                    "Formats blogs for readability",
                    "SEO high-ranking keywords",
                    "Auto-link relevant pages"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Generic AI (Right Column) */}
            <Card className="p-8 bg-gradient-to-br from-card/80 to-background/50 backdrop-blur-sm border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-muted/10 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">Generic AI</h3>
                </div>

                <div className="space-y-4">
                  {[
                    "Short form text content, not specialized for blogging",
                    "Requires manual effort to make content SEO-friendly",
                    "No linking relevant links from your own website",
                    "Ultra generic AI wording and article",
                    "No visuals included in sections",
                    "No one click publishing"
                  ].map((limitation, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-destructive" />
                      </div>
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                  
                  {/* Add empty spaces to match left column height */}
                  {Array(4).fill(0).map((_, index) => (
                    <div key={`empty-${index}`} className="h-7"></div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4"
            >
              Try Sparti for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Keywords Interface with Carousel */}
            <div className="relative">
              <Card className="p-6 bg-gradient-to-br from-card/80 to-background/50 backdrop-blur-sm border-border/50">
                <ImageCarousel 
                  images={[
                    { src: keywordsExplorerImage, alt: "Keywords Explorer Interface" },
                    { src: keywordTableImage, alt: "Keywords Table with Search Volume" }
                  ]}
                  interval={4000}
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
              <Card className="p-6 bg-gradient-to-br from-card/80 to-background/50 backdrop-blur-sm border-border/50">
                <ImageCarousel 
                  images={[
                    { src: topicsResearchImage, alt: "Topics Research Management" },
                    { src: sourceInformationImage, alt: "Source Information from Google Results" }
                  ]}
                  interval={3500}
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
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
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
              <Card className="p-6 bg-gradient-to-br from-card/80 to-background/50 backdrop-blur-sm border-border/50">
                <ImageCarousel 
                  images={[
                    { src: featuredImageModal, alt: "Featured Image Management Modal" },
                    { src: articlePreview, alt: "Article Preview with Generated Image" }
                  ]}
                  interval={4000}
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Content Automation - Text Left, Image Right */}

      {/* Section 5: Content Automation - Text Left, Image Right */}
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
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Process Visualization */}
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-card/80 to-background/50 backdrop-blur-sm border-border/50">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Research Topics</div>
                      <div className="text-sm text-muted-foreground">AI finds trending keywords</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium">Generate Content</div>
                      <div className="text-sm text-muted-foreground">Create SEO-optimized articles</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-success/5 rounded-lg">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-success" />
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

      {/* Interactive SEO Section */}
      <InteractiveSEOSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section with 3 Cards */}
      <section className="py-20 px-6 bg-gradient-to-b from-card/20 to-background">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
              <Check className="h-4 w-4 mr-2" />
              Choose Your Plan
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with a 14-day free trial (5 tokens). No credit card required.
            </p>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-full p-1">
              <div className="flex items-center">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annually')}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                    billingPeriod === 'annually'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Annual
                  <span className="ml-2 bg-success text-success-foreground text-xs px-2 py-1 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative border-2 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden ${
                  plan.popular ? 'border-primary/40 ring-2 ring-primary/20' : 'border-primary/20'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-8 bg-primary flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary-foreground">MOST POPULAR</span>
                  </div>
                )}
                
                {/* Highlight Border */}
                <div className={`absolute ${plan.popular ? 'top-8' : 'top-0'} left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/70`} />
                
                <CardHeader className={`text-center pb-6 ${plan.popular ? 'pt-12' : ''}`}>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="flex justify-center items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-primary">
                      ${getPrice(plan)}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  
                  {billingPeriod === 'annually' && getSavingsPercentage(plan) > 0 && (
                    <Badge variant="secondary" className="mb-4 bg-success/10 text-success border-success/20">
                      Save {getSavingsPercentage(plan)}% annually
                    </Badge>
                  )}

                  <CardDescription className="text-base">
                    {plan.tokenLimit} tokens / month
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.slice(1).map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="text-center pt-4">
                    <Button 
                      size="lg" 
                      className={`w-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover-scale ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' 
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                      onClick={handleGetStarted}
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="text-sm text-muted-foreground mt-3">
                      14-day free trial (5 tokens) • Then upgrade
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <SpartiLogo size="sm" showText />
              <span className="text-muted-foreground">© 2024 Sparti. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://app.sparti.ai/seo-copilot-trial" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="https://app.sparti.ai/seo-copilot-trial" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="https://app.sparti.ai/seo-copilot-trial" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;