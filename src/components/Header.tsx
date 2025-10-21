
import { Link } from "react-router-dom";
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
 * - Logo (will be replaced with get_custom_logo or theme option)
 */
interface HeaderProps {
  onContactClick?: () => void;
}

const Header = ({ onContactClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

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
          <Link to="/dashboard" className="flex items-center z-10">
            <img 
              src={gosgLogo} 
              alt="GO SG Digital Marketing Agency" 
              className="h-12 w-auto"
            />
          </Link>

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
      </div>
    </header>
  );
};

export default Header;
