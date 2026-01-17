import React, { useState } from 'react';
import { Button } from 'flowbite-react';

interface HeaderProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  onContactClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  tenantName = 'Master Template', 
  tenantSlug = 'master',
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

  // Minimal navigation for one-page theme
  const navItems = [
    { label: "Features", sectionId: "features" },
    { label: "Services", sectionId: "services" },
    { label: "About", sectionId: "about" },
    { label: "Testimonials", sectionId: "testimonials" },
    { label: "FAQ", sectionId: "faq" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                      parent.innerHTML = `<span class="h-8 inline-flex items-center font-bold text-xl text-gray-900">${tenantName}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="h-8 inline-flex items-center font-bold text-xl text-gray-900">
                  {tenantName}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.sectionId}
                onClick={() => scrollToSection(item.sectionId)}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Contact Button */}
          <div className="hidden md:flex items-center">
            <Button
              onClick={onContactClick}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Contact Us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
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
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.sectionId}
                  onClick={() => scrollToSection(item.sectionId)}
                  className="text-left text-sm text-gray-600 hover:text-blue-600 transition-colors py-2"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => {
                  if (onContactClick) onContactClick();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 mt-2"
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
