"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface HandWrittenTitleProps {
  title?: string;
  subtitle?: React.ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
  containerClassName?: string;
}

function HandWrittenTitle({
  title = "Hand Written",
  subtitle = undefined,
  titleClassName,
  subtitleClassName,
  containerClassName,
}: HandWrittenTitleProps) {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2.5, ease: "easeInOut" },
        opacity: { duration: 0.5 },
      },
    },
  };

  return (
    <div className={cn("relative text-center z-10 flex flex-col items-center justify-center", containerClassName)}>
      <motion.h1
        className={cn(
          "text-4xl md:text-6xl text-black dark:text-white tracking-tighter flex items-center gap-2",
          titleClassName
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.div
          className={cn("text-xl text-black/80 dark:text-white/80 mt-2", subtitleClassName)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {subtitle}
        </motion.div>
      )}
    </div>
  );
}

export { HandWrittenTitle }