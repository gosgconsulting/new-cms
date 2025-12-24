
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

/**
 * WordPress Theme Component: Why Choose Us Section
 * 
 * Dynamic Component: Will be template-parts/home/why-choose-us.php
 * Dynamic Elements:
 * - Section title and subtitle
 * - List of reasons (title, description)
 * - CTA button text and URL
 * 
 * WordPress Implementation:
 * - Use ACF fields or theme customizer for title and subtitle
 * - Use ACF repeater field for reasons list
 * - Animation effects will be simplified to CSS classes
 */
interface WhyChooseUsSectionProps {
  onContactClick?: () => void;
}

const WhyChooseUsSection = ({ onContactClick }: WhyChooseUsSectionProps) => {
  // In WordPress, this data will come from ACF repeater field
  const reasons = [
    {
      title: "Expert Team",
      description: "Our professionals have years of experience in digital marketing and web development."
    },
    {
      title: "Custom Strategies",
      description: "We create tailored solutions specific to your business needs and goals."
    },
    {
      title: "Data-Driven Approach",
      description: "All our decisions are backed by analytics and performance metrics."
    },
    {
      title: "Transparent Reporting",
      description: "Regular updates and clear reports on campaign performance and ROI."
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* WordPress: Replace with ACF fields */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
              Why Choose Us
              {/* WP: <?php echo get_field('why_choose_title'); ?> */}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We're committed to your success with proven strategies that deliver real results.
            {/* WP: <?php echo get_field('why_choose_subtitle'); ?> */}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {/* WordPress: Replace with ACF repeater field loop - COMMENTED OUT FOR REACT BUILD */}
          {/* 
          WordPress Loop Code:
          <?php if (have_rows('reasons')): ?>
            <?php $index = 0; while(have_rows('reasons')): the_row(); $index++; ?>
              <div class="why-choose-item flex gap-6" data-delay="<?php echo $index * 0.1; ?>">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-12 h-12 rounded-full bg-brandPurple/10 flex items-center justify-center">
                    <i class="text-brandPurple h-6 w-6 icon-check-circle"></i>
                  </div>
                </div>
                <div class="space-y-3">
                  <h3 class="text-xl font-semibold"><?php echo get_sub_field('title'); ?></h3>
                  <p class="text-muted-foreground"><?php echo get_sub_field('description'); ?></p>
                </div>
              </div>
            <?php endwhile; ?>
          <?php endif; ?>
          */}
          
          {/* React implementation - will be replaced by the WordPress loop above */}
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-brandPurple/10 flex items-center justify-center">
                  <CheckCircle className="text-brandPurple h-6 w-6" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{reason.title}</h3>
                <p className="text-muted-foreground">{reason.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* WordPress: CTA button with ACF fields */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Button 
            onClick={onContactClick}
            className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
          >
            Learn More
            {/* WP: <?php echo get_field('why_choose_cta_text') ?: 'Learn More'; ?> */}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
