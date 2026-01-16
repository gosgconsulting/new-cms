import React, { useState, useEffect } from 'react';
import './theme.css';
import { Button } from '@/components/ui/button';
import { Menu, X, Instagram } from 'lucide-react';
import ContactModal from './ContactModal';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  pageSlug?: string;
}

const ClassesPage: React.FC<TenantLandingProps> = ({
  tenantName = 'STR',
  tenantSlug = 'str',
  tenantId
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Check for #contact hash in URL and open modal
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#contact') {
        setIsContactModalOpen(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Navigation items
  const navItems = [
    { name: 'About Us', href: '/theme/str' },
    { name: 'Programmes', href: '/theme/str#programmes' },
    { name: 'Gallery', href: '/theme/str#gallery' },
    { name: 'FAQs', href: '/theme/str#faq' },
  ];

  // Footer menu items
  const footerMenuItems = [
    { name: 'About Us', href: '/theme/str#about' },
    { name: 'Our Programmes', href: '/theme/str#programmes' },
    { name: 'Gallery', href: '/theme/str#gallery' },
    { name: 'Reviews', href: '/theme/str#reviews' },
    { name: 'Our Team', href: '/theme/str#team' },
    { name: 'FAQ', href: '/theme/str#faq' },
  ];

  return (
    <div className="str-theme min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="relative z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <a href="/theme/str">
                <img 
                  src="/theme/str/assets/logos/str-logo-1-1024x604.png" 
                  alt="STR" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.dataset.fallbackAdded) return;
                    target.style.display = 'none';
                    target.dataset.fallbackAdded = 'true';
                    const fallback = document.createElement('div');
                    fallback.className = 'text-2xl font-bold text-primary';
                    fallback.textContent = 'STR';
                    target.parentElement?.appendChild(fallback);
                  }}
                />
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <Button
                className="bg-[#E00000] text-white hover:bg-[#E00000]/90 font-bold uppercase px-6 py-2 rounded-lg text-sm transition-all duration-300"
                onClick={() => setIsContactModalOpen(true)}
              >
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <Button
                className="w-full bg-[#E00000] text-white hover:bg-[#E00000]/90 font-bold uppercase px-6 py-3 rounded-lg text-sm transition-all duration-300 mt-4"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsContactModalOpen(true);
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-0">
        {/* Need Help Section */}
        <section className="bg-background border-b border-border py-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold uppercase mb-2 text-foreground">
                  NEED HELP?
                </h2>
                <p className="text-foreground/80 text-sm md:text-base">
                  Have questions about booking a class? Our team is here to assist you.
                </p>
              </div>
              <Button
                className="bg-[#E48D2A] hover:bg-[#E48D2A]/90 text-white font-bold uppercase px-6 py-3 rounded-lg text-sm transition-all duration-300 whitespace-nowrap"
                onClick={() => setIsContactModalOpen(true)}
              >
                Chat with us
              </Button>
            </div>
          </div>
        </section>

        <iframe 
          src="https://bookings.vibefam.com/strfitnessclub/classes#widget" 
          style={{ height: 'calc(100dvh - 120px)', width: '100%' }} 
          frameBorder="0" 
          height="700px"
          title="STR Fitness Classes"
        />
      </main>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-t border-border/20">
        <div className="container mx-auto max-w-7xl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-12">
            {/* Left Column - Logo & Social */}
            <div className="space-y-6">
              <img 
                src="/theme/str/assets/logos/str-logo-1-1024x604.png" 
                alt="STR" 
                className="h-12 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.dataset.fallbackAdded) return;
                  target.style.display = 'none';
                  target.dataset.fallbackAdded = 'true';
                  const fallback = document.createElement('div');
                  fallback.className = 'text-4xl font-bold text-foreground uppercase tracking-tight';
                  fallback.textContent = 'STR';
                  target.parentElement?.appendChild(fallback);
                }}
              />
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border-2 border-foreground/30 flex items-center justify-center hover:border-[#E48D2A] hover:bg-[#E48D2A]/10 transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-foreground group-hover:text-[#E48D2A] transition-colors" />
                </a>
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border-2 border-foreground/30 flex items-center justify-center hover:border-[#E48D2A] hover:bg-[#E48D2A]/10 transition-all duration-300 group"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="h-5 w-5 text-foreground group-hover:text-[#E48D2A] transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Middle Column - Menu */}
            <div>
              <h3 className="text-lg font-bold uppercase text-foreground mb-4 relative inline-block">
                MENU
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E00000]"></span>
              </h3>
              <nav className="mt-6 space-y-3">
                {footerMenuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-foreground/80 hover:text-[#E00000] transition-colors text-sm font-medium group"
                  >
                    <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                      {item.name}
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Right Column - Customer Support */}
            <div>
              <h3 className="text-lg font-bold uppercase text-foreground mb-4">CUSTOMER SUPPORT</h3>
              <p className="text-foreground/80 text-sm mt-6">
                Mon-Friday – 9am – 6pm
              </p>
            </div>
          </div>

          {/* Bottom Section - Legal & Copyright */}
          <div className="pt-8 border-t border-border/20 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/60">
              <a
                href="/privacy-policy"
                className="hover:text-[#E00000] transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-foreground/40">•</span>
              <a
                href="/terms-conditions"
                className="hover:text-[#E00000] transition-colors"
              >
                Terms & Conditions
              </a>
            </div>
            <div className="text-center text-sm text-foreground/60">
              @ 2025. <span className="font-bold text-foreground">STR</span>. © All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  );
};

export default ClassesPage;
