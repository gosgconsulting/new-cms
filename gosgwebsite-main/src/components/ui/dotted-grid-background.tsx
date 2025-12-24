"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DottedGridBackgroundProps {
  className?: string;
  dotSize?: number;
  spacing?: number;
  dotColor?: string;
  hoverColor?: string;
  hoverRadius?: number;
}

export const DottedGridBackground: React.FC<DottedGridBackgroundProps> = ({
  className = "",
  dotSize = 2,
  spacing = 30,
  dotColor = "rgb(203, 213, 225)", // slate-300
  hoverColor = "rgb(99, 102, 241)", // indigo-500
  hoverRadius = 80,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  const generateDots = () => {
    if (!containerRef.current) return [];

    const containerWidth = containerRef.current.offsetWidth || 1200;
    const containerHeight = containerRef.current.offsetHeight || 800;
    
    const cols = Math.ceil(containerWidth / spacing);
    const rows = Math.ceil(containerHeight / spacing);
    
    const dots = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;
        
        // Calculate distance from mouse
        const distance = isHovering 
          ? Math.sqrt(Math.pow(x - mousePosition.x, 2) + Math.pow(y - mousePosition.y, 2))
          : Infinity;
        
        const isInHoverRadius = distance < hoverRadius;
        const opacity = isInHoverRadius 
          ? Math.max(0.3, 1 - (distance / hoverRadius))
          : 0.4;

        dots.push(
          <motion.div
            key={`${row}-${col}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: x - dotSize / 2,
              top: y - dotSize / 2,
              width: dotSize,
              height: dotSize,
            }}
            animate={{
              backgroundColor: isInHoverRadius ? hoverColor : dotColor,
              opacity: opacity,
              scale: isInHoverRadius ? 1.5 : 1,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          />
        );
      }
    }

    return dots;
  };

  const [dots, setDots] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const updateDots = () => {
      setDots(generateDots());
    };

    updateDots();
    
    // Update dots on window resize
    const handleResize = () => {
      setTimeout(updateDots, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mousePosition, isHovering]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    >
      {dots}
    </div>
  );
};