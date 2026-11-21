'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface StickerProps {
  children: React.ReactNode;
  color?: 'orange' | 'yellow' | 'blue' | 'cream';
  rotate?: number;
  className?: string;
  animate?: boolean;
}

export const Sticker: React.FC<StickerProps> = ({
  children,
  color = 'blue',
  rotate = -2,
  className = '',
  animate = true,
}) => {
  const colorStyles = {
    orange: 'bg-[#FF5A1F] text-[#FFF4DC] border-2 border-[#141414]',
    yellow: 'bg-[#FFCE32] text-[#141414] border-2 border-[#141414]',
    blue: 'bg-[#1D63FF] text-white border-2 border-white',
    cream: 'bg-white text-[#141414] border-2 border-[#141414]',
  };

  const baseClasses =
    'inline-block px-3.5 py-1 rounded-xl font-bold uppercase tracking-wide select-none shadow-[2px_2px_0_rgba(20,20,20,0.15)]';

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
      initial={{ scale: 1.25, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.05, rotate: rotate + 2 }}
    >
      {children}
    </motion.span>
  );
};

export default Sticker;
