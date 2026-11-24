'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SwooshPathProps {
  className?: string;
}

export const SwooshPath: React.FC<SwooshPathProps> = ({ className = '' }) => {
  const { scrollYProgress } = useScroll();

  const pathLength = useTransform(scrollYProgress, [0, 0.25], [0.45, 1]);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
    >
      <svg
        viewBox="0 0 1440 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <motion.path
          d="M -60 320 L 620 320 L 1100 130 L 1500 100"
          stroke="#D1E8E2"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.4"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength }}
          initial={{ pathLength: 0.45 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        />
      </svg>
    </div>
  );
};

export default SwooshPath;
