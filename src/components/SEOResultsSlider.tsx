import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import result1 from "@/assets/results/result-1.png";
import result2 from "@/assets/results/result-2.png";
import result3 from "@/assets/results/result-3.png";
import result4 from "@/assets/results/result-4.png";
import result5 from "@/assets/results/result-5.png";
import result6 from "@/assets/results/result-6.png";
import result7 from "@/assets/results/result-7.png";
import result8 from "@/assets/results/result-8.png";

const results = [
  { img: result1 },
  { img: result2 },
  { img: result3 },
  { img: result4 },
  { img: result5 },
  { img: result6 },
  { img: result7 },
  { img: result8 },
];

const SEOResultsSlider = () => {
  // Create three columns for desktop, duplicate items for infinite scroll
  const column1 = [...results.slice(0, 3), ...results.slice(0, 3)];
  const column2 = [...results.slice(3, 6), ...results.slice(3, 6)];
  const column3 = [...results.slice(6, 8), ...results.slice(6, 8)];

  return (
    <div className="w-full overflow-hidden py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {/* Column 1 */}
        <motion.div
          className="flex flex-col gap-6"
          animate={{
            y: [0, -600],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {column1.map((result, index) => (
            <Card
              key={`col1-${index}`}
              className="overflow-hidden bg-card border-border shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[16/10]">
                <img
                  src={result.img}
                  alt="SEO Performance Results"
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Column 2 - Hidden on mobile */}
        <motion.div
          className="hidden md:flex flex-col gap-6"
          animate={{
            y: [0, -600],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
        >
          {column2.map((result, index) => (
            <Card
              key={`col2-${index}`}
              className="overflow-hidden bg-card border-border shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[16/10]">
                <img
                  src={result.img}
                  alt="SEO Performance Results"
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Column 3 - Hidden on mobile and tablet */}
        <motion.div
          className="hidden lg:flex flex-col gap-6"
          animate={{
            y: [0, -400],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear",
            delay: 4,
          }}
        >
          {column3.map((result, index) => (
            <Card
              key={`col3-${index}`}
              className="overflow-hidden bg-card border-border shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[16/10]">
                <img
                  src={result.img}
                  alt="SEO Performance Results"
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SEOResultsSlider;
