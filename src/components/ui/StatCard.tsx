'use client';

import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatCardProps {
  numericValue: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  subtext?: string;
  rotate?: number;
  shadowColor?: 'orange' | 'yellow' | 'teal' | 'tan';
}

export const StatCard: React.FC<StatCardProps> = ({
  numericValue,
  decimals = 0,
  prefix = '',
  suffix = '',
  label,
  subtext,
  rotate = 0,
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1500;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = numericValue / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      whileHover={{ scale: 1.02, rotate: rotate > 0 ? rotate + 0.5 : rotate - 0.5 }}
      style={{ transform: `rotate(${rotate}deg)` }}
      className="bg-[#2C3531] border border-[#D9B08C]/40 rounded-2xl p-6 sm:p-7 text-center shadow-[4px_4px_0px_#116466] transition-transform"
    >
      <div className="font-serif text-5xl sm:text-6xl text-[#EBF4F1] leading-none tracking-tight">
        {prefix}
        {displayValue.toFixed(decimals)}
        {suffix}
      </div>
      <div className="font-display font-bold text-[#FFCB9A] uppercase text-xs sm:text-sm tracking-widest mt-3">
        {label}
      </div>
      {subtext && (
        <p className="text-xs text-[#D1E8E2]/80 mt-1.5 font-sans leading-relaxed">
          {subtext}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;
