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
      className={`craft-card p-6 sm:p-7 text-center flex flex-col items-center justify-center space-y-1 ${className}`}
    >
      <div className="font-serif text-4xl sm:text-5xl font-normal text-[#116466] tracking-tight">
        {value}
      </div>
      <div className="text-sm font-semibold text-[#2C3531] tracking-tight">
        {label}
      </div>
      {sublabel && (
        <div className="text-xs text-[#2C3531]/70 font-normal">
          {sublabel}
        </div>
      )}
    </div>
  );
};

export default StatPill;
