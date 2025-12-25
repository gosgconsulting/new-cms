import React from 'react';
import { Card } from './ui/Card';
import Button from './ui/Button';

interface ComparisonSectionProps {
  onGetStarted?: () => void;
}

const ComparisonSection: React.FC<ComparisonSectionProps> = ({ onGetStarted }) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = 'https://app.sparti.ai/seo-copilot-trial';
    }
  };

  const spartiFeatures = [
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
  ];

  const genericAILimitations = [
    "Short form text content, not specialized for blogging",
    "Requires manual effort to make content SEO-friendly",
    "No linking relevant links from your own website",
    "Ultra generic AI wording and article",
    "No visuals included in sections",
    "No one click publishing"
  ];

  return (
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
          <Card className="p-8 bg-gradient-to-br from-card/80 to-background/50 glass border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Sparti</h3>
              </div>

              <div className="space-y-4">
                {spartiFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Generic AI (Right Column) */}
          <Card className="p-8 bg-gradient-to-br from-card/80 to-background/50 glass border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-muted/10 opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Generic AI</h3>
              </div>

              <div className="space-y-4">
                {genericAILimitations.map((limitation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;

