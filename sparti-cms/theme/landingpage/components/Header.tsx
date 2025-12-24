import React, { useState } from 'react';
import { Button } from './ui/button';

interface HeaderProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  onContactClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  tenantName = 'ACATR', 
  tenantSlug = 'landingpage',
  logoSrc,
  onContactClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const isMobile = window.innerWidth < 768;
      const headerHeight = isMobile ? 180 : 80;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { label: "Incorporation", sectionId: "company-incorporation" },
    { label: "Accounting", sectionId: "accounting-services" },
    { label: "Corporate Secretary", sectionId: "corporate-secretarial" },
    { label: "Reviews", sectionId: "testimonials" },
    { label: "FAQ", sectionId: "faq" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={handleLogoClick} className="cursor-pointer bg-transparent border-none">
              {logoSrc ? (
                <img 
                  src={logoSrc} 
                  alt={tenantName} 
                  className="h-8 w-auto" 
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    // Show text fallback
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="h-12 inline-flex items-center font-bold text-xl">${tenantName}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="h-12 inline-flex items-center font-bold text-xl">
                  {tenantName}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.sectionId)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button 
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
              onClick={onContactClick}
            >
              Contact Us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden bg-transparent border-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.sectionId)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none text-left"
                >
                  {item.label}
                </button>
              ))}
              <Button 
                className="bg-gradient-primary hover:opacity-90 transition-opacity w-full mt-4"
                onClick={onContactClick}
              >
                Contact Us
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
