
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import gosgLogo from "@/assets/go-sg-logo.png";

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
const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 bg-transparent backdrop-blur-md">
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

          {/* Centered Navigation Menu */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              <Link 
                to="/" 
                className="relative text-foreground hover:text-accent font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Home</span>
                <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/website-design" 
                className="relative text-foreground hover:text-accent font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Website Design</span>
                <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/seo" 
                className="relative text-foreground hover:text-accent font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">SEO</span>
                <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/paid-ads" 
                className="relative text-foreground hover:text-accent font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Paid Ads</span>
                <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/social-media" 
                className="relative text-foreground hover:text-accent font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Social Media</span>
                <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/reporting" 
                className="relative text-foreground hover:text-accent font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Reporting</span>
                <span className="absolute inset-0 w-full h-full bg-accent/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-accent/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
            </div>
          </nav>

          {/* Contact Us Button */}
          <Button 
            asChild 
            variant="secondary" 
            size="sm" 
            className="relative overflow-hidden group bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-destructive/25 hover:shadow-xl"
          >
            <Link to="/contact">
              <span className="relative z-10">Contact Us</span>
              <span className="absolute inset-0 w-full h-full bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
            </Link>
          </Button>

          {/* Mobile Navigation - Simplified */}
          <div className="md:hidden">
            <Button 
              asChild 
              variant="secondary" 
              size="sm"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Items - Stack vertically on mobile */}
        <nav className="md:hidden mt-6 flex flex-wrap justify-center gap-4">
          <Link 
            to="/" 
            className="text-foreground hover:text-accent font-medium transition-colors duration-300 px-3 py-1"
          >
            Home
          </Link>
          <Link 
            to="/services/website-design" 
            className="text-foreground hover:text-accent font-medium transition-colors duration-300 px-3 py-1"
          >
            Design
          </Link>
          <Link 
            to="/services/seo" 
            className="text-foreground hover:text-accent font-medium transition-colors duration-300 px-3 py-1"
          >
            SEO
          </Link>
          <Link 
            to="/services/paid-ads" 
            className="text-foreground hover:text-accent font-medium transition-colors duration-300 px-3 py-1"
          >
            Paid Ads
          </Link>
          <Link 
            to="/services/social-media" 
            className="text-foreground hover:text-accent font-medium transition-colors duration-300 px-3 py-1"
          >
            Social
          </Link>
          <Link 
            to="/services/reporting" 
            className="text-foreground hover:text-accent font-medium transition-colors duration-300 px-3 py-1"
          >
            Reporting
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
