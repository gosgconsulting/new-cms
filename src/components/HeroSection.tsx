import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VisualCMSEditor from "@/components/cms/VisualCMSEditor";

/**
 * WordPress Theme Component: Hero Section
 * 
 * Dynamic Component: Will be template-parts/home/hero.php
 * Dynamic Elements:
 * - Heading text
 * - Subtitle/description text
 * - CTA button text and URL
 * - Hero image
 * 
 * WordPress Implementation:
 * - Use ACF fields or theme customizer for all text content
 * - Use wp_get_attachment_image for the hero image
 * - Convert animations to CSS classes for WordPress compatibility
 */
const HeroSection = () => {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black">
        {/* Diagonal light streaks */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent blur-3xl rotate-45 -z-10"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-tl from-white/3 to-transparent blur-3xl -rotate-45 -z-10"></div>
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-gradient-to-br from-brandPurple/10 to-transparent blur-3xl rotate-12 -z-10"></div>
        
        {/* Content */}
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-800/70 px-6 py-3 text-sm">
                <Clock className="mr-2 h-4 w-4 text-brandTeal" />
                <span className="text-gray-300">
                  Results in 3 months or less
                  {/* WP: <?php echo get_field('hero_badge_text', 'option') ?: 'Results in 3 months or less'; ?> */}
                </span>
              </Badge>
            </motion.div>
            
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                We Boost Your SEO{" "}
                <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                  In 3 Months
                </span>
                {/* WP:
                  <?php echo get_field('hero_heading_line_1'); ?>{" "}
                  <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                    <?php echo get_field('hero_heading_line_2'); ?>
                  </span>
                */}
              </h1>
            </motion.div>
            
            {/* Description */}
            <motion.p 
              className="text-xl text-gray-400 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website.
              {/* WP: <?php echo get_field('hero_description'); ?> */}
            </motion.p>
            
            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                <Link to="/contact" className="flex items-center">
                  Get a Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                  {/* WP: <?php echo get_field('hero_cta_text', 'option') ?: 'Get a Quote'; ?> */}
                </Link>
              </Button>
            </motion.div>
            
            {/* Logo Animation Strip */}
            <motion.div
              className="w-full mt-16 pt-12 border-t border-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <p className="text-gray-500 text-sm mb-8">
                Trusted by leading brands
                {/* WP: <?php echo get_field('hero_logos_heading', 'option') ?: 'Trusted by leading brands'; ?> */}
              </p>
              
              <div className="relative overflow-hidden">
                <motion.div
                  className="flex gap-12 items-center justify-center"
                  animate={{
                    x: [0, -1000],
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 20,
                      ease: "linear",
                    },
                  }}
                >
                  {/* First set of logos */}
                  {[...Array(2)].map((_, setIndex) => (
                    <div key={setIndex} className="flex gap-12 items-center">
                      {["ALPHAGUM", "UGLAM", "namlika", "SUNSCRUBEE", "LUXBIO", "BRANDNAME"].map((brand, index) => (
                        <div
                          key={`${setIndex}-${index}`}
                          className="text-gray-600 font-bold text-2xl whitespace-nowrap px-8"
                        >
                          {brand}
                          {/* WP: Logo images will go here - <?php echo wp_get_attachment_image($logo_id, 'medium'); ?> */}
                        </div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center cursor-pointer flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          onClick={() => {
            const nextSection = document.querySelector('#next-section');
            if (nextSection) {
              nextSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }
          }}
        >
          <motion.p 
            className="text-sm text-muted-foreground mb-3 font-light tracking-wide"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Scroll to see how
          </motion.p>
          <motion.div
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full mx-auto relative"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              className="w-1 h-3 bg-muted-foreground/60 rounded-full absolute left-1/2 top-2 transform -translate-x-1/2"
              animate={{ 
                y: [0, 12, 0],
                opacity: [1, 0, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Next Section Target */}
      <div id="next-section"></div>
      
      {/* CMS Editor - Only visible to admin users */}
      <VisualCMSEditor pageId="homepage" />
    </>
  );
};

export default HeroSection;
