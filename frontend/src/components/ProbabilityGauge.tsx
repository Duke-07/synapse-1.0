'use client';

import React from 'react';

export interface ProbabilityGaugeProps {
  probability: number;
  confidenceBand: 'Low Risk' | 'Moderate Concern' | 'Elevated Risk';
}

export const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({ probability, confidenceBand }) => {
  const percentage = Math.round(probability * 100);

  const radius = 76;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference / 2);

  const getColor = () => {
    if (probability < 0.35) {
      return { stroke: '#116466', bg: 'text-[#116466]', badge: 'bg-[#D1E8E2] text-[#116466] border border-[#116466]/25' };
    }
    if (probability <= 0.65) {
      return { stroke: '#D9B08C', bg: 'text-[#2C3531]', badge: 'bg-[#FFCB9A]/50 text-[#2C3531] border border-[#D9B08C]' };
    }
    return { stroke: '#B84A39', bg: 'text-[#B84A39]', badge: 'bg-[#FFCB9A] text-[#2C3531] border border-[#D9B08C]' };
  };

  const style = getColor();

  return (
    <div className="craft-card flex flex-col items-center justify-center p-6 sm:p-7">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#D1E8E2"
            strokeOpacity="0.5"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference / 2} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            stroke={style.stroke}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-serif text-4xl font-normal text-[#2C3531] tracking-tight">
            {percentage}%
          </span>
          <span className="text-[10px] text-[#2C3531]/60 uppercase font-display font-semibold tracking-wider">
            Risk Score
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${style.badge}`}>
          {confidenceBand}
        </span>
        <p className="text-xs text-[#2C3531]/70 mt-2 max-w-[210px] font-sans leading-relaxed">
          Posterior probability from 5-fold StratifiedGroupKFold classifier.
        </p>
      </div>
    </div>
  );
};

export default ProbabilityGauge;
