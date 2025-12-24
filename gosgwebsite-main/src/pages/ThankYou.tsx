"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gosgLogo from "@/assets/go-sg-logo-official.png";

const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=6580246850";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-indigo-800 text-white">
      {/* REMOVED: duplicate header with logo and label; logo/label remain inside the hero section */}
      <HeroHighlight containerClassName="h-[36rem] py-20 relative">
        <div className="container mx-auto max-w-4xl px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* GO SG logo and dotted label above the Thank You heading */}
            <div className="flex flex-col items-center gap-3 self-center mb-6">
              <img
                src={gosgLogo}
                alt="GO SG Consulting"
                className="h-10 md:h-10 w-auto"
              />
              <div className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border-2 border-dashed border-blue-500 bg-blue-50/80 backdrop-blur-sm rounded-lg">
                <span className="text-blue-600 font-semibold text-xs md:text-base">
                  Your Growth Team Inside
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              <Highlight className="text-white">Thank You!</Highlight>
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl">
              Your message has been sent. Our team will get back to you within 24 hours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-medium px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer")}
                className="rounded-full bg-gradient-to-r from-[#9b87f5] via-[#7E69AB] to-[#0EA5E9] hover:from-[#8c7af2] hover:to-[#0d94dd] text-white px-6 py-4 font-semibold shadow-[0_18px_45px_-10px_rgba(124,58,237,0.55)] transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
                    <MessageCircle className="w-4 h-4" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
                  </span>
                  <span>WhatsApp</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </HeroHighlight>
    </div>
  );
};

export default ThankYou;