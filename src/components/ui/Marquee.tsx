import React from 'react';

interface MarqueeProps {
  text: string;
  speed?: number;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  text,
  speed = 28,
  className = '',
}) => {
  const content = `${text} `;

  return (
    <div
      className={`relative w-full overflow-hidden select-none py-3.5 border-y border-[#D9B08C]/40 bg-[#D1E8E2]/25 ${className}`}
      aria-hidden="true"
    >
      <div
        className="flex whitespace-nowrap animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        <span className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-wide text-[#2C3531]/75 uppercase px-6">
          {content}
        </span>
        <span className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-wide text-[#2C3531]/75 uppercase px-6">
          {content}
        </span>
      </div>
    </div>
  );
};

export default Marquee;
