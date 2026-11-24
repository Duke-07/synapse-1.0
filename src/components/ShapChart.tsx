'use client';

import React from 'react';
import { BiomarkerAttribution } from '../lib/types';
import { Info } from 'lucide-react';

export interface ShapChartProps {
  topBiomarkers?: BiomarkerAttribution[];
  attributions?: BiomarkerAttribution[];
}

export const ShapChart: React.FC<ShapChartProps> = ({ topBiomarkers, attributions }) => {
  const items = attributions || topBiomarkers || [];

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-6 text-center text-[#6B6D72] text-xs">
        No feature attributions available for this screening.
      </div>
    );
  }

  const maxVal = Math.max(...items.map((b) => Math.abs(b.shap_value || 0)), 0.05);

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#141414]/10">
        <h4 className="font-headline text-lg font-medium text-[#141414] uppercase tracking-tight">
          Top Acoustic Attributions (SHAP)
        </h4>
        <span className="text-xs text-[#6B6D72] font-mono">Impact on Score</span>
      </div>

      <div className="space-y-4">
        {items.slice(0, 5).map((b) => {
          const isPositive = (b.shap_value || 0) >= 0;
          const pct = Math.min(100, Math.round((Math.abs(b.shap_value || 0) / maxVal) * 100));

          return (
            <div key={b.feature} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[#141414]">
                  {b.label || b.feature}{' '}
                  <span className="text-[#6B6D72] font-normal text-xs">({b.feature})</span>
                </span>
                <span
                  className={`font-mono font-bold text-xs ${
                    isPositive ? 'text-[#E53E3E]' : 'text-[#1D63FF]'
                  }`}
                >
                  {isPositive ? '+' : ''}{(b.shap_value || 0).toFixed(3)}
                </span>
              </div>

              {/* Dual Directional Bar */}
              <div className="relative h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden flex items-center">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#141414]/20 z-10" />
                {isPositive ? (
                  <div
                    className="h-full bg-[#E53E3E] rounded-r-full transition-all duration-700"
                    style={{ marginLeft: '50%', width: `${pct / 2}%` }}
                  />
                ) : (
                  <div
                    className="h-full bg-[#1D63FF] rounded-l-full transition-all duration-700 ml-auto"
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
