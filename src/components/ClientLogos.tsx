import React from 'react';
import { motion } from 'framer-motion';

// Client logos - Add your actual client logos here
const logos: { name: string; logo?: string }[] = [];

const ClientLogos = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 -z-10"></div>
      
      {/* Scrolling logos container */}
      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Trusted by industry leaders
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            We've helped companies of all sizes achieve their marketing goals
          </p>
        </div>

        {logos.length > 0 ? (
          <motion.div 
            className="flex space-x-12 items-center justify-center flex-wrap gap-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {logos.map((logo, index) => (
              <motion.div
                key={index}
                className="h-12 px-6 py-3 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                {logo.logo ? (
                  <img src={logo.logo} alt={logo.name} className="h-8 max-w-32 object-contain" />
                ) : (
                  <span className="text-gray-700 font-medium">{logo.name}</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Client logos will be displayed here</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClientLogos;