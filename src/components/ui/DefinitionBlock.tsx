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
    <div className={`p-5 sm:p-6 rounded-2xl bg-[#2C3531] text-[#EBF4F1] border border-[#D9B08C]/30 shadow-sm space-y-3.5 text-left ${className}`}>
      {/* Pronunciation Head */}
      <div className="flex items-center gap-2.5 text-sm sm:text-base font-medium">
        <span className="text-[#FFCB9A] font-serif">*</span>
        <span className="font-serif tracking-wide text-[#FFCB9A] text-lg">[ voice-fy ]</span>
        <button
          onClick={handlePronounce}
          aria-label="Pronounce voice-fy"
          className={`p-1.5 rounded-full text-[#D1E8E2] hover:text-[#FFCB9A] hover:bg-white/10 transition-transform duration-200 active:scale-90 ${
            isPlaying ? 'scale-115 text-[#FFCB9A]' : ''
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Short Rule */}
      <div className="w-10 h-0.5 bg-[#D9B08C]" />

      {/* Part of Speech & Definition */}
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        <p className="font-medium text-[#D1E8E2]">
          <span className="italic font-normal text-[#D9B08C]">verb</span> (voicefies, voicefying)
        </p>
        <p className="text-[#D1E8E2]/90 font-sans">
          Screen for Parkinson&apos;s-linked acoustic patterns using a 5-second sustained vowel phonation.
        </p>
        <p className="italic text-[#FFCB9A]/80 font-serif text-xs">
          &ldquo;Early acoustic screening enables timely clinical neurology consultation.&rdquo;
        </p>
      </div>
    </div>
  );
};

export default DefinitionBlock;
