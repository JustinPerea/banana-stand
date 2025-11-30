import React from 'react';

interface BananaCharacterProps {
  size?: number;
  className?: string;
  variant?: 'happy' | 'cool' | 'wink' | 'surprised';
}

export const BananaCharacter = ({ size = 64, className = "", variant = 'happy' }: BananaCharacterProps) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      shapeRendering="crispEdges"
    >
      {/* --- Body --- */}
      <rect x="9" y="6" width="6" height="12" fill="#FACC15" />
      
      {/* --- Stem --- */}
      <rect x="11" y="4" width="2" height="2" fill="#A16207" />

      {/* --- Face Variants --- */}
      {variant === 'cool' ? (
        <>
            {/* Sunglasses */}
            <rect x="9" y="9" width="6" height="2" fill="#171717" />
            <rect x="15" y="9" width="1" height="1" fill="#171717" />
            <rect x="8" y="9" width="1" height="1" fill="#171717" />
            {/* Glint */}
            <rect x="10" y="9" width="1" height="1" fill="#FFFFFF" opacity="0.5" />
        </>
      ) : variant === 'wink' ? (
        <>
            {/* Left Eye (Open) */}
            <rect x="10" y="9" width="1" height="2" fill="#171717" />
            {/* Right Eye (Wink) */}
            <rect x="13" y="10" width="1" height="1" fill="#171717" />
            <rect x="14" y="10" width="1" height="1" fill="#171717" />
            {/* Blush */}
            <rect x="9" y="11" width="1" height="1" fill="#FDA4AF" />
            <rect x="15" y="11" width="1" height="1" fill="#FDA4AF" />
        </>
      ) : variant === 'surprised' ? (
        <>
             {/* Eyes */}
            <rect x="10" y="9" width="1" height="2" fill="#171717" />
            <rect x="13" y="9" width="1" height="2" fill="#171717" />
        </>
      ) : (
        // Happy (Default)
        <>
             {/* Eyes */}
            <rect x="10" y="9" width="1" height="2" fill="#171717" />
            <rect x="13" y="9" width="1" height="2" fill="#171717" />
            {/* Blush */}
            <rect x="9" y="11" width="1" height="1" fill="#FDA4AF" />
            <rect x="14" y="11" width="1" height="1" fill="#FDA4AF" />
        </>
      )}

      {/* --- Mouth --- */}
      {variant === 'surprised' ? (
          <rect x="11" y="13" width="2" height="2" fill="#171717" />
      ) : (
          <rect x="11" y="13" width="2" height="1" fill="#171717" opacity={variant === 'cool' ? 0.6 : 1} />
      )}

      {/* --- Arms --- */}
      {/* Left Arm */}
      <rect x="7" y="10" width="2" height="4" fill="#FACC15" />
      {/* Right Arm */}
      <rect x="15" y="10" width="2" height="4" fill="#FACC15" />

      {/* --- Legs --- */}
      <rect x="10" y="18" width="1" height="3" fill="#FACC15" />
      <rect x="13" y="18" width="1" height="3" fill="#FACC15" />
      
      {/* --- Shoes --- */}
      <rect x="9" y="21" width="2" height="1" fill="#171717" />
      <rect x="13" y="21" width="2" height="1" fill="#171717" />

    </svg>
  );
};

export default BananaCharacter;

