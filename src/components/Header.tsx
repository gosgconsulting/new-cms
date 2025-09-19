
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import gosgLogo from "@/assets/go-sg-logo-official.png";
import { useEffect, useState } from "react";

/**
 * WordPress Theme Component: Header
 * 
 * Component: Will be converted to header.php
 * Template Name: Header
 * 
 * Dynamic Elements:
 * - Navigation menu items (will be replaced with wp_nav_menu)
 * - Logo (will be replaced with get_custom_logo or theme option)
 */
interface HeaderProps {
  onContactClick?: () => void;
}

const Header = ({ onContactClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 backdrop-blur-md transition-all duration-300 ${
      isScrolled ? 'bg-background/95 shadow-sm border-b border-border' : 'bg-transparent'
    }`}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center z-10">
            <img 
              src={gosgLogo} 
              alt="GO SG Digital Marketing Agency" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Centered Navigation Menu - Hidden on homepage */}
          {!isHomepage && (
            <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
              <div className="flex items-center space-x-8">
                <Link 
                  to="/" 
                  className={`relative font-medium transition-all duration-300 group ${
                    isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
                  }`}
                >
                  <span className="relative z-10">Home</span>
                  <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                  <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
                </Link>
                
                <Link 
                  to="/services/website-design" 
                  className={`relative font-medium transition-all duration-300 group ${
                    isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
                  }`}
                >
                  <span className="relative z-10">Website Design</span>
                  <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                  <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
                </Link>
                
                <Link 
                  to="/services/seo" 
                  className={`relative font-medium transition-all duration-300 group ${
                    isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
                  }`}
                >
                  <span className="relative z-10">SEO</span>
                  <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                  <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
                </Link>
                
                <Link 
                  to="/services/paid-ads" 
                  className={`relative font-medium transition-all duration-300 group ${
                    isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
                  }`}
                >
                  <span className="relative z-10">Paid Ads</span>
                  <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                  <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
                </Link>
                
                <Link 
                  to="/services/social-media" 
                  className={`relative font-medium transition-all duration-300 group ${
                    isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
                  }`}
                >
                  <span className="relative z-10">Social Media</span>
                  <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                  <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
                </Link>
                
                <Link 
                  to="/services/reporting" 
                  className={`relative font-medium transition-all duration-300 group ${
                    isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
                  }`}
                >
                  <span className="relative z-10">Reporting</span>
                  <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                  <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
                </Link>
              </div>
            </nav>
          )}

          {/* Contact Us Button - Desktop Only */}
          <Button 
            onClick={onContactClick}
            variant="secondary" 
            size="sm" 
            className="hidden md:block relative overflow-hidden group bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-destructive/25 hover:shadow-xl cursor-pointer"
          >
            <span className="relative z-10">Contact Us</span>
            <span className="absolute inset-0 w-full h-full bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
          </Button>

          {/* Mobile Contact Button */}
          <Button 
            onClick={onContactClick}
            variant="secondary" 
            size="sm"
            className="md:hidden bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
          >
            Contact
          </Button>
        </div>

        {/* Mobile Menu Items - Stack vertically on mobile, hidden on homepage */}
        {!isHomepage && (
          <nav className="md:hidden mt-6 flex flex-wrap justify-center gap-4">
            <Link 
              to="/" 
              className={`font-medium transition-colors duration-300 px-3 py-1 ${
                isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/services/website-design" 
              className={`font-medium transition-colors duration-300 px-3 py-1 ${
                isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
              }`}
            >
              Design
            </Link>
            <Link 
              to="/services/seo" 
              className={`font-medium transition-colors duration-300 px-3 py-1 ${
                isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
              }`}
            >
              SEO
            </Link>
            <Link 
              to="/services/paid-ads" 
              className={`font-medium transition-colors duration-300 px-3 py-1 ${
                isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
              }`}
            >
              Paid Ads
            </Link>
            <Link 
              to="/services/social-media" 
              className={`font-medium transition-colors duration-300 px-3 py-1 ${
                isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
              }`}
            >
              Social
            </Link>
            <Link 
              to="/services/reporting" 
              className={`font-medium transition-colors duration-300 px-3 py-1 ${
                isScrolled ? 'text-foreground hover:text-accent' : 'text-foreground hover:text-accent'
              }`}
            >
              Reporting
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
