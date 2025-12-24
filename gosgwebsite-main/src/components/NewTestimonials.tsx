import { motion } from "framer-motion";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

interface NewTestimonialsProps {
  items: Array<{
    key: string;
    type: string;
    content?: string;
    level?: number;
    items?: Array<{
      key: string;
      type: string;
      items?: Array<{
        key: string;
        type: string;
        content?: string;
        level?: number;
        src?: string;
        alt?: string;
      }>;
    }>;
  }>;
}

/**
 * NewTestimonials Component
 * 
 * Renders a section showcasing testimonials with content from the CMS
 */
const NewTestimonials = ({ items = [] }: NewTestimonialsProps) => {
  // Find items by key
  const title = items.find(item => item.key === 'title');
  const subtitle = items.find(item => item.key === 'subtitle');
  const testimonialsArray = items.find(item => item.key === 'testimonials');
  
  // Get testimonials from the array
  const testimonialItems = testimonialsArray?.items || [];
  
  // Process testimonial items to extract image, text, name, and role
  const processedTestimonials = testimonialItems.map(testimonial => {
    const testimonialItems = testimonial.items || [];
    const imageItem = testimonialItems.find(item => item.type === 'image');
    const textItem = testimonialItems.find(item => item.key?.includes('text'));
    const nameItem = testimonialItems.find(item => item.key?.includes('name'));
    const roleItem = testimonialItems.find(item => item.key?.includes('role'));
    
    return {
      text: textItem?.content || '',
      image: imageItem?.src || '',
      name: nameItem?.content || '',
      role: roleItem?.content || '',
    };
  });
  
  // Create three columns for desktop display
  const firstColumn = processedTestimonials.slice(0, 3);
  const secondColumn = processedTestimonials.slice(3, 6);
  const thirdColumn = processedTestimonials.slice(6, 9);
  
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title.content}
            </h2>
          )}
          
          {subtitle && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {subtitle.content}
            </p>
          )}
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default NewTestimonials;