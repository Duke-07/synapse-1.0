'use client';

import React from 'react';

interface StatPillProps {
  value: string;
  label: string;
  sublabel?: string;
  className?: string;
}

export const StatPill: React.FC<StatPillProps> = ({
  value,
  label,
  sublabel,
  className = '',
}) => {
  return (
    <div
      className={`banky-card p-6 sm:p-7 text-center flex flex-col items-center justify-center space-y-1 ${className}`}
    >
      <div className="font-headline text-4xl sm:text-5xl font-medium text-[#0060ca] tracking-tight">
        {value}
      </div>
      <div className="text-sm font-semibold text-[#141414] tracking-tight">
        {label}
      </div>
      {sublabel && (
        <div className="text-xs text-[#6B6D72] font-normal">
          {sublabel}
        </div>
      )}
    </div>
  );
};

export default StatPill;
