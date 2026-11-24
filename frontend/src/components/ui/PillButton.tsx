'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface PillButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'yellow' | 'charcoal' | 'mint' | 'tan' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  showArrow?: boolean;
}

export const PillButton: React.FC<PillButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
  icon,
  disabled = false,
  showArrow = false,
}) => {
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs font-medium',
    md: 'px-6 py-2.5 text-sm font-medium',
    lg: 'px-8 py-3.5 text-base font-semibold',
  };

  const baseClasses = `inline-flex items-center justify-center gap-2.5 rounded-full tracking-wide transition-all duration-200 cursor-pointer select-none group ${sizeClasses[size]}`;

  const variantClasses = {
    primary:
      'bg-[#116466] text-white hover:bg-[#0c4b4d] shadow-[0_4px_16px_rgba(17,100,102,0.25)] hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'border-1.5 border-[#116466] text-[#116466] bg-transparent hover:bg-[#116466] hover:text-white hover:scale-[1.02] active:scale-[0.98]',
    charcoal:
      'bg-[#2C3531] text-[#EBF4F1] hover:bg-[#1f2623] shadow-[0_4px_16px_rgba(44,53,49,0.25)] hover:scale-[1.02] active:scale-[0.98]',
    mint:
      'bg-[#D1E8E2] text-[#116466] hover:bg-[#bee1d9] border border-[#116466]/20 hover:scale-[1.02] active:scale-[0.98]',
    tan:
      'bg-[#D9B08C] text-[#2C3531] hover:bg-[#cb9f77] shadow-sm hover:scale-[1.02] active:scale-[0.98]',
    yellow:
      'bg-[#FFCB9A] text-[#2C3531] hover:bg-[#f6b87d] shadow-sm hover:scale-[1.02] active:scale-[0.98]',
    ghost:
      'text-[#2C3531] hover:bg-[#2C3531]/5',
  };

  const disabledClasses = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';

  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {showArrow && (
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {content}
    </button>
  );
};

export default PillButton;
