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
          className="w-full h-auto drop-shadow-[0_20px_35px_rgba(255,90,31,0.25)]"
        >
          {/* Flame Aura & Outer Fire */}
          <g className="animate-flame">
            <path
              d="M250 15C280 65 310 110 295 160C330 115 385 130 380 190C415 170 445 200 440 250C475 240 485 285 470 330C495 345 500 390 475 430C455 465 420 485 380 495C330 508 170 508 120 495C80 485 45 465 25 430C0 390 5 345 30 330C15 285 25 240 60 250C55 200 85 170 120 190C115 130 170 115 205 160C190 110 220 65 250 15Z"
              fill="#FF5A1F"
              stroke="#FFF4DC"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Inner Yellow Flame Tongue */}
            <path
              d="M250 65C270 100 290 135 280 175C305 140 345 155 340 200C365 185 390 210 385 250C360 270 320 280 290 280C260 280 240 270 215 280C185 280 145 270 115 250C110 210 135 185 160 200C155 155 195 140 220 175C210 135 230 100 250 65Z"
              fill="#FFC21F"
              stroke="#141010"
              strokeWidth="3.5"
            />
          </g>

          {/* Sound Waves radiating left & right */}
          <g stroke="#FFF4DC" strokeWidth="4" strokeLinecap="round" opacity="0.9">
            <path d="M40 220C20 250 20 290 40 320" />
            <path d="M20 200C-5 245 -5 305 20 350" />
            <path d="M460 220C480 250 480 290 460 320" />
            <path d="M480 200C505 245 505 305 480 350" />
          </g>

          {/* Main Boombox Microphone Body (Near-Black with Cream Outline) */}
          <rect
            x="95"
            y="200"
            width="310"
            height="270"
            rx="28"
            fill="#141010"
            stroke="#FFF4DC"
            strokeWidth="6"
          />

          {/* Boombox Handle at the top */}
          <path
            d="M170 200V155C170 140 185 130 200 130H300C315 130 330 140 330 155V200"
            stroke="#FFF4DC"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Center Retro Microphone Capsule on top */}
          <rect
            x="215"
            y="95"
            width="70"
            height="110"
            rx="35"
            fill="#FF5A1F"
            stroke="#FFF4DC"
            strokeWidth="6"
          />
          {/* Mic Grille Lines */}
          <line x1="225" y1="125" x2="275" y2="125" stroke="#FFF4DC" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="220" y1="145" x2="280" y2="145" stroke="#FFF4DC" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="220" y1="165" x2="280" y2="165" stroke="#FFF4DC" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="225" y1="185" x2="275" y2="185" stroke="#FFF4DC" strokeWidth="3.5" strokeLinecap="round" />

          {/* Left Speaker Grille */}
          <g>
            <circle cx="170" cy="335" r="55" fill="#1b1616" stroke="#FFF4DC" strokeWidth="5" />
            <circle cx="170" cy="335" r="42" fill="#FF5A1F" stroke="#141010" strokeWidth="3" />
            <circle cx="170" cy="335" r="20" fill="#141010" stroke="#FFF4DC" strokeWidth="3.5" />
            {/* Speaker mesh rays */}
            <path d="M140 335H200M170 305V365" stroke="#FFF4DC" strokeWidth="2.5" opacity="0.6" />
          </g>

          {/* Right Speaker Grille */}
          <g>
            <circle cx="330" cy="335" r="55" fill="#1b1616" stroke="#FFF4DC" strokeWidth="5" />
            <circle cx="330" cy="335" r="42" fill="#FF5A1F" stroke="#141010" strokeWidth="3" />
            <circle cx="330" cy="335" r="20" fill="#141010" stroke="#FFF4DC" strokeWidth="3.5" />
            {/* Speaker mesh rays */}
            <path d="M300 335H360M330 305V365" stroke="#FFF4DC" strokeWidth="2.5" opacity="0.6" />
          </g>

          {/* Center Equalizer & Cassette Window */}
          <rect
            x="230"
            y="275"
            width="40"
            height="115"
            rx="8"
            fill="#1c1717"
            stroke="#FFF4DC"
            strokeWidth="3.5"
          />
          {/* Animated EQ Bars */}
          <rect x="236" y="340" width="6" height="42" rx="2" fill="#FFC21F" />
          <rect x="247" y="300" width="6" height="82" rx="2" fill="#FF5A1F" />
          <rect x="258" y="325" width="6" height="57" rx="2" fill="#FFC21F" />

          {/* Top Knobs & Buttons */}
          <circle cx="130" cy="235" r="10" fill="#FFC21F" stroke="#FFF4DC" strokeWidth="3" />
          <circle cx="160" cy="235" r="10" fill="#FF5A1F" stroke="#FFF4DC" strokeWidth="3" />
          <rect x="300" y="225" width="22" height="18" rx="4" fill="#FFF4DC" />
          <rect x="330" y="225" width="22" height="18" rx="4" fill="#FFF4DC" />
          <rect x="360" y="225" width="22" height="18" rx="4" fill="#FF5A1F" />

          {/* Playful Neo-Brutalist Sticker Face */}
          {/* Left Eye */}
          <ellipse cx="160" cy="275" rx="7" ry="10" fill="#FFF4DC" />
          <ellipse cx="162" cy="275" rx="3.5" ry="5" fill="#141010" />
          {/* Right Eye */}
          <ellipse cx="340" cy="275" rx="7" ry="10" fill="#FFF4DC" />
          <ellipse cx="342" cy="275" rx="3.5" ry="5" fill="#141010" />

          {/* Bottom Feet / Stand */}
          <rect x="135" y="465" width="45" height="15" rx="4" fill="#FF5A1F" stroke="#FFF4DC" strokeWidth="3.5" />
          <rect x="320" y="465" width="45" height="15" rx="4" fill="#FF5A1F" stroke="#FFF4DC" strokeWidth="3.5" />
        </svg>
      </div>
    </div>
  );
};

export default FlamingMascot;
