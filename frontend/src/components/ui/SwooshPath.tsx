'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SwooshPathProps {
  className?: string;
}

export const SwooshPath: React.FC<SwooshPathProps> = ({ className = '' }) => {
  const { scrollYProgress } = useScroll();

  // Animate path drawing with scroll progress from 0.4 up to 1.0
  const pathLength = useTransform(scrollYProgress, [0, 0.4], [0.35, 1]);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
    >
      <svg
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Main Thick White Swoosh Line */}
        <motion.path
          d="M -50 480 L 460 480 L 590 480 L 1150 480 L 1320 180 L 1500 120"
          stroke="#FFFFFF"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength }}
          initial={{ pathLength: 0.35 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  );
};

export default SwooshPath;
