import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-deepBlue text-white py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div>
            <div className="mb-4">
              <img 
                src="/lovable-uploads/d6e7a1ca-229a-4c34-83fc-e9bdf106b683.png" 
                alt="GO SG CONSULTING Logo" 
                className="h-12"
              />
            </div>
            <p className="text-gray-300 mb-4">
              Integrated marketing solutions for startups, entrepreneurs, and brands.
            </p>
            <div className="flex space-x-3">
              <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-200 text-deepBlue transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-200 text-deepBlue transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Services menu */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services/website-design" className="text-gray-300 hover:text-coral transition-colors">
                  Website Design
                </Link>
              </li>
              <li>
                <Link to="/services/seo" className="text-gray-300 hover:text-coral transition-colors">
                  SEO
                </Link>
              </li>
              <li>
                <Link to="/services/paid-ads" className="text-gray-300 hover:text-coral transition-colors">
                  Paid Ads
                </Link>
              </li>
              <li>
                <Link to="/services/dashboard" className="text-gray-300 hover:text-coral transition-colors">
                  Reporting Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Quick links - simplified */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-coral transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-coral transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-coral transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Get In Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-coral" />
                <a href="tel:+6580246850" className="text-gray-300 hover:text-coral">
                  +65 8024 6850
                </a>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-coral" />
                <Link to="/contact" className="text-gray-300 hover:text-coral">
                  Book a Meeting
                </Link>
              </div>
              <Button asChild className="bg-coral hover:bg-coral/90 text-white w-full">
                <Link to="/contact" className="flex items-center justify-center">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Simplified copyright and legal links */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-2">
            <a href="#" className="text-gray-400 hover:text-coral transition-colors">
              Privacy Policy
            </a>
            <span className="hidden md:block">|</span>
            <a href="#" className="text-gray-400 hover:text-coral transition-colors">
              Terms of Service
            </a>
          </div>
          <p>© {new Date().getFullYear()} GO SG CONSULTING. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;