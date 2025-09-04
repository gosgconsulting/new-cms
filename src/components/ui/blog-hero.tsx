import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Using brand colors from the project
const COLORS_TOP = ["#9b87f5", "#7E69AB", "#F94E40", "#00213D"];

interface BlogHeroProps {
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  showLabel?: boolean;
  label?: string;
}

export const BlogHero: React.FC<BlogHeroProps> = ({
  title,
  description,
  ctaText = "Contact Us",
  ctaLink = "/contact",
  showLabel = false,
  label = ""
}) => {
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #00213D 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-deepBlue px-4 py-24 text-gray-200"
    >
      <div className="relative z-10 flex flex-col items-center">
        {showLabel && label && (
          <span className="mb-1.5 inline-block rounded-full bg-gray-600/50 px-3 py-1.5 text-sm">
            {label}
          </span>
        )}
        <h1 className="max-w-3xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-medium leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
          {title}
        </h1>
        <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed">
          {description}
        </p>
        <Button 
          asChild
          style={{
            border,
            boxShadow,
          } as any}
          className="group relative flex w-fit items-center gap-1.5 rounded-full bg-deepBlue/10 px-4 py-2 text-gray-50 transition-colors hover:bg-deepBlue/50 hover:scale-105"
        >
          <Link to={ctaLink}>
            {ctaText}
            <ArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
          </Link>
        </Button>
      </div>

      {/* Simulated stars background with CSS */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="stars-bg"></div>
      </div>

      {/* Add some animated dots to simulate stars */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </motion.section>
  );
};