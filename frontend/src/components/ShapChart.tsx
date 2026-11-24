'use client';

import React from 'react';
import { BiomarkerAttribution } from '../lib/types';

export interface ShapChartProps {
  topBiomarkers?: BiomarkerAttribution[];
  attributions?: BiomarkerAttribution[];
}

export const ShapChart: React.FC<ShapChartProps> = ({ topBiomarkers, attributions }) => {
  const items = attributions || topBiomarkers || [];

  if (items.length === 0) {
    return (
      <div className="craft-card p-6 text-center text-[#2C3531]/60 text-xs">
        No feature attributions available for this screening.
      </div>
    );
  }

  const maxVal = Math.max(...items.map((b) => Math.abs(b.shap_value || 0)), 0.05);

  return (
    <div className="craft-card p-6 sm:p-8 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9B08C]/30">
        <h4 className="font-serif text-lg font-normal text-[#2C3531] tracking-tight">
          Top Acoustic Attributions (SHAP)
        </h4>
        <span className="text-xs text-[#2C3531]/60 font-mono">Impact on Score</span>
      </div>

      <div className="space-y-4">
        {items.slice(0, 5).map((b) => {
          const isPositive = (b.shap_value || 0) >= 0;
          const pct = Math.min(100, Math.round((Math.abs(b.shap_value || 0) / maxVal) * 100));

          return (
            <div key={b.feature} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-[#2C3531]">
                  {b.label || b.feature}{' '}
                  <span className="text-[#2C3531]/50 font-normal text-xs font-mono">({b.feature})</span>
                </span>
                <span
                  className={`font-mono font-bold text-xs ${
                    isPositive ? 'text-[#B84A39]' : 'text-[#116466]'
                  }`}
                >
                  {isPositive ? '+' : ''}{(b.shap_value || 0).toFixed(3)}
                </span>
              </div>

              {/* Dual Directional Bar */}
              <div className="relative h-2 bg-[#D1E8E2]/50 rounded-full overflow-hidden flex items-center">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#2C3531]/25 z-10" />
                {isPositive ? (
                  <div
                    className="h-full bg-[#B84A39] rounded-r-full transition-all duration-700"
                    style={{ marginLeft: '50%', width: `${pct / 2}%` }}
                  />
                ) : (
                  <div
                    className="h-full bg-[#116466] rounded-l-full transition-all duration-700 ml-auto"
                    style={{ marginRight: '50%', width: `${pct / 2}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShapChart;
