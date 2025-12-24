import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface SEOResultsSliderProps {
  items?: Array<{
    key: string;
    type: string;
    items?: Array<{
      key: string;
      type: string;
      src?: string;
      alt?: string;
      content?: string;
      level?: number;
      settings?: {
        layout?: string;
      };
    }>;
  }>;
}

/**
 * SEOResultsSlider Component
 * 
 * Renders a slider showcasing SEO results with content from the CMS
 */
const SEOResultsSlider = ({ items = [] }: SEOResultsSliderProps) => {
  // Process items to get image and caption pairs
  const processedResults = items.map(item => {
    const imageItem = item.items?.find(subItem => subItem.type === 'image');
    const captionItem = item.items?.find(subItem => subItem.key?.includes('Caption'));
    
    return {
      img: imageItem?.src || '',
      alt: imageItem?.alt || 'SEO Results',
      label: captionItem?.content || ''
    };
  });

  // Create three columns for desktop
  const column1 = processedResults.slice(0, 3);
  const column2 = processedResults.slice(3, 6);
  const column3 = processedResults.slice(6, 10);

  // Duplicate arrays for seamless infinite scroll
  const column1Doubled = [...column1, ...column1];
  const column2Doubled = [...column2, ...column2];
  const column3Doubled = [...column3, ...column3];

  return (
    <div className="w-full overflow-hidden py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto px-4 max-h-[800px]">
        {/* Column 1 */}
        <motion.div
          className="flex flex-col gap-4"
          animate={{
            y: [0, -1200],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        >
          {column1Doubled.map((result, index) => (
            <Card
              key={`col1-${index}`}
              className="overflow-hidden bg-gradient-to-br from-brandPurple/20 to-brandTeal/20 backdrop-blur-sm border-brandPurple/30 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="p-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-background/50 shadow-inner">
                  <img
                    src={result.img}
                    alt={result.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-brandPurple to-brandTeal text-white text-xs font-bold shadow-md">
                    {result.label}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Column 2 - Hidden on mobile */}
        <motion.div
          className="hidden md:flex flex-col gap-4"
          animate={{
            y: [0, -1200],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
            repeatType: "loop",
          }}
        >
          {column2Doubled.map((result, index) => (
            <Card
              key={`col2-${index}`}
              className="overflow-hidden bg-gradient-to-br from-brandPurple/20 to-brandTeal/20 backdrop-blur-sm border-brandPurple/30 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="p-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-background/50 shadow-inner">
                  <img
                    src={result.img}
                    alt={result.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-brandPurple to-brandTeal text-white text-xs font-bold shadow-md">
                    {result.label}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Column 3 - Hidden on mobile and tablet */}
        <motion.div
          className="hidden lg:flex flex-col gap-4"
          animate={{
            y: [0, -800],
          }}
          transition={{
            duration: 44,
            repeat: Infinity,
            ease: "linear",
            delay: 4,
            repeatType: "loop",
          }}
        >
          {column3Doubled.map((result, index) => (
            <Card
              key={`col3-${index}`}
              className="overflow-hidden bg-gradient-to-br from-brandPurple/20 to-brandTeal/20 backdrop-blur-sm border-brandPurple/30 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="p-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-background/50 shadow-inner">
                  <img
                    src={result.img}
                    alt={result.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-brandPurple to-brandTeal text-white text-xs font-bold shadow-md">
                    {result.label}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SEOResultsSlider;