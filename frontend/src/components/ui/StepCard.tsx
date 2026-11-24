'use client';

import React from 'react';

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  badge?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const StepCard: React.FC<StepCardProps> = ({
  number,
  title,
  description,
  badge,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`craft-card p-8 sm:p-9 flex flex-col justify-between relative group hover:border-[#116466]/40 transition-colors ${className}`}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-serif text-5xl sm:text-6xl font-normal text-[#116466] tracking-tight">
            {number}
          </span>
          {icon && (
            <div className="w-12 h-12 rounded-2xl bg-[#D1E8E2] text-[#116466] flex items-center justify-center shadow-xs">
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C3531] tracking-tight">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-[#2C3531]/80 leading-relaxed font-sans font-normal">
            {description}
          </p>
        </div>
      </div>

      {badge && (
        <div className="pt-6 border-t border-[#D9B08C]/30 mt-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#116466]">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};

export default StepCard;
