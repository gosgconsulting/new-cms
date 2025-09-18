import { motion, useAnimation, useDragControls, PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const ClientLogos = () => {
  const clients = [
    { name: "Google" },
    { name: "Facebook" },
    { name: "Instagram" },
    { name: "TikTok" },
    { name: "Looker Studio" },
    { name: "ChatGPT" },
    { name: "Claude AI" },
  ];
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      // Get the scrollWidth of the container
      setScrollWidth(containerRef.current.scrollWidth - containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (!isPaused && scrollWidth > 0) {
      controls.start({
        x: -scrollWidth,
        transition: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 15, // Reduced from 30 to 15 seconds for faster scrolling
          ease: "linear"
        }
      });
    } else {
      // Stop the animation completely
      controls.stop();
    }
  }, [isPaused, controls, scrollWidth]);

  const handleDragStart = () => {
    setIsPaused(true);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const newPosition = currentPosition + info.offset.x;
    setCurrentPosition(newPosition);
    controls.start({
      x: newPosition,
      transition: { duration: 0.5, ease: "easeInOut" }
    });
  };

  return (
    <section className="py-12 px-4 overflow-hidden bg-white relative">
      {/* Light mode background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 -z-10"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      
      {/* Scrolling logos container */}
      <div 
        className="overflow-hidden w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          ref={containerRef}
          className="flex items-center gap-12 md:gap-16 py-4 cursor-grab"
          initial={{ x: 0 }}
          animate={controls}
          drag="x"
          dragControls={dragControls}
          dragConstraints={{ left: -2000, right: 100 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileDrag={{ cursor: "grabbing" }}
        >
          {/* First set of client names */}
          {clients.map((client, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-6 py-3 bg-gray-100 rounded-lg border border-gray-200"
            >
              <span className="text-gray-700 font-medium text-sm md:text-base whitespace-nowrap">
                {client.name}
              </span>
            </div>
          ))}

          {/* Duplicate set for seamless looping */}
          {clients.map((client, index) => (
            <div
              key={`duplicate-${index}`}
              className="flex-shrink-0 px-6 py-3 bg-gray-100 rounded-lg border border-gray-200"
            >
              <span className="text-gray-700 font-medium text-sm md:text-base whitespace-nowrap">
                {client.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ClientLogos;
