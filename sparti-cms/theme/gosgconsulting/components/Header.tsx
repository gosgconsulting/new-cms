import React, { useState, useEffect } from 'react';
import gosgLogo from '../assets/go-sg-logo-official.png';

interface HeaderProps {
  tenantName?: string;
  tenantSlug?: string;
  logoSrc?: string;
  onContactClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  tenantName = 'GO SG Consulting',
  tenantSlug = 'gosgconsulting',
  logoSrc,
  onContactClick 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Asset paths for the theme
  const defaultLogoSrc = logoSrc || gosgLogo;

  return (
    <header
      className={`z-50 w-full bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg border-b ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 py-4 md:px-6 md:py-5">
        {/* Logo */}
        <div className="flex items-center justify-start">
          <img
            src={defaultLogoSrc}
            alt={tenantName}
            className="h-10 md:h-12 w-auto object-contain select-none"
            loading="eager"
            decoding="async"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = gosgLogo;
            }}
          />
        </div>

        {/* Your Growth Team Inside - aligned right */}
        <div className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border-2 border-dashed border-blue-500 bg-blue-50/80 backdrop-blur-sm rounded-lg">
          <span className="text-blue-600 font-semibold text-xs md:text-base">
            Your Growth Team Inside
          </span>
        </div>
      </nav>
    </header>
  );
};

export default Header;