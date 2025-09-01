"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ContactModal from "@/components/ContactModal";

/**
 * WordPress Theme Component: Header
 * 
 * Component: Will be converted to header.php
 * Template Name: Header
 * 
 * Dynamic Elements:
 * - Navigation menu items (will be replaced with wp_nav_menu)
 * - Logo (will be replaced with get_custom_logo or theme option)
 */
const Header = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <header className={`w-full py-6 px-4 md:px-8 ${isHomepage ? 'bg-transparent absolute top-0 left-0 right-0 z-50' : 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100'}`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-3xl font-bold z-10">
              <span className="text-deepBlue">GO</span> <span className="text-coral">SG</span>
            </Link>

            {/* Contact Us Button */}
            <Button 
              onClick={() => setIsContactModalOpen(true)}
              variant="coral" 
              size="sm" 
              className="relative overflow-hidden group bg-coral hover:bg-coral/90 text-white font-medium px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-coral/25 hover:shadow-xl"
            >
              <span className="relative z-10">Contact Us</span>
              <span className="absolute inset-0 w-full h-full bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
            </Button>
          </div>
        </div>
      </header>
      
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </>
  );
};

export default Header;