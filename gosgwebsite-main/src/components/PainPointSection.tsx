import { motion } from "framer-motion";
import { TrendingDown, BarChart3, MousePointerClick, X } from "lucide-react";

interface PainPointSectionProps {
  items: Array<{
    key: string;
    type: string;
    content?: string;
    level?: number;
    icon?: string;
    src?: string;
    alt?: string;
    items?: Array<{
      key: string;
      type: string;
      icon?: string;
      content?: string;
      src?: string;
      alt?: string;
    }>;
  }>;
}

/**
 * PainPointSection Component
 * 
 * Renders a section highlighting pain points with content from the CMS
 */
const PainPointSection = ({ items = [] }: PainPointSectionProps) => {
  // Find items by key
  const badge = items.find(item => item.key === 'badge');
  const title = items.find(item => item.key === 'title');
  const painPointsArray = items.find(item => item.key === 'painPoints');
  const imageItem = items.find(item => item.type === 'image' || item.key === 'image');
  
  // Get pain points from the array
  const painPoints = painPointsArray?.items || [];
  
  // Function to get the appropriate icon component
  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'x':
        return <X className="w-5 h-5 text-red-400" />;
      case 'mousePointerClick':
        return <MousePointerClick className="w-5 h-5 text-red-400" />;
      case 'barChart3':
        return <BarChart3 className="w-5 h-5 text-red-400" />;
      default:
        return <X className="w-5 h-5 text-red-400" />;
    }
  };
  
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandPurple/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brandTeal/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center"
          >
            {imageItem && imageItem.src ? (
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                <img
                  src={
                    imageItem.src.startsWith('http://') || imageItem.src.startsWith('https://') || imageItem.src.startsWith('/')
                      ? imageItem.src
                      : `/${imageItem.src}`
                  }
                  alt={imageItem.alt || 'Pain point illustration'}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              // Fallback to animation if no image is provided
              <motion.div
                className="relative w-80 h-80 md:w-96 md:h-96"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                {/* Outer ring with dots pattern */}
                <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                <div className="absolute inset-4 rounded-full border border-white/5"></div>
                
                {/* Dotted globe effect */}
                <div className="absolute inset-0 opacity-30">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0.2, 0.6, 0.2],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                {/* Floating text elements */}
                <motion.div
                  className="absolute top-1/4 left-0 text-white/60 text-lg font-light"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  low traffic
                </motion.div>
                
                <motion.div
                  className="absolute top-1/2 right-0 text-white/60 text-lg font-light"
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  stagnant
                </motion.div>
                
                <motion.div
                  className="absolute bottom-1/4 left-1/4 text-white/60 text-lg font-light"
                  animate={{ y: [-5, 15, -5] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  no traffic
                </motion.div>

                {/* Center declining graph icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingDown className="w-24 h-24 text-red-400/80" strokeWidth={1.5} />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Subtitle badge */}
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/70 text-sm border border-white/20">
                  {badge.content}
                </span>
              </motion.div>
            )}

            {/* Main Heading */}
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                {title.content && (
                  <>
                    {title.content.split('?')[0]}
                    {title.content.includes('?') && (
                      <>
                        {" "}
                        <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                          {title.content.split('?')[1]}?
                        </span>
                      </>
                    )}
                  </>
                )}
              </motion.h2>
            )}

            {/* Pain Points List */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {painPoints.map((point, index) => (
                <motion.div
                  key={point.key || index}
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all duration-300"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    {getIconComponent(point.icon)}
                  </div>
                  <span className="text-white text-lg">
                    {point.content}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PainPointSection;