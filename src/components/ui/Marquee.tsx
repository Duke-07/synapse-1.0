import React from 'react';

interface MarqueeProps {
  text: string;
  speed?: number; // seconds for one complete cycle
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  text,
  speed = 22,
  className = '',
}) => {
  const content = `${text} `;

  return (
    <div
      className={`relative w-full overflow-hidden select-none py-3 border-y border-[#141414]/15 bg-transparent ${className}`}
      aria-hidden="true"
    >
      <div
        className="flex whitespace-nowrap animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        <span
          className="font-headline text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider text-transparent uppercase px-4 [-webkit-text-stroke:1.5px_#141414]"
        >
          {content}
        </span>
        <span
          className="font-headline text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider text-transparent uppercase px-4 [-webkit-text-stroke:1.5px_#141414]"
        >
          {content}
        </span>
      </div>
    </div>
  );
};

export default Marquee;
