import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside
      aria-label="Pre-clinical screening aid notice"
      className="w-full bg-[#2C3531] text-[#D1E8E2] py-2.5 px-4 select-none relative z-50 text-xs font-mono border-b border-[#2C3531]"
    >
      <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#FFCB9A]" />
        <span className="font-semibold text-[#FFCB9A] tracking-wider uppercase">
          Investigational Research Platform:
        </span>
        <span className="text-[#D1E8E2]/85 hidden sm:inline font-sans">
          Synapse-Voice evaluates phonatory acoustic biomarkers and does not provide a clinical diagnosis of Parkinson&apos;s disease.
        </span>
        <span className="text-[#D1E8E2]/85 sm:hidden font-sans">
          Academic screening only. Does not diagnose PD.
        </span>
      </div>
    </aside>
  );
};

export default DisclaimerBanner;
