'use client';

import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface DefinitionBlockProps {
  className?: string;
}

export const DefinitionBlock: React.FC<DefinitionBlockProps> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePronounce = () => {
    setIsPlaying(true);
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('voice fy');
        utterance.rate = 0.9;
        utterance.pitch = 1.05;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlaying(false), 600);
      }
    } catch {
      setTimeout(() => setIsPlaying(false), 600);
    }
  };

  return (
    <div className={`space-y-3 text-left ${className}`}>
      {/* Pronunciation Head */}
      <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[#141414]">
        <span>*</span>
        <span className="font-headline tracking-wide">[ voice-fy ]</span>
        <button
          onClick={handlePronounce}
          aria-label="Pronounce voice-fy"
          className={`p-1 rounded-full text-[#141414] hover:text-[#0060ca] hover:bg-[#141414]/5 transition-transform duration-200 active:scale-90 ${
            isPlaying ? 'scale-125 text-[#0060ca]' : ''
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Short Rule */}
      <div className="w-10 h-0.5 bg-[#141414]" />

      {/* Part of Speech & Definition */}
      <div className="space-y-1.5 max-w-md text-xs sm:text-sm text-[#141414] leading-relaxed">
        <p className="font-medium text-[#141414]/90">
          <span className="italic font-normal">verb</span> (voicefies, voicefying)
        </p>
        <p className="text-[#141414]/85">
          Screen for Parkinson&apos;s-linked acoustic patterns using a 5-second sustained vowel.
        </p>
        <p className="italic text-[#141414]/75">
          &ldquo;My voice just got checked!&rdquo;
        </p>
      </div>
    </div>
  );
};

export default DefinitionBlock;
