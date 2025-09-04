import React, { useEffect } from "react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { Link as ScrollLink } from "react-scroll";
import { ChevronDown } from "lucide-react";

// Using brand colors from the project
const COLORS_TOP = ["#9b87f5", "#7E69AB", "#F94E40", "#00213D"];

interface BlogPostHeroProps {
  title: string;
  headings: {
    id: string;
    text: string;
    level: number;
  }[];
}

export const BlogPostHero = ({ title, headings }: BlogPostHeroProps) => {
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
      className="relative min-h-[60vh] overflow-hidden bg-deepBlue px-4 py-16 text-gray-200"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Title Section */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <span className="mb-1.5 inline-block rounded-full bg-gray-600/50 px-3 py-1.5 text-sm">
              Blog Post
            </span>
            <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-medium leading-tight text-transparent sm:text-4xl md:text-5xl">
              {title}
            </h1>
          </div>

          {/* Table of Contents */}
          <div className="md:col-span-5">
            <div 
              className="bg-deepBlue/30 backdrop-blur-sm rounded-xl p-5 border"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <h2 className="text-lg font-medium mb-3 text-white">Table of Contents</h2>
              <ul className="space-y-2">
                {headings.map((heading) => (
                  <li 
                    key={heading.id} 
                    className={`${
                      heading.level === 2 ? "ml-0" : "ml-3"
                    }`}
                  >
                    <ScrollLink
                      to={heading.id}
                      spy={true}
                      smooth={true}
                      offset={-100}
                      duration={500}
                      className="text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronDown className="h-3 w-3" />
                      <span>{heading.text}</span>
                    </ScrollLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated stars background with CSS */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="stars-bg"></div>
      </div>

      {/* Add some animated dots to simulate stars */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 15 }).map((_, i) => (
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
