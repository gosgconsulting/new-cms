
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
const Footer = () => {
  return (
    <footer className="bg-deepBlue text-white py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* WordPress: First footer widget area - logo, tagline, social icons */}
          <div>
            <div className="mb-4">
              {/* WordPress: Replace with customizer logo option */}
              <img 
                src="/lovable-uploads/d6e7a1ca-229a-4c34-83fc-e9bdf106b683.png" 
                alt="GO SG CONSULTING Logo" 
                className="h-12"
              />
            </div>
            {/* WordPress: Replace with editable text from theme options */}
            <p className="text-gray-300 mb-4">
              Integrated marketing solutions for startups, entrepreneurs, and brands.
            </p>
            {/* WordPress: Replace with social menu */}
            <div className="flex space-x-3">
              {/* Keep only LinkedIn and Instagram */}
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
          
          {/* WordPress: Second footer widget area - services menu */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Our Services</h3>
            {/* WordPress: Replace with wp_nav_menu - "footer-services" */}
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
          
          {/* WordPress: Third footer widget area - quick links menu */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            {/* WordPress: Replace with wp_nav_menu - "footer-links" */}
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
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          
          {/* WordPress: Fourth footer widget area - contact info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Get In Touch</h3>
            {/* WordPress: Replace with contact info from theme options */}
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
        
        {/* WordPress: Copyright area - replace with dynamic year and site title */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} GO SG CONSULTING. All rights reserved.</p>
          {/* WP: <?php echo date('Y'); ?> <?php echo get_bloginfo('name'); ?> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
