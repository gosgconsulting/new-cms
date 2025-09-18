import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollTransitionProps {
  children: React.ReactNode;
}

const ScrollTransition: React.FC<ScrollTransitionProps> = ({ children }) => {
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Transform values for the 3D effect
  const scale = useTransform(scrollY, [0, 500], [1, 0.9]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.8]);
  const rotateX = useTransform(scrollY, [0, 500], [0, 5]);
  const y = useTransform(scrollY, [0, 500], [0, -100]);

  if (!mounted) return <div>{children}</div>;

  return (
    <motion.div
      style={{
        scale,
        opacity,
        rotateX,
        y,
        transformPerspective: 1000,
      }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
};

export default ScrollTransition;