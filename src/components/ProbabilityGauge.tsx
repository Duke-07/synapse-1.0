'use client';

import React from 'react';

export interface ProbabilityGaugeProps {
  probability: number;
  confidenceBand: 'Low Risk' | 'Moderate Concern' | 'Elevated Risk';
}

export const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({ probability, confidenceBand }) => {
  const percentage = Math.round(probability * 100);

  // SVG Gauge calculations
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Arc spans 180 degrees (semi-circle)
  const strokeDashoffset = circumference - (percentage / 100) * (circumference / 2);

  // Color selection based on risk band
  const getColor = () => {
    if (probability < 0.35) return { stroke: '#10b981', bg: 'text-emerald-500', badge: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
    if (probability <= 0.65) return { stroke: '#f59e0b', bg: 'text-amber-500', badge: 'bg-amber-950 text-amber-400 border-amber-800' };
    return { stroke: '#ef4444', bg: 'text-rose-500', badge: 'bg-rose-950 text-rose-400 border-rose-800' };
  };

  const style = getColor();

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-sm">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference / 2} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress Indicator */}
          <circle
            stroke={style.stroke}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {percentage}%
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
            Risk Score
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
          {confidenceBand}
        </span>
        <p className="text-[11px] text-slate-400 mt-2 max-w-[200px] leading-tight">
          Calibrated posterior probability from 5-fold StratifiedGroupKFold model.
        </p>
      </div>
    </div>
  );
};

export default ProbabilityGauge;
