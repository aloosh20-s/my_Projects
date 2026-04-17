import React from 'react';

type LogoProps = {
  className?: string;
  horizontal?: boolean; // If true, places text next to the mark. If false, placed below.
  markSize?: number; // Size of the circular mark
};

export default function Logo({ className = '', horizontal = false, markSize = 44 }: LogoProps) {
  // Brand colors matched to the physical logo image
  const gold = "#C8A04C";
  const forestGreen = "#154138";
  const navy = "#1F2F4D";

  return (
    <div className={`flex ${horizontal ? 'flex-row items-center gap-3' : 'flex-col items-center gap-5'} ${className} decoration-transparent`}>
      {/* Mark */}
      <div 
        className="relative flex flex-col items-center justify-center rounded-full bg-white shadow-md shrink-0 focus:outline-none"
        style={{ 
          width: markSize, 
          height: markSize, 
          border: `min(2px, ${markSize * 0.05}px) solid ${gold}` 
        }}
      >
        <svg viewBox="0 0 100 100" className="w-[100%] h-[100%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
           {/* 'Y' in Navy */}
           <text x="56" y="58" fontFamily="'Times New Roman', Times, serif" fontSize="46" fontWeight="900" fill={navy} textAnchor="middle" letterSpacing="-2">Y</text>
           
           {/* 'S' in Green with White stroke to cut through 'Y' */}
           <text x="44" y="58" fontFamily="'Times New Roman', Times, serif" fontSize="46" fontWeight="900" fill="#ffffff" stroke="#ffffff" strokeWidth="3.5" strokeLinejoin="round" textAnchor="middle">S</text>
           <text x="44" y="58" fontFamily="'Times New Roman', Times, serif" fontSize="46" fontWeight="900" fill={forestGreen} textAnchor="middle">S</text>
           
           {/* Real Handshake Emoji underneath letters */}
           <text x="50" y="86" fontSize="24" textAnchor="middle" className="select-none pointer-events-none">🤝</text>
        </svg>
      </div>
      
      {/* Title & Tagline */}
      <div className={`flex flex-col justify-center ${horizontal ? 'pt-0.5' : 'items-center mt-2'}`}>
        <span 
          className={`font-extrabold uppercase tracking-[0.1em] font-sans ${horizontal ? 'text-[1.1rem] leading-tight' : 'text-3xl md:text-5xl leading-tight'}`}
          style={{ color: forestGreen }}
        >
          SOUQ ALYEMEN
        </span>
        <span 
          className={`italic font-serif leading-none whitespace-nowrap ${horizontal ? 'text-[0.55rem] tracking-[0.15em] mt-0.5' : 'text-sm md:text-lg tracking-[0.2em] mt-2'}`}
          style={{ color: '#5b6b68' }} // Dusty dark grey matching the dot spacing
        >
          • Heritage • Trust • Trade •
        </span>
      </div>
    </div>
  );
}
