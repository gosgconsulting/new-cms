import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-deepBlue">
      {/* Background elements matching hero section */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brandPurple/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-coral/20 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_0%,#00213D_50%,#9b87f5)] opacity-30"></div>
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center space-y-8"
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Transform Your Digital Presence?
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Let's create a marketing strategy that drives real results for your business.
          </p>
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              className="group relative flex w-fit items-center gap-1.5 rounded-full bg-deepBlue/10 px-8 py-6 text-lg text-gray-50 transition-colors hover:bg-deepBlue/50 border border-brandPurple shadow-[0px_4px_24px_#9b87f5]"
              asChild
            >
              <a href="/contact">
                Get Started Today
                <ArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;