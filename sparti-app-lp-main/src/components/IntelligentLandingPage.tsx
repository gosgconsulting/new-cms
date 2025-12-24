import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Search, ArrowDown, Sparkles, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import LeadmapLogo from '@/components/LeadmapLogo';
import WebsiteImporter from '@/components/WebsiteImporter';
import { analyzeBusinessForLeads, LeadSuggestions } from '@/services/aiLeadAnalysis';
import { toast } from 'sonner';

interface IntelligentLandingPageProps {
  onManualSearch: () => void;
  className?: string;
}

const IntelligentLandingPage: React.FC<IntelligentLandingPageProps> = ({
  onManualSearch,
  className
}) => {
  const [businessDescription, setBusinessDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleManualSearch = () => {
    onManualSearch();
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center px-4 py-8", className)}>
      <div className="w-full max-w-4xl space-y-8 animate-fade-in">
        
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <LeadmapLogo className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Lead Generation Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced business lead scraping using Lobstr.io technology
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="shadow-2xl border-primary/20 glass">
          <CardContent className="p-8">
            <WebsiteImporter
              websiteUrl={websiteUrl}
              setWebsiteUrl={setWebsiteUrl}
              businessDescription={businessDescription}
              setBusinessDescription={setBusinessDescription}
            />
          </CardContent>
        </Card>

        {/* Action Button - Single Manual Search Card */}
        <div className="max-w-md mx-auto">
          <Card className="group card-hover-unified card-hover-glow card-hover-gradient border-primary/20 glass">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Search className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Business Lead Search
                </h3>
                <p className="text-muted-foreground text-sm">
                  Configure your search parameters and find business leads using advanced Lobstr.io scraping technology
                </p>
                <Button
                  onClick={handleManualSearch}
                  className="w-full h-12 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 hover:border-accent/50 transition-all duration-300"
                  variant="outline"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Manual Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center pt-8">
          <div className="animate-bounce">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentLandingPage;