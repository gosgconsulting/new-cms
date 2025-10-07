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
              
              {/* Content with SEO data background and profile image */}
              <div className="relative bg-deepBlue rounded-2xl p-8 transform -rotate-1 shadow-xl">
                <div className="aspect-[4/5] bg-gradient-to-br from-deepBlue to-blue-900 rounded-xl relative overflow-hidden">
                  {/* Background Graphs - Growth vs Stagnant */}
                  <div className="absolute inset-0 opacity-40">
                    <svg className="w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Your Agency - Stagnant Line (Red) */}
                      <motion.path
                        d="M50,350 L100,360 L150,355 L200,362 L250,358 L300,365 L350,360"
                        fill="none"
                        stroke="#F94E40"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, delay: 0.5 }}
                        viewport={{ once: true }}
                      />
                      
                      {/* GO SG - Growth Line (Teal) */}
                      <motion.path
                        d="M50,400 L100,360 L150,320 L200,270 L250,220 L300,160 L350,100"
                        fill="none"
                        stroke="#20B2AA"
                        strokeWidth="4"
                        strokeDasharray="8,4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2.5, delay: 1 }}
                        viewport={{ once: true }}
                      />
                      
                      {/* Data points for growth line */}
                      <motion.circle 
                        cx="100" cy="360" r="4" fill="rgba(32,178,170,0.8)"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 1.5 }}
                      />
                      <motion.circle 
                        cx="200" cy="270" r="4" fill="rgba(32,178,170,0.8)"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 2 }}
                      />
                      <motion.circle 
                        cx="300" cy="160" r="4" fill="rgba(32,178,170,0.8)"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 2.5 }}
                      />
                      
                      {/* Labels */}
                      <text x="320" y="370" fill="rgba(249,78,64,0.6)" fontSize="10" fontFamily="sans-serif" fontWeight="bold">YOUR AGENCY</text>
                      <text x="320" y="110" fill="rgba(32,178,170,0.8)" fontSize="10" fontFamily="sans-serif" fontWeight="bold">GO SG</text>
                      <text x="350" y="90" fill="rgba(32,178,170,0.8)" fontSize="16" fontFamily="sans-serif" fontWeight="bold">↑</text>
                      
                      {/* Growth percentage */}
                      <text x="20" y="40" fill="rgba(255,255,255,0.6)" fontSize="14" fontFamily="monospace">+382%</text>
                      <text x="20" y="460" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="monospace">90 Days</text>
                    </svg>
                  </div>
                  
                  
                  {/* Team Photos - 5 Members in Staggered Layout */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-48">
                      {/* Top row - 3 members */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
                        {/* Member 1 */}
                        <motion.div
                          className="w-20 h-20 rounded-full border-3 border-white/20 shadow-xl overflow-hidden bg-white"
                          initial={{ opacity: 0, y: -20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <img 
                            src={teamMember1}
                            alt="Team Member"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        
                        {/* Gregoire - Center (larger) */}
                        <motion.div
                          className="w-24 h-24 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-white z-10"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <img 
                            src={gregoireLiao}
                            alt="Gregoire Liao"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        
                        {/* Member 2 */}
                        <motion.div
                          className="w-20 h-20 rounded-full border-3 border-white/20 shadow-xl overflow-hidden bg-white"
                          initial={{ opacity: 0, y: -20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <img 
                            src={teamMember2}
                            alt="Team Member"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      </div>
                      
                      {/* Bottom row - 2 members */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-8">
                        {/* Member 3 */}
                        <motion.div
                          className="w-20 h-20 rounded-full border-3 border-white/20 shadow-xl overflow-hidden bg-white"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <img 
                            src={teamMember3}
                            alt="Team Member"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        
                        {/* Member 4 */}
                        <motion.div
                          className="w-20 h-20 rounded-full border-3 border-white/20 shadow-xl overflow-hidden bg-white"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1, duration: 0.5 }}
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
                  </div>
                  
                  {/* Team label */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-sm text-white font-medium">Our Team</p>
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