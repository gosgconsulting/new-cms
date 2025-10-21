
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * WordPress Theme Component: Footer
 */
interface FooterProps {
  onContactClick?: () => void;
}

const Footer = ({ onContactClick }: FooterProps) => {
  return (
    <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
            {/* Left Side - CTA Section */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                  Get Your SEO Strategy
                </span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Ready to dominate search results? Let's discuss how we can help your business grow.
              </p>
              
              <Button 
                onClick={onContactClick}
                variant="cta-gradient"
                size="lg"
                className="w-full sm:w-auto cursor-pointer"
              >
                Start Your Journey
              </Button>
            </div>
            
            {/* Right Side - Contact Links */}
            <div className="lg:text-right">
              <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">Contact</h3>
              <div className="space-y-3">
                <a 
                  href="https://wa.me/1234567890" 
                  target="_blank" 
                  rel="noreferrer"
                  className="block text-xl text-white hover:text-brandTeal transition-colors"
                >
                  WhatsApp
                </a>
                <a 
                  href="https://calendly.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="block text-xl text-white hover:text-brandTeal transition-colors"
                >
                  Book a Meeting
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar - Legal Links */}
          <div className="pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
                <Link to="/dashboard" className="hover:text-brandTeal transition-colors">Home</Link>
                <Link to="/blog" className="hover:text-brandTeal transition-colors">Blog</Link>
                <Link to="#" onClick={(e) => { e.preventDefault(); onContactClick?.(); }} className="hover:text-brandTeal transition-colors">Contact</Link>
              </div>
              
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} GO SG CONSULTING. All rights reserved.
              </p>
            </div>
          </div>
        </div>
    </footer>
  );
};

export default Footer;
