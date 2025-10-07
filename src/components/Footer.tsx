
import { Link } from "react-router-dom";
import { Calendar, Phone, Instagram, Linkedin } from "lucide-react";

/**
 * WordPress Theme Component: Footer
 * 
 * Component: Will be converted to footer.php
 * Template Name: Footer
 * 
 * Dynamic Elements:
 * - Footer widgets/menus (will use WordPress widget areas)
 * - Copyright text (will use dynamic year and site name)
 * - Social links (will come from theme options)
 * 
 * WordPress Implementation:
 * <?php
 * /**
 *  * The footer for our theme
 *  *
 *  * Contains the closing of the #content div and all content after.
 *  *
 *  * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *  *
 *  * @package GoSG
 *  *\/
 * ?>
 * 
 * <footer class="bg-deepBlue text-white py-12 px-4 md:px-8">
 *   <div class="container mx-auto">
 *     <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
 *       <!-- First Footer Widget Area -->
 *       <div>
 *         <?php dynamic_sidebar('footer-1'); ?>
 *       </div>
 *       
 *       <!-- Second Footer Widget Area -->
 *       <div>
 *         <h3 class="text-lg font-semibold mb-4">Our Services</h3>
 *         <?php
 *           wp_nav_menu(array(
 *             'theme_location' => 'footer_services',
 *             'container' => false,
 *             'menu_class' => 'space-y-2',
 *             'walker' => new GoSG_Footer_Menu_Walker()
 *           ));
 *         ?>
 *       </div>
 *       
 *       <!-- Third Footer Widget Area -->
 *       <div>
 *         <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
 *         <?php
 *           wp_nav_menu(array(
 *             'theme_location' => 'footer_links',
 *             'container' => false,
 *             'menu_class' => 'space-y-2',
 *             'walker' => new GoSG_Footer_Menu_Walker()
 *           ));
 *         ?>
 *       </div>
 *       
 *       <!-- Fourth Footer Widget Area -->
 *       <div>
 *         <?php dynamic_sidebar('footer-4'); ?>
 *       </div>
 *     </div>
 *     
 *     <!-- Copyright -->
 *     <div class="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
 *       <p>&copy; <?php echo date('Y'); ?> <?php echo get_bloginfo('name'); ?>. All rights reserved.</p>
 *     </div>
 *   </div>
 * </footer>
 * 
 * <?php wp_footer(); ?>
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
              
              <button 
                onClick={onContactClick}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brandPurple to-brandTeal text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                Start Your Journey
              </button>
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
                <a href="#" className="hover:text-brandTeal transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brandTeal transition-colors">Terms of Service</a>
                <Link to="/blog" className="hover:text-brandTeal transition-colors">Blog</Link>
                <a 
                  href="/sitemap.xml" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-brandTeal transition-colors"
                >
                  XML Sitemap
                </a>
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
