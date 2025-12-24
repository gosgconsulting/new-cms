import { motion, useAnimation, useDragControls, PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Import client logos
import artInBloom from "@/assets/logos/art-in-bloom.png";
import selenightco from "@/assets/logos/selenightco.png";
import smooy from "@/assets/logos/smooy.png";
import solstice from "@/assets/logos/solstice.png";
import grub from "@/assets/logos/grub.png";
import nailQueen from "@/assets/logos/nail-queen.png";
import caroPatisserie from "@/assets/logos/caro-patisserie.png";
import spiritStretch from "@/assets/logos/spirit-stretch.png";

const ClientLogos = () => {
  const clients = [
    { name: "Art in Bloom", logo: artInBloom },
    { name: "Selenightco", logo: selenightco },
    { name: "Smooy", logo: smooy },
    { name: "Solstice", logo: solstice },
    { name: "Grub", logo: grub },
    { name: "Nail Queen", logo: nailQueen },
    { name: "Caro Pâtisserie", logo: caroPatisserie },
    { name: "Spirit Stretch", logo: spiritStretch },
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
          duration: 30, // Slower animation for better visibility
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

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const newPosition = currentPosition + info.offset.x;
    setCurrentPosition(newPosition);
    controls.start({
      x: newPosition,
      transition: { duration: 0.5, ease: "easeInOut" }
    });
  };

  return (
    <section className="py-16 px-4 overflow-hidden bg-white relative">
      {/* Light mode background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 -z-10"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      
      {/* Section Title */}
      <div className="container mx-auto max-w-5xl mb-12">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Trusted by Growing Businesses
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join hundreds of successful businesses that have achieved top rankings with our proven SEO strategies.
          </p>
        </div>
      </div>
      
      {/* Scrolling logos container */}
      <div 
        className="overflow-hidden w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          ref={containerRef}
          className="flex items-center gap-12 md:gap-16 py-8"
          initial={{ x: 0 }}
          animate={controls}
          drag="x"
          dragControls={dragControls}
          dragConstraints={{ left: -2000, right: 100 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileDrag={{ cursor: "grabbing" }}
        >
          {/* Duplicate logo sets for seamless loop */}
          {[...Array(3)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-12 md:gap-16 items-center shrink-0">
              {clients.map((client, index) => (
                <div
                  key={`${setIndex}-${index}`}
                  className="flex items-center justify-center min-w-[120px] h-16 px-4"
                >
                  <img 
                    src={client.logo} 
                    alt={client.name} 
                    className="h-12 w-auto max-w-[120px] object-contain opacity-60 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0" 
                  />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ClientLogos;
