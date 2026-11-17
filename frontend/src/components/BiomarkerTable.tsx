'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

export interface BiomarkerTableProps {
  features?: Record<string, number>;
  shapValues?: Record<string, number>;
}

// Healthy Reference Boundaries based on UCI 174 Controls
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
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Biomarker</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Measured Value</th>
              <th className="py-3 px-3">Healthy Range</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {displayedKeys.map((key) => {
              const val = features[key];
              const ref = REFERENCE_DATA[key];
              if (val === undefined || !ref) return null;

              const isNormal = val >= ref.min && val <= ref.max;

              return (
                <tr key={key} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {key}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 text-xs">
                    {ref.desc}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">
                    {typeof val === 'number' ? (val < 0.01 && val > -0.01 ? val.toExponential(3) : val.toFixed(4)) : val} {ref.unit}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {ref.min} - {ref.max} {ref.unit}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {isNormal ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <CheckCircle className="w-3 h-3" /> Within Range
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-400 border border-amber-800">
                        <AlertCircle className="w-3 h-3" /> Atypical
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
        >
          {expanded ? (
            <>
              Show Key Biomarkers Only <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              View All 22 Acoustic Biomarkers <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BiomarkerTable;
