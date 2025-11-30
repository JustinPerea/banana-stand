
import React, { useState, useEffect } from 'react';

const LOADING_STEPS = [
  "Initializing neural handshake...",
  "Analyzing input pixel tensors...",
  "Quantizing style vectors...",
  "fetching context from latent space...",
  "Applying subsurface scattering...",
  "Optimizing render output...",
  "Finalizing visual matrix..."
];

const RetroTerminalLoader: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= LOADING_STEPS.length) return;

    const timeout = setTimeout(() => {
      setLogs(prev => [...prev, LOADING_STEPS[stepIndex]]);
      setStepIndex(prev => prev + 1);
    }, Math.random() * 800 + 400); // Random delay between 400ms and 1200ms

    return () => clearTimeout(timeout);
  }, [stepIndex]);

  return (
    <div className="absolute inset-0 bg-stone-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-50 rounded-xl font-mono border-2 border-stone-800">
      <div className="w-full max-w-md bg-black border border-stone-700 rounded-lg p-4 shadow-2xl overflow-hidden relative">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 mb-4 border-b border-stone-800 pb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-stone-500 text-xs ml-2">gemini_v3_proc.exe</span>
        </div>

        {/* Terminal Content */}
        <div className="space-y-2 font-mono text-sm h-48 flex flex-col justify-end">
            {logs.map((log, i) => (
                <div key={i} className="text-green-500 animate-in slide-in-from-left-2 fade-in duration-300">
                    <span className="text-stone-600 mr-2">{`>`}</span>
                    {log}
                </div>
            ))}
            <div className="flex items-center gap-1 text-green-400">
                 <span className="text-stone-600 mr-2">{`>`}</span>
                 <span className="animate-pulse">_</span>
            </div>
        </div>
        
        {/* Scanline Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
      </div>
      <p className="mt-4 text-xs text-stone-400 uppercase tracking-widest animate-pulse">Processing Request</p>
    </div>
  );
};

export default RetroTerminalLoader;
