import React from 'react';

interface StepSquiggleProps {
  className?: string;
}

export const StepSquiggle: React.FC<StepSquiggleProps> = ({ className = '' }) => {
  return (
    <div className={`hidden md:flex items-center justify-center pointer-events-none select-none ${className}`}>
      <svg
        width="140"
        height="40"
        viewBox="0 0 140 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[120px] text-[#FF5A1F]"
      >
        <path
          d="M 5 20 Q 35 2 70 20 T 135 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 6"
        />
        <path
          d="M 125 13 L 135 20 L 125 27"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default StepSquiggle;
