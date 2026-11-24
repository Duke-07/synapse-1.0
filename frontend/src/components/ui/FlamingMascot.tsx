'use client';

import React from 'react';

export const FlamingMascot: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <div className="animate-float">
        <svg
          viewBox="0 0 500 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-[0_16px_30px_rgba(17,100,102,0.18)]"
        >
          {/* Subtle Organic Sound Wave Glow */}
          <g className="animate-pulse" opacity="0.8">
            <path
              d="M250 25C280 70 310 115 295 165C330 120 385 135 380 195C415 175 445 205 440 255C475 245 485 290 470 335C495 350 500 395 475 435C455 470 420 490 380 500C330 512 170 512 120 500C80 490 45 470 25 435C0 395 5 350 30 335C15 290 25 245 60 255C55 205 85 175 120 195C115 135 170 120 205 165C190 115 220 70 250 25Z"
              fill="#D1E8E2"
              fillOpacity="0.35"
              stroke="#D9B08C"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Inner Resonance Petal */}
            <path
              d="M250 75C270 110 290 145 280 185C305 150 345 165 340 210C365 195 390 220 385 260C360 280 320 290 290 290C260 290 240 280 215 290C185 290 145 280 115 260C110 220 135 195 160 210C155 165 195 150 220 185C210 145 230 110 250 75Z"
              fill="#FFCB9A"
              fillOpacity="0.4"
              stroke="#D9B08C"
              strokeWidth="2"
            />
          </g>

          {/* Sound Waves radiating left & right */}
          <g stroke="#116466" strokeWidth="3" strokeLinecap="round" opacity="0.6">
            <path d="M40 220C20 250 20 290 40 320" />
            <path d="M20 200C-5 245 -5 305 20 350" />
            <path d="M460 220C480 250 480 290 460 320" />
            <path d="M480 200C505 245 505 305 480 350" />
          </g>

          {/* Core Architectural Sound Console */}
          <rect
            x="95"
            y="200"
            width="310"
            height="270"
            rx="28"
            fill="#2C3531"
            stroke="#D9B08C"
            strokeWidth="3.5"
          />

          {/* Console Handle */}
          <path
            d="M170 200V155C170 140 185 130 200 130H300C315 130 330 140 330 155V200"
            stroke="#D9B08C"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Phonation Microphone Capsule */}
          <rect
            x="215"
            y="95"
            width="70"
            height="110"
            rx="35"
            fill="#116466"
            stroke="#D9B08C"
            strokeWidth="3.5"
          />
          {/* Mic Grille Lines */}
          <line x1="225" y1="125" x2="275" y2="125" stroke="#D1E8E2" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="220" y1="145" x2="280" y2="145" stroke="#D1E8E2" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="220" y1="165" x2="280" y2="165" stroke="#D1E8E2" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="225" y1="185" x2="275" y2="185" stroke="#D1E8E2" strokeWidth="2.5" strokeLinecap="round" />

          {/* Left Speaker Transducer */}
          <g>
            <circle cx="170" cy="335" r="55" fill="#222926" stroke="#D9B08C" strokeWidth="3" />
            <circle cx="170" cy="335" r="42" fill="#116466" stroke="#2C3531" strokeWidth="2" />
            <circle cx="170" cy="335" r="20" fill="#2C3531" stroke="#FFCB9A" strokeWidth="2.5" />
            <path d="M140 335H200M170 305V365" stroke="#D1E8E2" strokeWidth="1.5" opacity="0.6" />
          </g>

          {/* Right Speaker Transducer */}
          <g>
            <circle cx="330" cy="335" r="55" fill="#222926" stroke="#D9B08C" strokeWidth="3" />
            <circle cx="330" cy="335" r="42" fill="#116466" stroke="#2C3531" strokeWidth="2" />
            <circle cx="330" cy="335" r="20" fill="#2C3531" stroke="#FFCB9A" strokeWidth="2.5" />
            <path d="M300 335H360M330 305V365" stroke="#D1E8E2" strokeWidth="1.5" opacity="0.6" />
          </g>

          {/* Center Equalizer & Audio Analyzer Window */}
          <rect
            x="230"
            y="275"
            width="40"
            height="115"
            rx="8"
            fill="#1c2220"
            stroke="#D9B08C"
            strokeWidth="2"
          />
          {/* Animated EQ Frequency Bars */}
          <rect x="236" y="340" width="6" height="42" rx="2" fill="#D1E8E2" />
          <rect x="247" y="300" width="6" height="82" rx="2" fill="#116466" />
          <rect x="258" y="325" width="6" height="57" rx="2" fill="#FFCB9A" />

          {/* Top Brass Knobs */}
          <circle cx="130" cy="235" r="10" fill="#D9B08C" stroke="#2C3531" strokeWidth="2" />
          <circle cx="160" cy="235" r="10" fill="#116466" stroke="#D9B08C" strokeWidth="2" />
          <rect x="300" y="225" width="22" height="18" rx="4" fill="#D1E8E2" />
          <rect x="330" y="225" width="22" height="18" rx="4" fill="#FFCB9A" />
          <rect x="360" y="225" width="22" height="18" rx="4" fill="#116466" />

          {/* Stylized Visual Focal Dots */}
          <circle cx="160" cy="275" r="5" fill="#FFCB9A" />
          <circle cx="340" cy="275" r="5" fill="#FFCB9A" />

          {/* Base Brass Feet */}
          <rect x="135" y="465" width="45" height="15" rx="4" fill="#D9B08C" stroke="#2C3531" strokeWidth="2" />
          <rect x="320" y="465" width="45" height="15" rx="4" fill="#D9B08C" stroke="#2C3531" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default FlamingMascot;
