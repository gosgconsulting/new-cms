import React from 'react';
import { Button } from './ui/button';

interface HeroSectionProps {
  tenantName?: string;
  tenantSlug?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  buttonText?: string;
  features?: string[];
  onButtonClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  tenantName = 'GO SG Consulting',
  tenantSlug = 'gosgconsulting',
  title = 'Turn traffic into revenue with a Full‑Stack Growth Engine',
  description = 'Helping brands grow their revenue and leads through comprehensive digital marketing services including SEO, SEM, Social Media Ads, Website Design, and Graphic Design.',
  imageSrc,
  imageAlt = 'Digital marketing growth',
  buttonText = 'Get Free Consultation',
  features = [
    'Full-Stack Digital Marketing',
    'SEO & SEM Optimization', 
    'Social Media Advertising'
  ],
  onButtonClick
}) => {
  const logoSrc = `/theme/${tenantSlug}/assets/go-sg-logo-official.png`;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 md:pt-24 overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Diagonal gradient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent blur-3xl rotate-45 -z-10"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-tl from-cyan-500/15 to-transparent blur-3xl -rotate-45 -z-10"></div>
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl rotate-12 -z-10"></div>
      
      {/* Content */}
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo and Label */}
          <div className="flex flex-col items-center gap-3 mb-8 md:mb-4 mt-16 md:mt-0">
            <div className="inline-flex items-center justify-center cursor-pointer hover:opacity-80 transition">
              <img
                src={logoSrc}
                alt={tenantName}
                className="h-10 md:h-10 w-auto"
              />
            </div>
            <div className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border-2 border-dashed border-blue-500 bg-blue-50/80 backdrop-blur-sm rounded-lg">
              <span className="text-blue-600 font-semibold text-xs md:text-base">
                Your Growth Team Inside
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-neutral-900 dark:text-white">
                Turn traffic into revenue with a{' '}
              </span>
              <span className="bg-gradient-to-r from-purple-500 via-cyan-500 to-orange-500 bg-clip-text text-transparent">
                Full‑Stack Growth Engine
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            {description}
          </p>

          {/* Features */}
          {features && features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                >
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <div className="mt-8">
            <Button 
              onClick={onButtonClick}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium px-8 py-6 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>

      {/* Next Section Target */}
      <div id="next-section"></div>
    </section>
  );
};

export default HeroSection;

