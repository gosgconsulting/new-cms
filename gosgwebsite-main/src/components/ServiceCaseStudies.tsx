
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * WordPress Theme Component: Service Case Studies
 * 
 * Dynamic Component: Will be template-parts/services/case-studies.php
 * Dynamic Elements:
 * - Section title and subtitle
 * - Case study items (title, description, result, image, link)
 * 
 * WordPress Implementation:
 * - Use ACF fields for section title and subtitle
 * - Use custom post type for case studies or ACF repeater field
 * - Images will use wp_get_attachment_image
 */
interface CaseStudy {
  title: string;
  description: string;
  result: string;
  image?: string;
  link: string;
}

interface ServiceCaseStudiesProps {
  title: string;
  subtitle: string;
  caseStudies: CaseStudy[];
}

const ServiceCaseStudies = ({ title, subtitle, caseStudies }: ServiceCaseStudiesProps) => {
  return (
    <section className="py-24 px-4">
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
            <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">{title}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
          {/* WP: 
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent"><?php echo get_field('case_studies_title'); ?></span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            <?php echo get_field('case_studies_subtitle'); ?>
          </p>
          */}
        </motion.div>
        
        <div className="space-y-16">
          {/* WordPress: Replace with custom case studies loop - COMMENTED OUT FOR REACT BUILD */}
          {/* 
          WordPress Loop Code:
          <?php
          $args = array(
              'post_type' => 'case-study',
              'posts_per_page' => 3,
          );
          $case_studies = new WP_Query($args);
          $index = 0;
          
          if ($case_studies->have_posts()) :
              while ($case_studies->have_posts()) : $case_studies->the_post();
                  $index++;
                  $even = $index % 2 === 0;
                  $image = get_the_post_thumbnail_url(get_the_ID(), 'large');
                  $result = get_field('result');
          ?>
              <div class="case-study-item flex flex-col <?php echo $even ? 'lg:flex-row-reverse' : 'lg:flex-row'; ?> gap-12 items-center">
                  <div class="lg:w-1/2">
                      <div class="aspect-video bg-muted rounded-lg overflow-hidden">
                          <?php if ($image) : ?>
                              <img src="<?php echo esc_url($image); ?>" alt="<?php the_title(); ?>" class="w-full h-full object-cover">
                          <?php else : ?>
                              <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brandPurple/10 to-brandTeal/10">
                                  <span class="text-xl font-medium text-muted-foreground">Case Study Image</span>
                              </div>
                          <?php endif; ?>
                      </div>
                  </div>
                  
                  <div class="lg:w-1/2 space-y-4">
                      <h3 class="text-2xl font-bold"><?php the_title(); ?></h3>
                      <p class="text-muted-foreground"><?php echo get_the_excerpt(); ?></p>
                      <div class="bg-muted/50 p-4 rounded-lg">
                          <p class="font-medium">Result: <span class="text-brandPurple"><?php echo esc_html($result); ?></span></p>
                      </div>
                      <a href="<?php echo get_permalink(); ?>" class="btn btn-branded">
                          Get Contacted
                          <span class="ml-2"><i class="icon-arrow-right"></i></span>
                      </a>
                  </div>
              </div>
          <?php
              endwhile;
              wp_reset_postdata();
          endif;
          ?>
          */}
          
          {/* React implementation - will be replaced by WordPress loop above */}
          {caseStudies.map((caseStudy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 items-center`}
            >
              <div className="lg:w-1/2">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {caseStudy.image ? (
                    <img 
                      src={caseStudy.image} 
                      alt={caseStudy.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brandPurple/10 to-brandTeal/10">
                      <span className="text-xl font-medium text-muted-foreground">Case Study Image</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:w-1/2 space-y-4">
                <h3 className="text-2xl font-bold">{caseStudy.title}</h3>
                <p className="text-muted-foreground">{caseStudy.description}</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium">Result: <span className="text-brandPurple">{caseStudy.result}</span></p>
                </div>
                <Button asChild variant="branded" className="hover:bg-brandPurple/90">
                  <Link to="/contact" className="flex items-center">
                    Get Contacted
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCaseStudies;
