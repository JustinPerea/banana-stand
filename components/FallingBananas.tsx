import React, { useEffect, useState } from 'react';

const FallingBananas = () => {
  const [bananas, setBananas] = useState<{ id: number; left: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    const count = 15; // Number of falling bananas
    const newBananas = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position (%)
      delay: Math.random() * 5, // Random start delay (s)
      duration: 4 + Math.random() * 6, // Random fall duration (s)
      size: 20 + Math.random() * 20, // Random size (px)
    }));
    setBananas(newBananas);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {bananas.map((banana) => (
        <div
          key={banana.id}
          className="absolute top-[-50px] animate-fall opacity-10 dark:opacity-5"
          style={{
            left: `${banana.left}%`,
            fontSize: `${banana.size}px`,
            animationDuration: `${banana.duration}s`,
            animationDelay: `${banana.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          }}
        >
          🍌
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-50px) rotate(0deg); }
          100% { transform: translateY(400px) rotate(360deg); } 
        }
        .animate-fall {
            animation-name: fall;
        }
      `}</style>
    </div>
  );
};

export default FallingBananas;

