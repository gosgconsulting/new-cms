import React from 'react';
import { motion } from 'framer-motion';

// Import all client logos
import googleLogo from '../assets/clients/google.svg';
import microsoftLogo from '../assets/clients/microsoft.svg';
import amazonLogo from '../assets/clients/amazon.svg';
import netflixLogo from '../assets/clients/netflix.svg';
import spotifyLogo from '../assets/clients/spotify.svg';
import appleLogo from '../assets/clients/apple.svg';
import metaLogo from '../assets/clients/meta.svg';
import twitterLogo from '../assets/clients/twitter.svg';

const logos = [
  { src: googleLogo, alt: 'Google' },
  { src: microsoftLogo, alt: 'Microsoft' },
  { src: amazonLogo, alt: 'Amazon' },
  { src: netflixLogo, alt: 'Netflix' },
  { src: spotifyLogo, alt: 'Spotify' },
  { src: appleLogo, alt: 'Apple' },
  { src: metaLogo, alt: 'Meta' },
  { src: twitterLogo, alt: 'Twitter' },
];

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

        <motion.div 
          className="flex space-x-12 items-center justify-center flex-wrap gap-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              className="h-12 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={logo.src} 
                alt={logo.alt} 
                className="h-full w-auto object-contain" 
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ClientLogos;