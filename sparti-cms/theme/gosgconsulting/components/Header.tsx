import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
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
  const navigate = useNavigate();
  const location = useLocation();
  const themeBasePath = `/theme/${tenantSlug}`;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Asset paths for the theme
  const defaultLogoSrc = logoSrc || gosgLogo;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Check if we're on a shop-related page (shop, cart, product, checkout)
  const isShopPage = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const themeIndex = pathParts.indexOf(tenantSlug);
    if (themeIndex >= 0 && themeIndex < pathParts.length - 1) {
      const page = pathParts[themeIndex + 1];
      return ['shop', 'cart', 'product', 'checkout'].includes(page);
    }
    return false;
  };

  const showShopNavigation = isShopPage();

  return (
    <header
      className={`z-50 w-full bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg border-b ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 py-4 md:px-6 md:py-5">
        {/* Logo */}
        <div 
          className="flex items-center justify-start cursor-pointer"
          onClick={() => navigate(themeBasePath)}
        >
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

        {/* Navigation Links - Only show on shop pages */}
        {showShopNavigation && (
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(`${themeBasePath}/shop`)}
              className={`text-sm font-medium transition-colors ${
                isActive(`${themeBasePath}/shop`) 
                  ? 'text-blue-600' 
                  : 'text-foreground hover:text-blue-600'
              }`}
            >
              Shop
            </button>
            
            <button
              onClick={() => navigate(`${themeBasePath}/cart`)}
              className="relative p-2 text-foreground hover:text-blue-600 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Your Growth Team Inside - Always visible */}
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