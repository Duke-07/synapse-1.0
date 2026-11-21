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
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 text-center text-slate-400 text-xs">
        No feature attributions available for this screening.
      </div>
    );
  }

  // Max absolute value for normalization
  const maxVal = Math.max(...items.map((b) => Math.abs(b.shap_value || 0)), 0.05);

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 shadow-sm space-y-3">
      {items.slice(0, 5).map((b) => {
        const isPositive = (b.shap_value || 0) >= 0;
        const pct = Math.min(100, Math.round((Math.abs(b.shap_value || 0) / maxVal) * 100));

        return (
          <div key={b.feature} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                {b.label || b.feature} <span className="text-slate-400 font-normal">({b.feature})</span>
              </span>
              <span
                className={`font-mono font-bold ${
                  isPositive ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {isPositive ? '+' : ''}{(b.shap_value || 0).toFixed(3)}
              </span>
            </div>

            {/* Dual Directional Bar */}
            <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden flex items-center">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10" />
              {isPositive ? (
                <div
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-700"
                  style={{ marginLeft: '50%', width: `${pct / 2}%` }}
                />
              ) : (
                <div
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-700 ml-auto"
                  style={{ marginRight: '50%', width: `${pct / 2}%` }}
                />
              )}
            </div>

            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Value: {(b.value || 0).toFixed(4)} {b.unit || ''}</span>
              <span>Healthy: {b.ref_min} - {b.ref_max}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShapChart;
