import { motion } from "framer-motion";
import SEOResultsSlider from "./SEOResultsSlider";

const SEOResultsSection = () => {
  return (
    <section id="next-section" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Proven <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how we've helped businesses like yours achieve remarkable growth through strategic SEO implementation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="aspect-[16/10] w-full">
            <SEOResultsSlider />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SEOResultsSection;