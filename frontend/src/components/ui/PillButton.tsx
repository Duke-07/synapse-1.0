'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface PillButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'yellow' | 'ghost';
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
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const baseClasses = `inline-flex items-center justify-center gap-2.5 rounded-full font-semibold tracking-wide transition-all duration-200 cursor-pointer select-none group ${sizeClasses[size]}`;

  const variantClasses = {
    primary:
      'bg-[#1D63FF] text-white hover:bg-[#1453E6] shadow-[0_8px_20px_rgba(29,99,255,0.3)] hover:scale-[1.03] active:scale-[0.97]',
    secondary:
      'border-2 border-[#1D63FF] text-[#1D63FF] bg-transparent hover:bg-[#1D63FF] hover:text-white hover:scale-[1.03] active:scale-[0.97]',
    yellow:
      'bg-[#FFCE32] text-[#141414] hover:bg-[#F2C32B] shadow-sm hover:scale-[1.03] active:scale-[0.97]',
    ghost:
      'text-[#141414] hover:bg-[#141414]/5',
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
