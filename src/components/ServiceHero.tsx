
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

/**
 * WordPress Theme Component: Service Hero Section
 * 
 * Dynamic Component: Will be template-parts/services/hero.php
 * Dynamic Elements:
 * - Service title
 * - Service description
 * - Hero image
 * - CTA buttons
 * 
 * WordPress Implementation:
 * - Use the_title() and the_content() for service pages
 * - Use ACF fields for custom content and image
 */
interface ServiceHeroProps {
  title: string;
  description: string;
  image?: string;
}

const ServiceHero = ({ title, description, image }: ServiceHeroProps) => {
  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg -z-10"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* WordPress: Use the_title() or ACF field */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                {title}
                {/* WP: <?php the_title(); ?> */}
              </span>
            </h1>
            
            {/* WordPress: Use the_content() or ACF field */}
            <p className="text-xl text-muted-foreground">
              {description}
              {/* WP: 
              <?php 
              // Either use the excerpt or a custom field
              $description = get_field('service_short_description');
              echo $description ? $description : get_the_excerpt();
              ?>
              */}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* WordPress: Use get_permalink() or custom URLs from ACF */}
              <Button asChild variant="coral" size="lg" className="w-full sm:w-auto justify-center">
                <Link to="/contact" className="flex items-center justify-center">
                  Get a Quote
                  {/* WP: <?php echo get_field('cta_primary_text', 'option') ?: 'Get a Quote'; ?> */}
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-brandPurple text-brandPurple hover:bg-brandPurple/10 w-full sm:w-auto justify-center">
                <Link to="/contact" className="flex items-center justify-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book a Meeting
                  {/* WP: <?php echo get_field('cta_secondary_text', 'option') ?: 'Book a Meeting'; ?> */}
                </Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-video bg-secondary rounded-lg shadow-xl overflow-hidden">
              {/* WordPress: Use featured image or ACF field */}
              {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-brandPurple/20 rounded-full">
                      <svg className="w-10 h-10 text-brandPurple" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                  </div>
                </div>
              )}
              {/* WP:
              <?php if (has_post_thumbnail()) : ?>
                <?php the_post_thumbnail('large', array('class' => 'w-full h-full object-cover')); ?>
              <?php elseif (get_field('service_hero_image')) : ?>
                <?php 
                  $image = get_field('service_hero_image');
                  echo wp_get_attachment_image($image, 'large', false, array('class' => 'w-full h-full object-cover'));
                ?>
              <?php else : ?>
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-brandPurple/20 rounded-full">
                      <svg className="w-10 h-10 text-brandPurple" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold"><?php the_title(); ?></h3>
                  </div>
                </div>
              <?php endif; ?>
              */}
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-brandPurple/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-brandPurple/30 rounded-full blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServiceHero;
