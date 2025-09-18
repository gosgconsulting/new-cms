import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, ChevronDown } from "lucide-react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { useContactModal } from "@/contexts/ContactModalContext";
import { Button } from "@/components/ui/button";
import heroMarketingImage from "@/assets/hero-marketing-image.jpg";

// Using GO SG brand colors
const COLORS_TOP = ["hsl(var(--go-sg-purple))", "hsl(var(--go-sg-teal))", "hsl(var(--go-sg-coral))", "hsl(var(--go-sg-deep-blue))"];

export const AuroraHero = () => {
  const color = useMotionValue(COLORS_TOP[0]);
  const { openModal } = useContactModal();

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, hsl(var(--go-sg-deep-blue)) 50%, ${color})`;

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative min-h-screen overflow-hidden bg-go-sg-deep-blue text-white"
    >
      {/* Integrated Header */}
      <header className="relative z-50 w-full py-6 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/d2d7d623-f729-433e-b350-0e40b4a32b91.png" 
                alt="GO SG CONSULTING Logo" 
                className="h-12"
              />
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-white hover:text-go-sg-coral transition-colors duration-300 border-b-2 border-go-sg-coral">
                Home
              </Link>
              <Link to="/admin" className="text-white/80 hover:text-white transition-colors duration-300">
                Projects
              </Link>
              <Link to="/contact" className="text-white/80 hover:text-white transition-colors duration-300">
                About
              </Link>
              <div className="relative group">
                <button className="text-white/80 hover:text-white transition-colors duration-300 flex items-center">
                  Services
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-surface rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-border">
                  <div className="py-2">
                    <Link to="/services/seo" className="block px-4 py-2 text-on-surface hover:bg-surface-variant transition-colors">SEO Services</Link>
                    <Link to="/services/paid-ads" className="block px-4 py-2 text-on-surface hover:bg-surface-variant transition-colors">Paid Advertising</Link>
                    <Link to="/services/social-media" className="block px-4 py-2 text-on-surface hover:bg-surface-variant transition-colors">Social Media</Link>
                    <Link to="/services/website-design" className="block px-4 py-2 text-on-surface hover:bg-surface-variant transition-colors">Website Design</Link>
                  </div>
                </div>
              </div>
              <Link to="/blog" className="text-white/80 hover:text-white transition-colors duration-300">
                Blogs
              </Link>
            </nav>

            {/* Contact Us Button and Language Selector */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={openModal}
                className="bg-go-sg-coral text-white hover:bg-go-sg-coral/90 rounded-full px-6 py-2 font-medium border-2 border-go-sg-coral hover:border-go-sg-coral/90 transition-all"
              >
                Contact Us
              </Button>
              <div className="hidden md:flex items-center space-x-2 text-white/80">
                <Globe className="h-4 w-4" />
                <span className="text-sm">English</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              BIG IDEAS FOR{" "}
              <span className="bg-gradient-to-r from-go-sg-purple to-go-sg-coral bg-clip-text text-transparent">
                BOLD BRANDS
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Advertising & Creative Digital Marketing Agency in Bangkok Thailand
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                onClick={openModal}
                className="bg-gradient-to-r from-go-sg-purple to-go-sg-coral hover:from-go-sg-purple/90 hover:to-go-sg-coral/90 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Contact us
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Marketing Image */}
          <motion.div 
            className="relative lg:block hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              <img 
                src={heroMarketingImage} 
                alt="Digital Marketing Professional"
                className="w-full h-auto max-w-lg mx-auto rounded-2xl"
              />
              
              {/* Additional gradient overlays for enhanced effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-go-sg-teal/20 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-go-sg-coral/20 to-transparent rounded-2xl"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="stars-bg"></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-r from-go-sg-teal/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-go-sg-coral/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-go-sg-purple/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </motion.section>
  );
};