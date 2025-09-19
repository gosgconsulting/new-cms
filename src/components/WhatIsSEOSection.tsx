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
                This presentation will give you a quick tour of who we are, what we do, and 
                most importantly, how our SEO strategies can help your business grow smarter, 
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
              
              {/* Content placeholder - can be replaced with actual image */}
              <div className="relative bg-gray-100 rounded-2xl p-8 transform -rotate-1 shadow-xl">
                <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-brandPurple/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-brandPurple">GO</span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Gregoire Liao</p>
                    <p className="text-xs text-gray-500">SEO Expert</p>
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