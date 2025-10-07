import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, MousePointerClick, X } from "lucide-react";

const PainPointSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandPurple/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brandTeal/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Animated Icon */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center"
          >
            {/* Main Circle/Globe */}
            <motion.div
              className="relative w-80 h-80 md:w-96 md:h-96"
            >
              {/* Outer ring with gradient */}
              <div className="absolute inset-0 rounded-full border-2 border-white/20 bg-gradient-to-br from-slate-800/50 via-blue-900/30 to-purple-900/50 backdrop-blur-sm"></div>
              <div className="absolute inset-8 rounded-full border border-white/10"></div>
              
              {/* Dotted background effect */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/30 rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.1, 0.4, 0.1],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Floating text elements */}
              <motion.div
                className="absolute top-8 right-12 text-white/50 text-base font-light tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  y: [-3, 3, -3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                stagnant
              </motion.div>
              
              <motion.div
                className="absolute top-1/2 right-4 text-white/50 text-base font-light tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  y: [3, -3, 3]
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                no traffic
              </motion.div>
              
              <motion.div
                className="absolute bottom-16 left-8 text-white/50 text-base font-light tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  y: [-2, 4, -2]
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                low traffic
              </motion.div>

              {/* Center red arrow - stagnant graph visualization */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Red zigzag arrow path */}
                  <svg width="120" height="120" viewBox="0 0 120 120" className="text-red-400">
                    <motion.path
                      d="M 30 90 L 45 70 L 40 60 L 55 45 L 50 40 L 75 20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.path
                      d="M 75 20 L 65 30 M 75 20 L 85 25"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                    />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
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
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/70 text-sm border border-white/20">
                You have a website but it's not generating clicks?
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              You Invest... But{" "}
              <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                Nothing Happens?
              </span>
            </motion.h2>

            {/* Pain Points List */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {/* Pain Point 1 */}
              <motion.div
                className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all duration-300"
                whileHover={{ x: 5 }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-white text-lg">
                  Organic traffic stuck at 0
                </span>
              </motion.div>

              {/* Pain Point 2 */}
              <motion.div
                className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all duration-300"
                whileHover={{ x: 5 }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <MousePointerClick className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-white text-lg">
                  No clicks, no leads, no sales
                </span>
              </motion.div>

              {/* Pain Point 3 */}
              <motion.div
                className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all duration-300"
                whileHover={{ x: 5 }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-white text-lg">
                  Competitors ranking above you
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PainPointSection;
