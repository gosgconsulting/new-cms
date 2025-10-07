import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VisualCMSEditor from "@/components/cms/VisualCMSEditor";

// Import client logos
import artInBloom from "@/assets/logos/art-in-bloom.png";
import selenightco from "@/assets/logos/selenightco.png";
import smooy from "@/assets/logos/smooy.png";
import solstice from "@/assets/logos/solstice.png";
import grub from "@/assets/logos/grub.png";
import nailQueen from "@/assets/logos/nail-queen.png";
import caroPatisserie from "@/assets/logos/caro-patisserie.png";
import spiritStretch from "@/assets/logos/spirit-stretch.png";

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
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
        {/* Diagonal gradient accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brandPurple/20 to-transparent blur-3xl rotate-45 -z-10"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-tl from-brandTeal/15 to-transparent blur-3xl -rotate-45 -z-10"></div>
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-gradient-to-br from-coral/10 to-transparent blur-3xl rotate-12 -z-10"></div>
        
        {/* Content */}
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-secondary/80 backdrop-blur-sm border border-border hover:bg-secondary px-6 py-3 text-sm">
                <Clock className="mr-2 h-4 w-4 text-brandTeal" />
                <span className="text-foreground">
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
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
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
              className="text-xl text-muted-foreground max-w-2xl"
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
              <Button asChild size="lg" variant="coral" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                <Link to="/contact" className="flex items-center">
                  Get a Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                  {/* WP: <?php echo get_field('hero_cta_text', 'option') ?: 'Get a Quote'; ?> */}
                </Link>
              </Button>
            </motion.div>
            
            {/* Logo Animation Strip */}
            <motion.div
              className="w-full mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="relative overflow-hidden">
                <motion.div
                  className="flex gap-16 items-center"
                  animate={{
                    x: [0, -1500],
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 30,
                      ease: "linear",
                    },
                  }}
                >
                  {/* Duplicate logo sets for seamless loop */}
                  {[...Array(3)].map((_, setIndex) => (
                    <div key={setIndex} className="flex gap-16 items-center">
                      <img src={artInBloom} alt="Art in Bloom" className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                      <img src={selenightco} alt="Selenightco" className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                      <img src={smooy} alt="Smooy" className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                      <img src={solstice} alt="Solstice" className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                      <img src={grub} alt="Grub" className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                      <img src={nailQueen} alt="Nail Queen" className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                      <img src={caroPatisserie} alt="Caro Pâtisserie" className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                      <img src={spiritStretch} alt="Spirit Stretch" className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                      {/* WP: <?php 
                        $logos = get_field('client_logos', 'option');
                        if ($logos) {
                          foreach ($logos as $logo) {
                            echo '<img src="' . esc_url($logo['url']) . '" alt="' . esc_attr($logo['alt']) . '" class="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />';
                          }
                        }
                      ?> */}
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Next Section Target */}
      <div id="next-section"></div>
      
      {/* CMS Editor - Only visible to admin users */}
      <VisualCMSEditor pageId="homepage" />
    </>
  );
};

export default HeroSection;
