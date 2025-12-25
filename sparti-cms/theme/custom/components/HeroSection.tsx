import React from 'react';

interface HeroSectionProps {
  tenantName?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  tenantName = 'Custom',
  title = 'Design. Build. Launch.',
  description = 'A simple hardcoded theme to quickly preview components and layouts—no database needed.',
  buttonText = 'Get Started',
  onButtonClick
}) => {
  return (
    <section id="hero" className="relative min-h-[60vh] flex items-center justify-center text-center px-6 pt-20 bg-gradient-to-br from-background via-secondary/40 to-background">
      <div className="container mx-auto max-w-5xl space-y-6">
        <span className="inline-flex items-center px-4 py-2 text-sm font-medium border border-primary/20 text-primary bg-primary/5 rounded-full">
          Welcome to {tenantName}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Build a clean website with
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"> hardcoded components</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Keep things simple and fast—ship a minimal site without wiring any backend.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onButtonClick}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
          >
            {buttonText}
          </button>
          <a
            href="#features"
            className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Explore Features
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;