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
  shadowColor?: 'orange' | 'yellow';
}

export const StatCard: React.FC<StatCardProps> = ({
  numericValue,
  decimals = 0,
  prefix = '',
  suffix = '',
  label,
  subtext,
  rotate = 0,
  shadowColor = 'orange',
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1500; // ms
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

  const shadowClass =
    shadowColor === 'yellow'
      ? 'shadow-[6px_6px_0px_#FFC21F]'
      : 'shadow-[6px_6px_0px_#FF5A1F]';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, type: 'spring', damping: 16 }}
      whileHover={{ scale: 1.03, rotate: rotate > 0 ? rotate + 1 : rotate - 1 }}
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`bg-[#1c1717] border-2 border-[#FFF4DC] rounded-2xl p-6 text-center transform transition-transform ${shadowClass}`}
    >
      <div className="font-headline text-5xl sm:text-6xl md:text-7xl text-[#FFF4DC] leading-none tracking-tight">
        {prefix}
        {displayValue.toFixed(decimals)}
        {suffix}
      </div>
      <div className="font-bold text-[#FF5A1F] uppercase text-sm sm:text-base tracking-wider mt-2">
        {label}
      </div>
      {subtext && (
        <p className="text-xs text-[#FFF4DC]/70 mt-1 font-body leading-tight">
          {subtext}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;
