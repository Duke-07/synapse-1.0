'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

export interface BiomarkerTableProps {
  features?: Record<string, number>;
  shapValues?: Record<string, number>;
}

const REFERENCE_DATA: Record<string, { min: number; max: number; unit: string; desc: string }> = {
  'MDVP:Fo(Hz)': { min: 140.0, max: 220.0, unit: 'Hz', desc: 'Average vocal fundamental frequency' },
  'MDVP:Fhi(Hz)': { min: 160.0, max: 260.0, unit: 'Hz', desc: 'Maximum vocal pitch peak' },
  'MDVP:Flo(Hz)': { min: 110.0, max: 190.0, unit: 'Hz', desc: 'Minimum vocal pitch floor' },
  'MDVP:Jitter(%)': { min: 0.001, max: 0.005, unit: '%', desc: 'Cycle-to-cycle frequency variation' },
  'MDVP:Jitter(Abs)': { min: 0.00001, max: 0.00004, unit: 's', desc: 'Absolute cycle pitch perturbation' },
  'MDVP:RAP': { min: 0.0005, max: 0.0025, unit: 'ratio', desc: 'Relative Average Perturbation' },
  'MDVP:PPQ': { min: 0.0005, max: 0.0028, unit: 'ratio', desc: 'Five-point Period Perturbation Quotient' },
  'Jitter:DDP': { min: 0.0015, max: 0.0075, unit: 'ratio', desc: 'Average difference of consecutive jitters' },
  'MDVP:Shimmer': { min: 0.010, max: 0.035, unit: 'ratio', desc: 'Cycle-to-cycle amplitude perturbation' },
  'MDVP:Shimmer(dB)': { min: 0.08, max: 0.30, unit: 'dB', desc: 'Shimmer expressed in decibels' },
  'Shimmer:APQ3': { min: 0.004, max: 0.018, unit: 'ratio', desc: 'Three-point amplitude quotient' },
  'Shimmer:APQ5': { min: 0.006, max: 0.022, unit: 'ratio', desc: 'Five-point amplitude quotient' },
  'MDVP:APQ': { min: 0.008, max: 0.025, unit: 'ratio', desc: '11-point amplitude quotient' },
  'Shimmer:DDA': { min: 0.012, max: 0.054, unit: 'ratio', desc: 'Average difference of amplitudes' },
  'NHR': { min: 0.001, max: 0.015, unit: 'ratio', desc: 'Noise-to-Harmonics Ratio' },
  'HNR': { min: 22.0, max: 33.0, unit: 'dB', desc: 'Harmonics-to-Noise Ratio (higher = clearer)' },
  'RPDE': { min: 0.30, max: 0.55, unit: 'ratio', desc: 'Recurrence Period Density Entropy' },
  'DFA': { min: 0.55, max: 0.72, unit: 'exponent', desc: 'Detrended Fluctuation Analysis' },
  'spread1': { min: -7.5, max: -5.5, unit: 'log', desc: 'Nonlinear fundamental frequency variation' },
  'spread2': { min: 0.08, max: 0.22, unit: 'ratio', desc: 'Nonlinear frequency deviation measure' },
  'D2': { min: 1.80, max: 2.30, unit: 'dim', desc: 'Correlation dimension of vocal attractor' },
  'PPE': { min: 0.05, max: 0.18, unit: 'entropy', desc: 'Pitch Period Entropy (Key PD Biomarker)' },
};

export const BiomarkerTable: React.FC<BiomarkerTableProps> = ({ features = {}, shapValues = {} }) => {
  const [expanded, setExpanded] = useState(false);

  const keys = Object.keys(REFERENCE_DATA);
  const displayedKeys = expanded ? keys : keys.slice(0, 8);

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#141414]/10">
        <h4 className="font-headline text-lg font-medium text-[#141414] uppercase tracking-tight">
          Extracted Praat Acoustic Biomarkers ({keys.length})
        </h4>
        <span className="text-xs text-[#6B6D72]">Normalized Values</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-[#141414]">
          <thead className="bg-[#fcdc74]/25 text-[11px] uppercase font-semibold text-[#141414] border-b border-[#141414]/10">
            <tr>
              <th className="py-3 px-3">Biomarker</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Measured Value</th>
              <th className="py-3 px-3">Healthy Range</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]/5 text-xs">
            {displayedKeys.map((key) => {
              const val = features[key];
              const ref = REFERENCE_DATA[key];
              if (val === undefined || !ref) return null;

              const isWithinHealthy = val >= ref.min && val <= ref.max;

              return (
                <tr key={key} className="hover:bg-[#91ceff]/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#141414]">{key}</td>
                  <td className="py-3 px-3 text-[#6B6D72]">{ref.desc}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#141414]">
                    {val.toFixed(4)} {ref.unit}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#6B6D72]">
                    {ref.min} – {ref.max} {ref.unit}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isWithinHealthy ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#91ceff] text-[#0060ca]">
                        <CheckCircle className="w-3 h-3" /> Healthy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle className="w-3 h-3" /> Deviated
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#141414]/20 text-xs font-semibold text-[#141414] hover:bg-[#141414]/5 transition-colors cursor-pointer"
        >
          {expanded ? (
            <>
              Show Fewer Biomarkers <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              View All 22 Biomarkers <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BiomarkerTable;
