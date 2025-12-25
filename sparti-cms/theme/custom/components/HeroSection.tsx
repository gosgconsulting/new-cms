import React from 'react';

interface HeroSectionProps {
  title?: string;
  description?: string;
  badgeText?: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  onButtonClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  description,
  badgeText,
  buttonText,
  buttonUrl,
  secondaryButtonText,
  secondaryButtonUrl,
  onButtonClick
}) => {
  return (
    <section id="hero" className="relative min-h-[60vh] flex items-center justify-center text-center px-6 pt-20 bg-gradient-to-br from-background via-secondary/40 to-background">
      <div className="container mx-auto max-w-5xl space-y-6">
        {badgeText ? (
          <span className="inline-flex items-center px-4 py-2 text-sm font-medium border border-primary/20 text-primary bg-primary/5 rounded-full">
            {badgeText}
          </span>
        ) : null}
        {title ? (
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
        ) : null}
        {description ? (
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        ) : null}
        {(buttonText || secondaryButtonText) ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {buttonText ? (
              buttonUrl ? (
                <a
                  href={buttonUrl}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                >
                  {buttonText}
                </a>
              ) : (
                <button
                  onClick={onButtonClick}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                >
                  {buttonText}
                </button>
              )
            ) : null}
            {secondaryButtonText ? (
              <a
                href={secondaryButtonUrl || '#'}
                className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {secondaryButtonText}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default HeroSection;