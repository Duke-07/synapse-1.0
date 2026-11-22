'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SwooshPathProps {
  className?: string;
}

export const SwooshPath: React.FC<SwooshPathProps> = ({ className = '' }) => {
  const { scrollYProgress } = useScroll();

  // Draw stroke smoothly as user scrolls past hero (from 0 to 0.2 scroll progress)
  const pathLength = useTransform(scrollYProgress, [0, 0.2], [0.55, 1]);

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
        {/* Main Thick White Swoosh Line behind Hero CTA */}
        <motion.path
          d="M -60 320 L 620 320 L 1100 130 L 1500 100"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength }}
          initial={{ pathLength: 0.55 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  );
};

export default SwooshPath;
