import React from 'react';
import { Button } from '@/components/ui/button';
import { extractPropsFromItems, getImage, getHeading, getButton, getTextByKey, SchemaItem } from '../utils/schemaHelpers';

interface HeroSectionProps {
  tenantName?: string;
  tenantSlug?: string;
  title?: string;
  description?: string;
  subtitle?: string;
  address?: string;
  imageSrc?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonUrl?: string;
  items?: SchemaItem[];
  onButtonClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  tenantName = 'STR',
  tenantSlug = 'str',
  title,
  description,
  subtitle,
  address,
  imageSrc,
  imageAlt,
  buttonText,
  buttonUrl,
  items,
  onButtonClick
}) => {
  // Extract props from items if provided (for schema-based editing)
  const extractedProps = items ? extractPropsFromItems(items) : {};
  const heroImage = items ? getImage(items, 'image') : null;
  const heroButton = items ? getButton(items, 'button') : null;
  const heroTitle = items ? getHeading(items, 'title') : null;
  const heroDescription = items ? getTextByKey(items, 'description') : null;
  const heroSubtitle = items ? getTextByKey(items, 'subtitle') : null;
  const heroAddress = items ? getTextByKey(items, 'address') : null;
  
  // Use extracted values or fallback to props, then to defaults
  const finalTitle = title || heroTitle || extractedProps.title || 'Train Better, Live Better.';
  const finalSubtitle = subtitle || heroSubtitle || extractedProps.subtitle || 'Where Community meets Performance.';
  const finalDescription = description || heroDescription || extractedProps.description || 'A Premium space for Training, Rehabilitation and Wellness, all under one roof.';
  const finalAddress = address || heroAddress || extractedProps.address || '38 North Canal Road\n#05-01\nS059294';
  const finalImageSrc = imageSrc || heroImage?.src || extractedProps.imageSrc || '/theme/str/assets/hero/hero-background.jpg';
  const finalImageAlt = imageAlt || heroImage?.alt || extractedProps.imageAlt || 'STR Fitness Gym';
  const finalButtonText = buttonText || heroButton?.text || extractedProps.buttonText || 'EXPLORE OUR PROGRAMMES';
  const finalButtonUrl = buttonUrl || heroButton?.url || extractedProps.buttonUrl || '/theme/str#programmes';

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      window.location.href = finalButtonUrl;
    }
  };

  return (
    <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={finalImageSrc}
          alt={finalImageAlt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder if image not found
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=1920';
          }}
        />
        <div className="absolute inset-0 bg-background/70"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase text-foreground mb-6 leading-tight">
            {finalTitle}
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-4 leading-relaxed font-medium">
            {finalSubtitle}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
            {finalDescription}
          </p>
          <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed whitespace-pre-line">
            {finalAddress}
          </p>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 font-semibold"
            onClick={handleButtonClick}
          >
            {finalButtonText}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
