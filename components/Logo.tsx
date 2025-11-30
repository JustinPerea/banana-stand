
import React from 'react';

export const BananaIcon = ({ size = 48, className = "" }: { size?: number, className?: string }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      // crispEdges ensures the pixels stay sharp and don't blur
      shapeRendering="crispEdges" 
    >
      {/* --- THE AWNING (Roof) --- */}
      {/* Red Stripes */}
      <rect x="2" y="2" width="4" height="4" fill="#EF4444" />
      <rect x="10" y="2" width="4" height="4" fill="#EF4444" />
      <rect x="18" y="2" width="4" height="4" fill="#EF4444" />
      {/* White Stripes */}
      <rect x="6" y="2" width="4" height="4" fill="#FFFFFF" />
      <rect x="14" y="2" width="4" height="4" fill="#FFFFFF" />
      
      {/* Awning Shadow/Trim */}
      <rect x="2" y="6" width="20" height="1" fill="#B91C1C" />

      {/* --- THE BOOTH STRUTS --- */}
      <rect x="3" y="6" width="2" height="10" fill="#92400E" />
      <rect x="19" y="6" width="2" height="10" fill="#92400E" />

      {/* --- THE BANANA CHARACTER --- */}
      {/* Body */}
      <rect x="9" y="7" width="6" height="9" fill="#FACC15" /> 
      {/* Stem */}
      <rect x="11" y="5" width="2" height="2" fill="#A16207" />
      {/* Eyes (Black) */}
      <rect x="10" y="10" width="1" height="2" fill="#000000" />
      <rect x="13" y="10" width="1" height="2" fill="#000000" />
      {/* Smile (Reddish/Pink) */}
      <rect x="11" y="13" width="2" height="1" fill="#FDA4AF" />

      {/* --- THE WOODEN COUNTER --- */}
      {/* Main Wood Plank */}
      <rect x="2" y="16" width="20" height="6" fill="#D97706" />
      {/* Wood Grain/Shadow details */}
      <rect x="2" y="16" width="20" height="1" fill="#B45309" />
      <rect x="2" y="21" width="20" height="1" fill="#92400E" />
      {/* Nails/Bolts */}
      <rect x="3" y="17" width="1" height="1" fill="#78350F" />
      <rect x="20" y="17" width="1" height="1" fill="#78350F" />
      <rect x="3" y="20" width="1" height="1" fill="#78350F" />
      <rect x="20" y="20" width="1" height="1" fill="#78350F" />
      
      {/* --- SIGN TEXT (Abstract representation) --- */}
      <rect x="6" y="18" width="12" height="2" fill="#FEF3C7" />
      <rect x="7" y="18.5" width="2" height="1" fill="#92400E" /> {/* "T" or text blob */}
      <rect x="10" y="18.5" width="4" height="1" fill="#92400E" /> {/* "TEXT" blob */}
      <rect x="15" y="18.5" width="2" height="1" fill="#92400E" /> {/* "T" blob */}

    </svg>
  );
};

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 select-none ${className}`}>
    <div className="relative flex-shrink-0 drop-shadow-md hover:scale-105 transition-transform duration-300">
      <BananaIcon size={56} />
    </div>
    <div className="flex flex-col justify-center">
      <h1 className="font-black text-2xl tracking-tighter leading-none text-stone-900 dark:text-stone-100 transition-colors">
        THE <span className="text-yellow-500">BANANA</span> STAND
      </h1>
      <div className="flex items-center gap-2">
        <span className="bg-black text-yellow-400 text-[0.6rem] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          EST. 2025
        </span>
        <span className="text-[0.65rem] font-bold text-stone-500 uppercase tracking-widest">
          Nano Banana Pro App Store
        </span>
      </div>
    </div>
  </div>
);

export default Logo;
