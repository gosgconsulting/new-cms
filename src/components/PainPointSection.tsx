import { motion } from "framer-motion";
import { TrendingDown, BarChart3, MousePointerClick, X } from "lucide-react";

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
                0 clicks
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
