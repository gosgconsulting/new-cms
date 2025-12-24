import { motion } from "framer-motion";
import SEOResultsSlider from "./SEOResultsSlider";
import ContactModal from "./ContactModal";
import { Button } from "@/components/ui/button";
import { handleButtonLink } from "@/utils/buttonLinkHandler";
import { usePopup } from "@/contexts/PopupContext";

interface SEOResultsSectionProps {
  items: Array<{
    key: string;
    type: string;
    content?: string;
    level?: number;
    link?: string;
    items?: Array<any>;
  }>;
  onPopupOpen?: (popupName: string) => void;
}

/**
 * SEOResultsSection Component
 * 
 * Renders a section showcasing SEO results with content from the CMS
 */
const SEOResultsSection = ({ items = [], onPopupOpen }: SEOResultsSectionProps) => {
  const { openPopup, contactModalOpen, setContactModalOpen } = usePopup();

  // Find items by key
  const title = items.find(item => item.key === 'title');
  const subtitle = items.find(item => item.key === 'subtitle');
  const button = items.find(item => item.key === 'button');
  const resultSlider = items.find(item => item.key === 'Result Slider');

  // Get slider items
  const sliderItems = resultSlider?.items || [];

  return (
    <section id="next-section" className="py-12 px-4 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
      {/* Gradient overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {title && (
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {title.content && title.content.split(' ').map((word, i, arr) => 
                i === arr.length - 1 ? (
                  <span key={i} className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                    {word}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h2>
          )}
          
          {subtitle && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {subtitle.content}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <SEOResultsSlider items={sliderItems} />
        </motion.div>

        {button && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Button
              onClick={() => {
                if (button.link) {
                  handleButtonLink(button.link, onPopupOpen || openPopup);
                } else {
                  setContactModalOpen(true); // Fallback for backward compatibility
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-medium px-8 py-6 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {button.content}
            </Button>
          </motion.div>
        )}
      </div>

      <ContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
      />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default SEOResultsSection;