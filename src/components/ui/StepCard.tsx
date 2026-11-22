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
      className={`banky-card p-8 sm:p-10 flex flex-col justify-between relative group ${className}`}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-headline text-5xl sm:text-6xl font-medium text-[#0060ca] tracking-tight">
            {number}
          </span>
          {icon && (
            <div className="w-12 h-12 rounded-full bg-[#91ceff]/30 text-[#090089] flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-headline text-2xl sm:text-3xl font-medium text-[#141414] tracking-tight">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-[#141414]/80 leading-relaxed font-normal">
            {description}
          </p>
        </div>
      </div>

      {badge && (
        <div className="pt-6 border-t border-[#141414]/10 mt-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0060ca]">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};

export default StepCard;
