import React from 'react';
import { Button } from './ui/button';
import { 
  getContentByKey, 
  getHeading, 
  getText, 
  getButton, 
  getImageSrc, 
  getImageAlt,
  SchemaComponent 
} from '../utils/schemaHelpers';

interface HeroSectionProps {
  tenantName?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonLink?: string;
  features?: string[];
  onButtonClick?: () => void;
  data?: SchemaComponent;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  tenantName = 'ACATR',
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  buttonText,
  buttonLink,
  features = [],
  onButtonClick,
  data
}) => {
  // Extract from schema if data is provided
  const items = data?.items || [];
  const badge = getContentByKey(items, 'badge');
  const highlight = getHeading(items, 'highlight', 1) || getContentByKey(items, 'highlight');
  const subtitleText = getHeading(items, 'subtitle', 1) || getContentByKey(items, 'subtitle');
  const descriptionText = getText(items, 'description') || getContentByKey(items, 'description');
  const button = getButton(items, 'button');
  const heroImage = getImageSrc(items, 'heroImage') || getImageSrc(items, 'image');
  const heroImageAlt = getImageAlt(items, 'heroImage') || getImageAlt(items, 'image');

  // Use schema values if available, otherwise fall back to props
  const finalTitle = highlight || title || 'Singapore Business Setup In 24 Hours - ACRA Registered';
  const finalSubtitle = subtitleText || subtitle || '';
  const finalDescription = descriptionText || description || 'ACRA-registered filing agents providing complete Singapore company incorporation, professional accounting services, and 100% compliance guarantee. Start your business today with expert guidance from day one.';
  const finalImageSrc = heroImage || imageSrc || '/theme/landingpage/assets/hero-business.jpg';
  const finalImageAlt = heroImageAlt || imageAlt || 'Professional business team collaboration';
  const finalButtonText = button.content || buttonText || 'Start Your Business Journey Today';
  const finalButtonLink = button.link || buttonLink || '#contact';

  // Parse title to extract gradient part if needed
  const titleParts = finalTitle.split(' - ');
  const mainTitle = titleParts[0] || finalTitle;
  const subtitleTitle = titleParts[1] || finalSubtitle || '';

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (finalButtonLink && finalButtonLink.startsWith('#')) {
      const element = document.getElementById(finalButtonLink.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (finalButtonLink && finalButtonLink.startsWith('popup:')) {
      // Handle popup links (e.g., popup:contact)
      if (onButtonClick) {
        onButtonClick();
      }
    } else if (finalButtonLink) {
      window.open(finalButtonLink, '_blank');
    }
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              {badge && (
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  {badge}
                </div>
              )}
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-foreground">
                {mainTitle.includes('In 24 Hours') ? (
                  <>
                    {mainTitle.split('In 24 Hours')[0]}
                    <span className="text-primary">
                      {' In 24 Hours'}
                    </span>
                    {subtitleTitle && (
                      <>
                        {' - '}
                        <span className="text-primary">
                          {subtitleTitle}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  mainTitle
                )}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {finalDescription}
              </p>

              {/* Feature List */}
              {features.length > 0 && (
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <svg className="h-5 w-5 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-foreground font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-opacity group"
                onClick={handleButtonClick}
              >
                {finalButtonText}
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img 
                src={finalImageSrc} 
                alt={finalImageAlt} 
                className="w-full h-[600px] object-cover" 
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/theme/landingpage/assets/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-medium border">
              <div className="text-sm font-medium text-primary">ACRA Registered</div>
              <div className="text-xs text-muted-foreground">Official Filing Agent</div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-medium border">
              <div className="text-sm font-medium text-accent">99% Success Rate</div>
              <div className="text-xs text-muted-foreground">Zero penalties guaranteed</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
    </section>
  );
};

export default HeroSection;
