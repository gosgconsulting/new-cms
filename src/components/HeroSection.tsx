import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
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
      <section className="relative min-h-screen flex items-center px-4 overflow-hidden">
        {/* Background gradient - keep in CSS */}
        <div className="absolute inset-0 gradient-bg -z-10"></div>
        
        {/* Abstract shapes - keep in CSS */}
        <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-brandPurple/10 blur-3xl"></div>
        <div className="absolute bottom-10 left-[5%] w-40 h-40 rounded-full bg-brandPurple/20 blur-3xl"></div>
        
        {/* Content */}
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* WordPress: Replace with ACF fields */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  We Boost Your SEO <br />
                  <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                    In 3 Months
                  </span>
                </h1>
                {/* WP:
                  <?php echo get_field('hero_heading_line_1'); ?> <br />
                  <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                    <?php echo get_field('hero_heading_line_2'); ?>
                  </span>
                */}
              </motion.div>
              
              <motion.p 
                className="text-xl text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                We help businesses grow through strategic digital marketing initiatives that drive real results.
                {/* WP: <?php echo get_field('hero_description'); ?> */}
              </motion.p>
              
            </div>
            
            {/* WordPress: Hero Image - use wp_get_attachment_image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-video bg-secondary/60 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden border border-white/10">
                {/* Neon data growth chart image - will be dynamic in WordPress */}
                <img 
                  src="/lovable-uploads/35e0c5a6-18b6-412a-ac65-0197f19f1dfc.png"
                  alt="Neon data growth chart showing business performance"
                  className="w-full h-full object-cover"
                />
                
                {/* Animated floating elements - implement with CSS animations in WordPress */}
                <motion.div 
                  className="absolute top-[15%] right-[15%] w-16 h-16 bg-brandPurple/80 rounded-full"
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <motion.div 
                  className="absolute bottom-[20%] left-[15%] w-12 h-12 bg-coral/80 rounded-full"
                  animate={{
                    y: [0, 15, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
                
                <motion.div 
                  className="absolute top-[30%] left-[20%] w-10 h-10 bg-brandTeal/80 rounded-full"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
                
                {/* Chart-like graphic element */}
                <motion.svg 
                  className="absolute bottom-[15%] right-[20%] w-32 h-24"
                  viewBox="0 0 100 60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <motion.path
                    d="M0,50 Q25,10 50,30 T100,10"
                    fill="none"
                    stroke="#9b87f5"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1 }}
                  />
                  <motion.path
                    d="M0,50 Q35,40 65,20 T100,30"
                    fill="none"
                    stroke="#F94E40"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1.5 }}
                  />
                </motion.svg>
              </div>
              
              {/* Decorative elements - keep in CSS */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-brandPurple/30 rounded-full blur-lg"></div>
              <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-brandPurple/20 rounded-full blur-xl"></div>
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
