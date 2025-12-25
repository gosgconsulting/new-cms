import React from 'react';
import { Button } from './ui/button';
import { extractPropsFromItems, getImage, getHeading, getButton, getTextByKey, SchemaItem } from '../utils/schemaHelpers';

interface HeroSectionProps {
  tenantName?: string;
  tenantSlug?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonUrl?: string;
  features?: string[];
  showScrollArrow?: boolean;
  items?: SchemaItem[];
  onButtonClick?: () => void;
  compact?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  tenantName = 'GO SG Consulting',
  tenantSlug = 'gosgconsulting',
  title,
  description,
  imageSrc,
  imageAlt,
  buttonText,
  buttonUrl,
  features = [],
  showScrollArrow = false,
  items,
  onButtonClick,
  compact = false
}) => {
  // Extract props from items if provided
  const extractedProps = items ? extractPropsFromItems(items) : {};
  const heroImage = items ? getImage(items, 'image') : null;
  const heroButton = items ? getButton(items, 'button') : null;
  const heroTitle = items ? getHeading(items, 'title') : null;
  
  // Use extracted values or fallback to props
  const finalTitle = title || extractedProps.title || heroTitle || 'Turn traffic into revenue with a Full‑Stack Growth Engine';
  const finalDescription = description || extractedProps.description || 'Helping brands grow their revenue and leads through comprehensive digital marketing services.';
  const finalImageSrc = imageSrc || heroImage?.src || extractedProps.imageSrc;
  const finalImageAlt = imageAlt || heroImage?.alt || 'Hero image';
  const finalButtonText = buttonText || heroButton?.text || extractedProps.buttonText || 'Get Started';
  const finalButtonUrl = buttonUrl || heroButton?.url || extractedProps.buttonUrl || '#';
  const finalShowScrollArrow = showScrollArrow || items?.find(i => i.key === 'showScrollArrow')?.value || false;

  const logoSrc = `/theme/${tenantSlug}/assets/go-sg-logo-official.png`;

  // If image is provided, use image-based hero, otherwise use gradient
  if (finalImageSrc && !compact) {
    return (
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <img
          src={finalImageSrc}
          alt={finalImageAlt}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto max-w-5xl text-center">
          {finalTitle && (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              {finalTitle}
            </h1>
          )}
          {finalDescription && (
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              {finalDescription}
            </p>
          )}
          {finalButtonText && (
            <Button
              onClick={onButtonClick}
              asChild={!!finalButtonUrl}
              className="bg-white text-black hover:bg-gray-100 font-medium px-8 py-6 text-lg rounded-lg"
            >
              {finalButtonUrl ? (
                <a href={finalButtonUrl}>{finalButtonText}</a>
              ) : (
                <span>{finalButtonText}</span>
              )}
            </Button>
          )}
        </div>
        {finalShowScrollArrow && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className={`relative ${compact ? 'min-h-[50vh] py-12' : 'min-h-screen'} flex items-center justify-center px-4 pt-32 md:pt-24 overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background`}>
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
                {finalTitle}
              </span>
            </h1>
          </div>

          {/* Description */}
          {finalDescription && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              {finalDescription}
            </p>
          )}

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
          {finalButtonText && (
            <div className="mt-8">
              <Button 
                onClick={onButtonClick}
                asChild={!!finalButtonUrl}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium px-8 py-6 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                {finalButtonUrl ? (
                  <a href={finalButtonUrl}>{finalButtonText}</a>
                ) : (
                  <span>{finalButtonText}</span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Next Section Target */}
      <div id="next-section"></div>
    </section>
  );
};

export default HeroSection;

