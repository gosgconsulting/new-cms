
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
    <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Social */}
            <div>
              <div className="mb-4">
                <img 
                  src="/lovable-uploads/d6e7a1ca-229a-4c34-83fc-e9bdf106b683.png" 
                  alt="GO SG CONSULTING Logo" 
                  className="h-12"
                />
              </div>
              <p className="text-gray-300 mb-4 text-sm">
                Professional SEO services that boost search rankings and drive organic traffic for Singapore businesses.
              </p>
              <div className="flex space-x-3">
                <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-white">Our Services</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services/seo" className="text-gray-300 hover:text-orange-400 transition-colors">Technical SEO</Link></li>
                <li><Link to="/services/seo" className="text-gray-300 hover:text-orange-400 transition-colors">Local SEO</Link></li>
                <li><Link to="/services/seo" className="text-gray-300 hover:text-orange-400 transition-colors">Content SEO</Link></li>
                <li><Link to="/services/dashboard" className="text-gray-300 hover:text-orange-400 transition-colors">SEO Audits</Link></li>
              </ul>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-300 hover:text-orange-400 transition-colors">Home</Link></li>
                <li><Link to="/blog" className="text-gray-300 hover:text-orange-400 transition-colors">Blog</Link></li>
                <li><button onClick={onContactClick} className="text-gray-300 hover:text-orange-400 transition-colors cursor-pointer">Contact</button></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-white">Get In Touch</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-orange-400" />
                  <a href="tel:+6580246850" className="text-gray-300 hover:text-orange-400">+65 8024 6850</a>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-orange-400" />
                  <button onClick={onContactClick} className="text-gray-300 hover:text-orange-400 cursor-pointer">Book Meeting</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-xs">
            <p>© {new Date().getFullYear()} GO SG CONSULTING. All rights reserved.</p>
          </div>
        </div>
    </footer>
  );
};

export default Footer;
