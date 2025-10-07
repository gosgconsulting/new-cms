import { motion } from "framer-motion";
import { useState } from "react";
import SEOResultsSlider from "./SEOResultsSlider";
import ContactModal from "./ContactModal";
import { Button } from "@/components/ui/button";

const SEOResultsSection = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Real <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">SEO Results</span>
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
        >
          <SEOResultsSlider />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Button
            onClick={() => setIsContactModalOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-brandPurple to-brandTeal hover:opacity-90 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Become Our Next Case Study
          </Button>
        </motion.div>
      </div>

      <ContactModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
      />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default SEOResultsSection;