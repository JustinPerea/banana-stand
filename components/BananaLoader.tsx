
import React, { useState, useEffect } from 'react';
import { BananaIcon } from './Logo';

const LOADING_MESSAGES = [
  "Peeling the pixels...",
  "Calculating potassium levels...",
  "Applying yellow filter...",
  "Mixing visual smoothie...",
  "Consulting the Banana Stand...",
  "Rendering 3D fruit textures...",
  "Polishing the awning..."
];

const BananaLoader: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-3xl transition-all duration-500">
      <div className="relative">
        {/* Animated Icon */}
        <div className="animate-bounce mb-8 drop-shadow-2xl">
           <BananaIcon size={96} />
        </div>
        
        {/* Shadow Pulse */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/10 dark:bg-black/30 rounded-[100%] animate-pulse blur-sm"></div>
      </div>

      {/* Loading Text */}
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight animate-pulse transition-colors">
            COOKING RECIPE
        </h3>
        <p className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest min-h-[20px] transition-colors">
            {LOADING_MESSAGES[msgIndex]}
        </p>
      </div>

      {/* Simple Progress Bar */}
      <div className="w-48 h-2 bg-stone-200 dark:bg-stone-700 rounded-full mt-6 overflow-hidden transition-colors">
          <div className="h-full bg-yellow-400 animate-[progress_2s_ease-in-out_infinite] w-full origin-left"></div>
      </div>

      <style>{`
        @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default BananaLoader;
