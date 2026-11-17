import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div
      role="alert"
      className="w-full bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2"
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
      <span>
        <strong>PRE-CLINICAL SCREENING AID ONLY</strong>: Synapse-Voice does not diagnose Parkinson&apos;s disease or any medical condition.
        Results must be interpreted in consultation with a board-certified neurologist.
      </span>
    </div>
  );
};

export default DisclaimerBanner;
