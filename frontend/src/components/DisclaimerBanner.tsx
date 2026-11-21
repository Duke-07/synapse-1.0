import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside
      aria-label="Pre-clinical screening aid notice"
      className="w-full bg-[#1D63FF] text-white py-2 px-4 select-none relative z-50 text-xs font-semibold tracking-wider uppercase text-center"
    >
      <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
        <AlertCircle className="w-4 h-4 shrink-0 text-white fill-white/20" />
        <span className="font-bold">PRE-CLINICAL SCREENING AID ONLY:</span>
        <span className="opacity-90 normal-case font-medium hidden sm:inline">
          Synapse-Voice does not diagnose Parkinson&apos;s disease. Results must be interpreted in consultation with a board-certified neurologist.
        </span>
        <span className="opacity-90 normal-case font-medium sm:hidden">
          Academic research aid only. Does not diagnose PD.
        </span>
      </div>
    </aside>
  );
};

export default DisclaimerBanner;
