
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
    <header className="w-full py-6 px-4 md:px-8 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-3xl font-bold z-10">
            <span className="text-deepBlue">GO</span> <span className="text-coral">SG</span>
          </Link>

          {/* Centered Navigation Menu */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              <Link 
                to="/" 
                className="relative text-gray-700 hover:text-coral font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Home</span>
                <span className="absolute inset-0 w-full h-full bg-coral/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-coral/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/website-design" 
                className="relative text-gray-700 hover:text-coral font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Website Design</span>
                <span className="absolute inset-0 w-full h-full bg-coral/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-coral/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/seo" 
                className="relative text-gray-700 hover:text-coral font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">SEO</span>
                <span className="absolute inset-0 w-full h-full bg-coral/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-coral/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/paid-ads" 
                className="relative text-gray-700 hover:text-coral font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Paid Ads</span>
                <span className="absolute inset-0 w-full h-full bg-coral/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-coral/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/social-media" 
                className="relative text-gray-700 hover:text-coral font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Social Media</span>
                <span className="absolute inset-0 w-full h-full bg-coral/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-coral/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
              
              <Link 
                to="/services/reporting" 
                className="relative text-gray-700 hover:text-coral font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Reporting</span>
                <span className="absolute inset-0 w-full h-full bg-coral/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
                <span className="absolute inset-0 w-full h-full bg-coral/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300"></span>
              </Link>
            </div>
          </nav>

          {/* Contact Us Button */}
          <Button 
            asChild 
            variant="coral" 
            size="sm" 
            className="relative overflow-hidden group bg-coral hover:bg-coral/90 text-white font-medium px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-coral/25 hover:shadow-xl"
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
              variant="coral" 
              size="sm"
              className="bg-coral hover:bg-coral/90 text-white"
            >
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Items - Stack vertically on mobile */}
        <nav className="md:hidden mt-6 flex flex-wrap justify-center gap-4">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-coral font-medium transition-colors duration-300 px-3 py-1"
          >
            Home
          </Link>
          <Link 
            to="/services/website-design" 
            className="text-gray-700 hover:text-coral font-medium transition-colors duration-300 px-3 py-1"
          >
            Design
          </Link>
          <Link 
            to="/services/seo" 
            className="text-gray-700 hover:text-coral font-medium transition-colors duration-300 px-3 py-1"
          >
            SEO
          </Link>
          <Link 
            to="/services/paid-ads" 
            className="text-gray-700 hover:text-coral font-medium transition-colors duration-300 px-3 py-1"
          >
            Paid Ads
          </Link>
          <Link 
            to="/services/social-media" 
            className="text-gray-700 hover:text-coral font-medium transition-colors duration-300 px-3 py-1"
          >
            Social
          </Link>
          <Link 
            to="/services/reporting" 
            className="text-gray-700 hover:text-coral font-medium transition-colors duration-300 px-3 py-1"
          >
            Reporting
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
