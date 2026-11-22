'use client';

import React from 'react';

export interface ProbabilityGaugeProps {
  probability: number;
  confidenceBand: 'Low Risk' | 'Moderate Concern' | 'Elevated Risk';
}

export const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({ probability, confidenceBand }) => {
  const percentage = Math.round(probability * 100);

  const radius = 76;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference / 2);

  const getColor = () => {
    if (probability < 0.35) {
      return { stroke: '#0060ca', bg: 'text-[#0060ca]', badge: 'bg-[#91ceff]/30 text-[#090089] border border-[#91ceff]' };
    }
    if (probability <= 0.65) {
      return { stroke: '#fcdc74', bg: 'text-[#090089]', badge: 'bg-[#fcdc74] text-[#090089]' };
    }
    return { stroke: '#E53E3E', bg: 'text-[#E53E3E]', badge: 'bg-red-50 text-[#E53E3E] border border-red-200' };
  };

  const style = getColor();

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[32px] shadow-sm">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#F0F0F0"
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
              transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-headline text-4xl font-medium text-[#141414] tracking-tight">
            {percentage}%
          </span>
          <span className="text-[10px] text-[#6B6D72] uppercase font-semibold tracking-wider">
            Risk Score
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${style.badge}`}>
          {confidenceBand}
        </span>
        <p className="text-xs text-[#6B6D72] mt-2 max-w-[210px] leading-relaxed">
          Posterior probability from 5-fold StratifiedGroupKFold classifier.
        </p>
      </div>
    </div>
  );
};

export default ProbabilityGauge;
