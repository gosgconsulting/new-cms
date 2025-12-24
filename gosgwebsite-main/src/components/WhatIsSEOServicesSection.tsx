import { motion } from "framer-motion";
import { Search, FileText, Code, BarChart3, Link2, Users, TrendingUp, Target } from "lucide-react";
import { handleButtonLink } from "@/utils/buttonLinkHandler";
import { usePopup } from "@/contexts/PopupContext";

interface WhatIsSEOServicesSectionProps {
  items: Array<{
    key: string;
    type: string;
    content?: string;
    level?: number;
    link?: string;
    items?: Array<{
      key: string;
      type: string;
      items?: Array<{
        key: string;
        type: string;
        content?: string;
        level?: number;
        icon?: string;
      }>;
    }>;
  }>;
  onContactClick?: () => void;
  onPopupOpen?: (popupName: string) => void;
}

/**
 * WhatIsSEOServicesSection Component
 * 
 * Renders a section explaining SEO services with content from the CMS
 */
const WhatIsSEOServicesSection = ({ items = [], onContactClick, onPopupOpen }: WhatIsSEOServicesSectionProps) => {
  const { openPopup } = usePopup();
  // Find items by key
  const title = items.find(item => item.key === 'title');
  const description = items.find(item => item.key === 'description');
  const servicesArray = items.find(item => item.key === 'services');
  const ctaText = items.find(item => item.key === 'ctaText');
  const ctaButton = items.find(item => item.key === 'ctaButton');
  
  // Get services from the array
  const services = servicesArray?.items || [];
  
  // Function to get the appropriate icon component
  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'search':
        return <Search className="w-7 h-7 text-brandPurple" />;
      case 'fileText':
        return <FileText className="w-7 h-7 text-brandPurple" />;
      case 'code':
        return <Code className="w-7 h-7 text-brandPurple" />;
      case 'barChart3':
        return <BarChart3 className="w-7 h-7 text-brandPurple" />;
      case 'link2':
        return <Link2 className="w-7 h-7 text-brandPurple" />;
      case 'users':
        return <Users className="w-7 h-7 text-brandPurple" />;
      case 'trendingUp':
        return <TrendingUp className="w-7 h-7 text-brandPurple" />;
      case 'target':
        return <Target className="w-7 h-7 text-brandPurple" />;
      default:
        return <Search className="w-7 h-7 text-brandPurple" />;
    }
  };

  // Process service items to extract title and description
  const processedServices = services.map(service => {
    const serviceItems = service.items || [];
    const titleItem = serviceItems.find(item => item.key?.includes('title'));
    const descriptionItem = serviceItems.find(item => item.key?.includes('description'));
    
    return {
      icon: titleItem?.icon,
      title: titleItem?.content || '',
      description: descriptionItem?.content || ''
    };
  });
  
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {title && (
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {title.content && title.content.split(' ').map((word, i) => 
                word.toLowerCase() === 'seo' || word.toLowerCase() === 'seo?' ? (
                  <span key={i} className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                    {word}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h2>
          )}
          
          {description && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {description.content}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processedServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-brandPurple/30 hover:-translate-y-1">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-brandPurple/10 to-brandTeal/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {getIconComponent(service.icon)}
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          {ctaText && (
            <p className="text-lg text-gray-700 mb-6">
              {ctaText.content}
            </p>
          )}
          
          {ctaButton && (
            <div 
              onClick={() => {
                if (ctaButton.link) {
                  handleButtonLink(ctaButton.link, onPopupOpen || openPopup);
                } else if (onContactClick) {
                  onContactClick(); // Fallback for backward compatibility
                }
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brandPurple to-brandTeal rounded-lg text-white font-medium hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {ctaButton.content}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default WhatIsSEOServicesSection;