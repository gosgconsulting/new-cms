
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Phone, Instagram, Linkedin, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          name: 'Footer Contact',
          email,
          message: 'Footer contact form submission',
          form_type: 'Footer Contact'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Thank you!",
        description: "We'll be in touch soon to discuss your marketing needs.",
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Split Layout Contact Section */}
      <div className="relative min-h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-red-900">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[400px]">
            {/* Left Side - Large Text */}
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Build amazing <br />
                campaigns with <br />
                our creative <br />
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">team.</span>
              </h2>
            </div>
            
            {/* Right Side - Contact Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Us Today</h3>
                  <p className="text-gray-600">Welcome to GO SG — Start your journey</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="footer-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Your email
                    </label>
                    <Input
                      id="footer-email"
                      type="email"
                      placeholder="hello@yourcompany.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    {isSubmitting ? "Sending..." : "Get Free Marketing Consultation"}
                  </Button>
                </form>
                
                <div className="text-center mt-6">
                  <p className="text-gray-500 text-sm">
                    Already have questions? <Link to="/contact" className="text-orange-500 hover:text-orange-600 font-medium">Contact us</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Traditional Footer Links */}
      <div className="bg-slate-900 text-white py-12 px-4">
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
                Integrated marketing solutions for startups, entrepreneurs, and brands.
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
                <li><Link to="/services/website-design" className="text-gray-300 hover:text-orange-400 transition-colors">Website Design</Link></li>
                <li><Link to="/services/seo" className="text-gray-300 hover:text-orange-400 transition-colors">SEO</Link></li>
                <li><Link to="/services/paid-ads" className="text-gray-300 hover:text-orange-400 transition-colors">Paid Ads</Link></li>
                <li><Link to="/services/dashboard" className="text-gray-300 hover:text-orange-400 transition-colors">Reporting</Link></li>
              </ul>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-300 hover:text-orange-400 transition-colors">Home</Link></li>
                <li><Link to="/blog" className="text-gray-300 hover:text-orange-400 transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors">Contact</Link></li>
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
                  <Link to="/contact" className="text-gray-300 hover:text-orange-400">Book Meeting</Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-xs">
            <p>© {new Date().getFullYear()} GO SG CONSULTING. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
