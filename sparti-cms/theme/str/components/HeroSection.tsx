import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { extractPropsFromItems, getImage, getHeading, getButton, getTextByKey, SchemaItem } from '../utils/schemaHelpers';
import { STR_ASSETS } from '../config/assets';

interface NavItem {
  name: string;
  href: string;
}

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
  showHeader?: boolean;
  navItems?: NavItem[];
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
  isHomepage?: boolean;
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
  onButtonClick,
  showHeader = false,
  navItems = [],
  isMenuOpen = false,
  setIsMenuOpen,
  isHomepage = false
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
  const finalImageSrc = imageSrc || heroImage?.src || extractedProps.imageSrc || STR_ASSETS.hero.background;
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
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Hero Header - visible on homepage with circular logo, visible on other pages with regular logo */}
      {showHeader && (
        <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex items-center justify-between ${
              isHomepage 
                ? 'pt-8 pb-6 sm:pt-10 sm:pb-8' 
                : 'h-20'
            }`}>
              {/* Logo */}
              <div className={`flex items-center space-x-2 ${isHomepage ? 'pl-4 sm:pl-6' : ''}`}>
                {isHomepage ? (
                  // Circular logo on homepage (larger size, transparent background)
                  <a href="/theme/str">
                    <img 
                      src={STR_ASSETS.logos.circular} 
                      alt="STR Logo - Strength Through Range" 
                      className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto"
                      onError={(e) => {
                        // Fallback to text if image not found
                        const target = e.target as HTMLImageElement;
                        if (target.dataset.fallbackAdded) return; // Prevent duplicate fallback
                        target.style.display = 'none';
                        target.dataset.fallbackAdded = 'true';
                        const fallback = document.createElement('div');
                        fallback.className = 'text-2xl font-bold text-primary';
                        fallback.textContent = 'STR';
                        target.parentElement?.appendChild(fallback);
                      }}
                    />
                  </a>
                ) : (
                  // Regular header logo on other pages
                  <a href="/theme/str">
                    <img 
                      src={STR_ASSETS.logos.header} 
                      alt="STR" 
                      className="h-12 w-auto"
                      onError={(e) => {
                        // Fallback to text if image not found
                        const target = e.target as HTMLImageElement;
                        if (target.dataset.fallbackAdded) return; // Prevent duplicate fallback
                        target.style.display = 'none';
                        target.dataset.fallbackAdded = 'true';
                        const fallback = document.createElement('div');
                        fallback.className = 'text-2xl font-bold text-primary';
                        fallback.textContent = 'STR';
                        target.parentElement?.appendChild(fallback);
                      }}
                    />
                  </a>
                )}
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="transition-colors text-foreground hover:text-primary"
                  >
                    {item.name}
                  </a>
                ))}
                <Button
                  className="bg-[#E00000] text-white hover:bg-[#E00000]/90 font-bold uppercase px-6 py-2 rounded-lg text-sm transition-all duration-300"
                  onClick={() => window.location.href = '/theme/str/booking'}
                >
                  Get Started
                </Button>
              </nav>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden text-foreground"
                onClick={() => setIsMenuOpen && setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-transparent bg-transparent">
              <div className="container mx-auto px-4 py-4 space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen && setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <Button
                  className="w-full bg-[#E00000] text-white hover:bg-[#E00000]/90 font-bold uppercase px-6 py-3 rounded-lg text-sm transition-all duration-300 mt-4"
                  onClick={() => {
                    setIsMenuOpen && setIsMenuOpen(false);
                    window.location.href = '/theme/str/booking';
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </header>
      )}

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
      
      <div className="container mx-auto relative z-10 px-6 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase text-foreground mb-6 sm:mb-8 leading-tight">
            {finalTitle}
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-4 sm:mb-5 leading-relaxed font-medium">
            {finalSubtitle}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 sm:mb-7 leading-relaxed">
            {finalDescription}
          </p>
          <p className="text-base md:text-lg text-muted-foreground mb-8 sm:mb-10 leading-relaxed whitespace-pre-line">
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
