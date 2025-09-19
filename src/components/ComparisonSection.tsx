import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const ComparisonSection = () => {
  return (
    <section className="relative py-20 px-4 bg-deepBlue text-white overflow-hidden">
      {/* Background Graphs */}
      <div className="absolute inset-0 opacity-30">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
          {/* Your Agency - Stagnant Line */}
          <motion.path
            d="M200,400 L400,420 L600,410 L800,425 L1000,415 L1200,420"
            fill="none"
            stroke="#F94E40"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            viewport={{ once: true }}
          />
          
          {/* GO SG - Growth Line */}
          <motion.path
            d="M200,500 L400,450 L600,380 L800,320 L1000,250 L1200,180"
            fill="none"
            stroke="#20B2AA"
            strokeWidth="8"
            strokeDasharray="20,10"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, delay: 1 }}
            viewport={{ once: true }}
          />
        </svg>
        
        {/* Graph Labels */}
        <motion.div
          className="absolute bottom-32 right-20 text-right"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 2 }}
          viewport={{ once: true }}
        >
          <div className="text-2xl font-bold text-coral mb-2">YOUR AGENCY</div>
        </motion.div>
        
        <motion.div
          className="absolute top-20 right-32 text-right"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 2.5 }}
          viewport={{ once: true }}
        >
          <div className="text-2xl font-bold text-white mb-2">GO SG</div>
        </motion.div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-sm font-semibold text-coral mb-4 tracking-wide uppercase">
              OUR GUARANTEE
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center leading-tight mb-6">
              Proven SEO Results In 90 Days With{" "}
              <span className="bg-gradient-to-r from-coral to-pink-400 bg-clip-text text-transparent">
                Our Expert Partnership
              </span>
            </h2>
            
            <p className="text-xl text-white/90 text-center max-w-3xl mx-auto mb-12">
              SEO takes time, which is why we recommend a minimum of three months to see meaningful results. 
              At GOSG, we use proven frameworks, real data, and expert insights to deliver sustainable growth 
              rather than short-term wins. With our focus on consistency and transparency, we build SEO 
              partnerships that drive lasting impact.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Button 
                size="lg" 
                className="bg-coral hover:bg-coral/90 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                START YOUR SEO PARTNERSHIP
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-coral/10 blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-white/5 blur-3xl"></div>
    </section>
  );
};

export default ComparisonSection;