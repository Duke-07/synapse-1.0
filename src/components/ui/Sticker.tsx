'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface StickerProps {
  children: React.ReactNode;
  color?: 'teal' | 'tan' | 'mint' | 'peach' | 'charcoal' | 'orange' | 'yellow' | 'blue' | 'cream';
  rotate?: number;
  className?: string;
  animate?: boolean;
}

export const Sticker: React.FC<StickerProps> = ({
  children,
  color = 'teal',
  rotate = -2,
  className = '',
  animate = true,
}) => {
  const colorStyles = {
    teal: 'bg-[#116466] text-[#EBF4F1] border border-[#116466]',
    tan: 'bg-[#D9B08C] text-[#2C3531] border border-[#D9B08C]',
    mint: 'bg-[#D1E8E2] text-[#116466] border border-[#116466]/20',
    peach: 'bg-[#FFCB9A] text-[#2C3531] border border-[#D9B08C]/40',
    charcoal: 'bg-[#2C3531] text-[#EBF4F1] border border-[#D9B08C]/30',
    // Backwards compatibility mappings:
    orange: 'bg-[#D9B08C] text-[#2C3531] border border-[#D9B08C]',
    yellow: 'bg-[#FFCB9A] text-[#2C3531] border border-[#D9B08C]/40',
    blue: 'bg-[#116466] text-[#EBF4F1] border border-[#116466]',
    cream: 'bg-[#D1E8E2] text-[#116466] border border-[#116466]/20',
  };

  const baseClasses =
    'inline-block px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider text-xs select-none shadow-xs';

  if (!animate) {
    return (
      <span
        className={`${baseClasses} ${colorStyles[color]} ${className}`}
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={`${baseClasses} ${colorStyles[color]} ${className}`}
      style={{ display: 'inline-block', transform: `rotate(${rotate}deg)` }}
      initial={{ scale: 1.15, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1] as const,
      }}
      whileHover={{ scale: 1.04, rotate: rotate + 1 }}
    >
      {children}
    </motion.span>
  );
};

export default Sticker;
