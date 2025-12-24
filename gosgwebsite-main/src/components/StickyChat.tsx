"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyChatProps {
  onChatClick?: () => void;
}

const StickyChat: React.FC<StickyChatProps> = ({ onChatClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if hero section is out of view (assuming hero is about 700px tall)
      const heroHeight = 700;
      const scrollPosition = window.scrollY;
      
      // Show button when scrolled past hero section
      setIsVisible(scrollPosition > heroHeight);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onChatClick}
        className="relative rounded-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-4 font-semibold shadow-[0_18px_45px_-10px_rgba(124,58,237,0.75)] transition-all duration-300 hover:scale-105"
        aria-label="Chat with us"
      >
        <span className="flex items-center gap-2">
          <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
            <MessageCircle className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">Chat with us</span>
        </span>
      </Button>
    </div>
  );
};

export default StickyChat;