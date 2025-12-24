"use client";

import React from "react";
import { motion } from "framer-motion";

type ModalBadgeCloudProps = {
  className?: string;
  labels?: string[];
};

const defaultLabels = ["SEM", "SEO", "Website", "Traffic", "Ads", "Design", "Revenue"];

const gradients = [
  "from-sky-400 to-sky-500",
  "from-purple-400 to-purple-500",
  "from-fuchsia-400 to-fuchsia-500",
  "from-teal-400 to-teal-500",
  "from-rose-400 to-rose-500",
  "from-pink-400 to-pink-500",
  "from-emerald-400 to-emerald-500",
];

const ModalBadgeCloud: React.FC<ModalBadgeCloudProps> = ({ className = "", labels = defaultLabels }) => {
  return (
    <div className={`w-full flex items-center justify-center ${className} mb-8`}>
      <div className="relative w-full max-w-md h-32">
        {labels.slice(0, 7).map((label, i) => {
          // Arrange badges in a playful overlapping pattern
          const positions = [
            { top: 8, left: 8, rotate: -6 },
            { top: 16, left: 120, rotate: 4 },
            { top: 52, left: 48, rotate: -2 },
            { top: 60, left: 190, rotate: 5 },
            { top: 92, left: 8, rotate: -4 },
            { top: 96, left: 140, rotate: 3 },
            { top: 24, left: 240, rotate: -3 },
          ];
          const pos = positions[i] || { top: 20 + i * 10, left: 20 + i * 30, rotate: 0 };
          const gradient = gradients[i % gradients.length];

          return (
            <motion.div
              key={`${label}-${i}`}
              className={`absolute inline-flex items-center justify-center px-5 py-2 rounded-full text-black font-semibold bg-gradient-to-r ${gradient} shadow-lg`}
              style={{ top: pos.top, left: pos.left }}
              initial={{ opacity: 0, scale: 0.9, rotate: pos.rotate - 5 }}
              animate={{ opacity: 1, scale: 1, rotate: pos.rotate }}
              transition={{ duration: 0.35, delay: 0.08 * i, ease: "easeOut" }}
            >
              <span className="drop-shadow-sm">{label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ModalBadgeCloud;