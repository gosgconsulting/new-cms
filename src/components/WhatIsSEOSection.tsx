import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import gregoireLiao from "@/assets/gregoire-liao.png";
import teamMember1 from "@/assets/team/member-1.png";
import teamMember2 from "@/assets/team/member-2.jpeg";
import teamMember3 from "@/assets/team/member-3.png";
import teamMember4 from "@/assets/team/member-4.png";

interface WhatIsSEOSectionProps {
  onContactClick?: () => void;
}

const WhatIsSEOSection = ({ onContactClick }: WhatIsSEOSectionProps) => {
  return (
    <section className="py-20 px-4 bg-coral/5">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-sm font-semibold text-coral mb-4 tracking-wide uppercase">
                OUR GUARANTEE
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Proven SEO Results In 90 Days With{" "}
                <span className="bg-gradient-to-r from-coral to-pink-400 bg-clip-text text-transparent">
                  Our Expert Partnership
                </span>
              </h2>
            </motion.div>

            <motion.div
              className="space-y-6 text-lg text-gray-700 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p>
                SEO takes time, which is why we recommend a minimum of three months to see meaningful results. 
                At GOSG, we use proven frameworks, real data, and expert insights to deliver sustainable growth 
                rather than short-term wins. With our focus on consistency and transparency, we build SEO 
                partnerships that drive lasting impact.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <Button 
                onClick={onContactClick}
                size="lg" 
                className="bg-coral hover:bg-coral/90 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                START YOUR SEO PARTNERSHIP
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Background geometric shapes */}
              <div className="absolute inset-0 bg-gradient-to-br from-coral to-pink-500 rounded-3xl transform rotate-3"></div>
              <div className="absolute top-8 right-8 w-24 h-24 bg-coral rounded-lg transform -rotate-12"></div>
              
              {/* Content with team photos - clean design */}
              <div className="relative bg-gradient-to-br from-deepBlue via-blue-900 to-deepBlue rounded-2xl p-8 transform -rotate-1 shadow-xl">
                <div className="aspect-[4/5] bg-gradient-to-br from-deepBlue/50 to-blue-900/50 rounded-xl relative overflow-hidden backdrop-blur-sm">
                  {/* Subtle decorative elements */}
                  <div className="absolute inset-0">
                    <div className="absolute top-10 right-10 w-32 h-32 bg-brandTeal/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-40 h-40 bg-brandPurple/10 rounded-full blur-3xl"></div>
                  </div>
                  
                  {/* Team Photos - Grid Layout */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full max-w-sm">
                      {/* Title */}
                      <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-2">Meet Our Team</h3>
                        <p className="text-sm text-white/70">SEO Experts Ready to Help</p>
                      </motion.div>
                      
                      {/* Team Grid - 2 rows */}
                      <div className="space-y-6">
                        {/* First Row - 3 members */}
                        <div className="flex items-center justify-center gap-4">
                          <motion.div
                            className="w-20 h-20 rounded-full border-3 border-white/30 shadow-lg overflow-hidden bg-white"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            viewport={{ once: true }}
                          >
                            <img 
                              src={teamMember1}
                              alt="Team Member"
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                          
                          <motion.div
                            className="w-24 h-24 rounded-full border-4 border-white/40 shadow-xl overflow-hidden bg-white"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            viewport={{ once: true }}
                          >
                            <img 
                              src={gregoireLiao}
                              alt="Gregoire Liao"
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                          
                          <motion.div
                            className="w-20 h-20 rounded-full border-3 border-white/30 shadow-lg overflow-hidden bg-white"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            viewport={{ once: true }}
                          >
                            <img 
                              src={teamMember2}
                              alt="Team Member"
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        </div>
                        
                        {/* Second Row - 2 members */}
                        <div className="flex items-center justify-center gap-12">
                          <motion.div
                            className="w-20 h-20 rounded-full border-3 border-white/30 shadow-lg overflow-hidden bg-white"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            viewport={{ once: true }}
                          >
                            <img 
                              src={teamMember3}
                              alt="Team Member"
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                          
                          <motion.div
                            className="w-20 h-20 rounded-full border-3 border-white/30 shadow-lg overflow-hidden bg-white"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            viewport={{ once: true }}
                          >
                            <img 
                              src={teamMember4}
                              alt="Team Member"
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Team Stats or Info */}
                      <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-brandTeal"></div>
                            <div className="w-6 h-6 rounded-full bg-brandPurple"></div>
                            <div className="w-6 h-6 rounded-full bg-coral"></div>
                          </div>
                          <span className="text-xs text-white font-medium">5+ Years Experience</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-brandTeal/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-20 h-20 bg-brandPurple/10 rounded-full blur-xl"></div>
    </section>
  );
};

export default WhatIsSEOSection;