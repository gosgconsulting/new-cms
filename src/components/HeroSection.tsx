import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
interface HeroSectionProps {
  onContactClick?: () => void;
}

const HeroSection = ({ onContactClick }: HeroSectionProps) => {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 md:pt-24 overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
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
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-brandPurple/20 text-brandPurple bg-brandPurple/5">
                <Clock className="w-4 h-4 mr-2" />
                Get Results in 3 Months
                {/* WP: <?php echo get_field('hero_badge_text', 'option') ?: 'Get Results in 3 Months'; ?> */}
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-brandPurple via-brandTeal to-coral bg-clip-text text-transparent">
                  Rank #1 on Google
                </span>
                <br />
                <span className="text-foreground">In 3 Months</span>
                {/* WP: <?php echo get_field('hero_headline', 'option') ?: 'Rank #1 on Google<br>In 3 Months'; ?> */}
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website.
              {/* WP: <?php echo get_field('hero_description', 'option') ?: 'We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website.'; ?> */}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button 
                onClick={onContactClick}
                size="lg" 
                variant="coral" 
                className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <span className="flex items-center">
                  Get a Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
                {/* WP: <?php echo get_field('hero_cta_text', 'option') ?: 'Get a Quote'; ?> */}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Next Section Target */}
      <div id="next-section"></div>
    </>
  );
};

export default HeroSection;
