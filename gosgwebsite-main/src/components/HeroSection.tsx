import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { handleButtonLink } from "@/utils/buttonLinkHandler";
import { usePopup } from "@/contexts/PopupContext";

/**
 * HeroSection Component
 * 
 * Renders a hero section with content from the CMS
 */
interface HeroSectionProps {
  items: Array<{
    key: string;
    type: string;
    content?: string;
    level?: number;
    icon?: string;
    link?: string;
  }>;
  onContactClick?: () => void;
  onPopupOpen?: (popupName: string) => void;
}

const HeroSection = ({ items = [], onContactClick, onPopupOpen }: HeroSectionProps) => {
  const { openPopup } = usePopup();
  // Debug the items being passed to the component
  console.log('[testing] HeroSection items:', items);
  
  // Find items by key
  const badge = items.find(item => item.key === 'badge');
  const highlight = items.find(item => item.key === 'highlight');
  const subtitle = items.find(item => item.key === 'subtitle');
  const title = items.find(item => item.key === 'title'); // Keep for backward compatibility
  const description = items.find(item => item.key === 'description');
  const button = items.find(item => item.key === 'button');
  
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
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-brandPurple/20 text-brandPurple bg-brandPurple/5">
                  {badge.icon === 'clock' && <Clock className="w-4 h-4 mr-2" />}
                  {badge.content}
                </Badge>
              </motion.div>
            )}

            {/* Main Headline */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                {/* If highlight exists, use it with gradient, otherwise fall back to title */}
                {highlight && (
                  <span className="bg-gradient-to-r from-brandPurple via-brandTeal to-coral bg-clip-text text-transparent">
                    {highlight.content}
                  </span>
                )}
                {!highlight && title && (
                  <span className="bg-gradient-to-r from-brandPurple via-brandTeal to-coral bg-clip-text text-transparent">
                    {title.content}
                  </span>
                )}
                {/* Add subtitle on a new line if it exists */}
                {subtitle && (
                  <div className="block mt-2 text-foreground">
                    {subtitle.content}
                  </div>
                )}
              </h1>
            </motion.div>

            {/* Description */}
            {description && (
              <motion.p
                className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {description.content}
              </motion.p>
            )}

            {/* CTA Button */}
            {button && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button 
                  onClick={() => {
                    if (button.link) {
                      handleButtonLink(button.link, onPopupOpen || openPopup);
                    } else if (onContactClick) {
                      onContactClick(); // Fallback for backward compatibility
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-medium px-8 py-6 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <span className="flex items-center">
                    {button.content}
                    {button.icon === 'arrowRight' && <ArrowRight className="ml-2 h-5 w-5" />}
                  </span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Next Section Target */}
      <div id="next-section"></div>
    </>
  );
};

export default HeroSection;