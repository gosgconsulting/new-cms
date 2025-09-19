import { motion } from "framer-motion";

const WhatIsSEOSection = () => {
  return (
    <section className="py-20 px-4 bg-white">
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
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
                WELCOME TO{" "}
                <span className="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">
                  GOSG
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
                We're glad you're here. At GOSG, we live and breathe SEO - helping businesses 
                get found online, attract the right audience, and turn clicks into customers.
              </p>
              
              <p>
                Think of us as your growth partners: whether it's climbing to page one, boosting 
                traffic, or turning insights into results, our job is to make your brand shine where 
                it matters most: on Google.
              </p>
              
              <p>
                Let us show you how our proven SEO strategies can help your business grow smarter, 
                faster, and stronger.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <p className="text-xl font-semibold text-gray-900">
                - GREGOIRE LIAO
              </p>
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
                  {/* SEO Data Background */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Data visualization lines */}
                      <path d="M50,400 Q150,350 250,300 T350,200" fill="none" stroke="rgba(32,178,170,0.3)" strokeWidth="3"/>
                      <path d="M50,450 Q150,400 250,350 T350,250" fill="none" stroke="rgba(249,78,64,0.3)" strokeWidth="3"/>
                      <path d="M50,380 Q150,320 250,280 T350,180" fill="none" stroke="rgba(155,135,245,0.3)" strokeWidth="3"/>
                      
                      {/* Data points */}
                      <circle cx="100" cy="380" r="3" fill="rgba(32,178,170,0.4)"/>
                      <circle cx="200" cy="320" r="3" fill="rgba(32,178,170,0.4)"/>
                      <circle cx="300" cy="220" r="3" fill="rgba(32,178,170,0.4)"/>
                      
                      {/* Bar chart elements */}
                      <rect x="60" y="350" width="8" height="50" fill="rgba(249,78,64,0.2)"/>
                      <rect x="80" y="320" width="8" height="80" fill="rgba(249,78,64,0.3)"/>
                      <rect x="100" y="300" width="8" height="100" fill="rgba(249,78,64,0.2)"/>
                      
                      {/* Numbers/labels */}
                      <text x="320" y="40" fill="rgba(255,255,255,0.2)" fontSize="12" fontFamily="monospace">+382%</text>
                      <text x="50" y="40" fill="rgba(255,255,255,0.2)" fontSize="12" fontFamily="monospace">SEO</text>
                      <text x="300" y="460" fill="rgba(255,255,255,0.2)" fontSize="12" fontFamily="monospace">Traffic</text>
                    </svg>
                  </div>
                  
                  {/* Profile Image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-white">
                      <img 
                        src="/assets/gregoire-liao.png"
                        alt="Gregoire Liao - SEO Expert"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Name label */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-sm text-white font-medium">Gregoire Liao</p>
                    <p className="text-xs text-gray-300">SEO Expert</p>
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