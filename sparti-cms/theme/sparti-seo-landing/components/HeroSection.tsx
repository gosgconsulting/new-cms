import React from 'react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { Card } from './ui/Card';

interface HeroSectionProps {
  tenantName?: string;
  heroBackgroundSrc?: string;
  tenantSlug?: string;
  onGetStarted?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  tenantName = 'Sparti',
  heroBackgroundSrc,
  tenantSlug = 'sparti-seo-landing',
  onGetStarted 
}) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      // Default action - redirect to external app
      window.location.href = 'https://app.sparti.ai/seo-copilot-trial';
    }
  };

  return (
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
          <div className="absolute top-0 left-0 lg:left-20 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl glass border border-primary/20 flex items-center justify-center animate-float shadow-lg">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Top Right - Analytics */}
          <div className="absolute top-10 right-0 lg:right-20 w-14 h-14 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl glass border border-success/20 flex items-center justify-center animate-float animation-delay-1000 shadow-lg">
            <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          {/* Left Middle - Target */}
          <div className="absolute top-1/2 left-0 lg:left-10 w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl glass border border-accent/20 flex items-center justify-center animate-float animation-delay-2000 shadow-lg">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
          </div>
          
          {/* Right Middle - Trending Up */}
          <div className="absolute top-1/2 right-0 lg:right-10 w-18 h-18 bg-gradient-to-br from-warning/20 to-warning/10 rounded-2xl glass border border-warning/20 flex items-center justify-center animate-float animation-delay-500 shadow-lg">
            <svg className="w-9 h-9 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          
          {/* Bottom Left - Bot AI */}
          <div className="absolute bottom-20 left-0 lg:left-32 w-15 h-15 bg-gradient-to-br from-primary/25 to-accent/15 rounded-2xl glass border border-primary/25 flex items-center justify-center animate-float animation-delay-1500 shadow-lg">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          {/* Bottom Right - FileText */}
          <div className="absolute bottom-10 right-0 lg:right-32 w-13 h-13 bg-gradient-to-br from-success/25 to-primary/15 rounded-xl glass border border-success/25 flex items-center justify-center animate-float animation-delay-3000 shadow-lg">
            <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <Badge variant="secondary" className="mb-6 text-primary border-primary/20 glass bg-background/80">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Powered SEO Automation Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text leading-tight">
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
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale"
            >
              Start Growing Traffic
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>

          {/* Search Volume Chart */}
          <div className="max-w-md mx-auto">
            <Card className="p-6 bg-gradient-to-br from-card/80 to-background/50 glass border-border/50">
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
  );
};

export default HeroSection;
