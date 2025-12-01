
import React, { useState, useRef, useEffect } from 'react';
import { BananaApp } from '../types';
import { runBananaRecipe, checkApiKey } from '../services/geminiService';
import BeforeAfterSlider from './BeforeAfterSlider';
import BananaLoader from './BananaLoader';
import { incrementUsageCount } from '../services/statsService';

interface AppRunnerProps {
  app: BananaApp;
  onBack: () => void;
  onRemix: () => void;
  onOpenSettings?: () => void;
  onStatsUpdate?: () => void;
}

const AppRunner: React.FC<AppRunnerProps> = ({ app, onBack, onRemix, onOpenSettings, onStatsUpdate }) => {
  const [inputs, setInputs] = useState<Record<string, string | File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  // Header Carousel State
  const [currentHeaderIndex, setCurrentHeaderIndex] = useState(0);

  // Construct header gallery (Main Result + Additional Images)
  const headerGallery = React.useMemo(() => {
      const items = [];
      if (app.example_output_image) {
          items.push({ url: app.example_output_image, label: 'RESULT' });
      }
      if (app.additional_images) {
          items.push(...app.additional_images);
      }
      return items;
  }, [app]);

  const handleHeaderNext = () => {
      setCurrentHeaderIndex((prev) => (prev + 1) % headerGallery.length);
  };

  const handleHeaderPrev = () => {
      setCurrentHeaderIndex((prev) => (prev - 1 + headerGallery.length) % headerGallery.length);
  };

  const currentHeaderItem = headerGallery[currentHeaderIndex];

  // Camera State
  const [cameraActive, setCameraActive] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check for API key on mount and whenever it might change (re-focus etc, simplified here)
    const check = async () => {
        const val = await checkApiKey();
        setHasKey(val);
    };
    check();
    
    // Periodically check in case they added it via modal
    const interval = setInterval(check, 1000);

    return () => {
        stopCamera();
        clearInterval(interval);
    }
  }, []);

  const handleInputChange = (id: string, value: string | File) => {
    setInputs(prev => ({ ...prev, [id]: value }));
    
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, [id]: e.target?.result as string }));
      };
      reader.readAsDataURL(value);
    }
  };

  // --- Camera Logic ---

  const startCamera = async (inputId: string, mode: 'user' | 'environment' = 'environment') => {
    try {
      // Stop existing stream if switching
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setCameraActive(inputId);
      setFacingMode(mode);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode } 
      });
      streamRef.current = stream;
      
      // Small timeout to allow render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Could not access camera. Please check permissions.");
      setCameraActive(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(null);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      const newMode = facingMode === 'environment' ? 'user' : 'environment';
      startCamera(cameraActive, newMode);
    }
  };

  const capturePhoto = (inputId: string) => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // If using front camera, mirror the image horizontally for natural feel
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            handleInputChange(inputId, file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // --- Generation Logic ---

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setShowCompare(false); // Reset view to result only on new generation

    try {
      // Ensure we have a key (double check)
      const validKey = await checkApiKey();
      if (!validKey) {
        if (onOpenSettings) {
            onOpenSettings();
            setIsGenerating(false);
            return;
        }
        throw new Error("API Key is required to run this model.");
      }

      const response = await runBananaRecipe(app, inputs);
      
      // Parse output
      let foundImage = false;
      const parts = response.candidates?.[0]?.content?.parts;
      
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
             const base64 = part.inlineData.data;
             const mime = part.inlineData.mimeType || 'image/png';
             setResultImage(`data:${mime};base64,${base64}`);
             foundImage = true;
             break;
          }
        }
      }

      if (!foundImage) {
        const text = response.text;
        if (text) {
           throw new Error(`Model returned text instead of image: ${text.substring(0, 100)}...`);
        } else {
           throw new Error("No image generated.");
        }
      }

      // Increment usage count on successful generation
      await incrementUsageCount(app.id);
      if (onStatsUpdate) {
        onStatsUpdate();
      }

    } catch (err: any) {
      const msg = err.message || "Something went wrong.";
      setError(msg);
      
      // Auto-scroll to error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Render Result ---

  if (resultImage) {
    // Determine which image to show in "Before". 
    // We try to find the 'primary_image' or just the first image input available.
    const primaryInputId = app.inputs.find(i => i.type === 'image')?.id;
    const beforeImage = primaryInputId ? previews[primaryInputId] : null;

    return (
      <div className="max-w-5xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white font-medium flex items-center gap-2 transition-colors">
                ← Back to Store
            </button>
            <div className="flex gap-2">
                <button 
                  onClick={() => setResultImage(null)} 
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg font-medium hover:bg-stone-200 dark:hover:bg-stone-700 dark:text-stone-200 transition-colors"
                >
                    Try Again
                </button>
                <a 
                  href={resultImage} 
                  download={`${app.name}-remix.png`}
                  className="px-4 py-2 bg-yellow-400 rounded-lg font-bold shadow-sm hover:bg-yellow-300 text-black transition-colors"
                >
                    Download
                </a>
            </div>
         </div>

         <div className="bg-white dark:bg-stone-900 p-2 md:p-4 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 transition-colors">
             {/* Comparison Toggle */}
             {beforeImage && (
                 <div className="flex justify-end mb-3">
                     <button
                        onClick={() => setShowCompare(!showCompare)}
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${showCompare ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100' : 'bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500'}`}
                     >
                        {showCompare ? (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                Show Result Only
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14.987a2.2 2.2 0 0 1 1.96-2.028L12 12v6.074l-6.04-1.047a2.2 2.2 0 0 1-1.96-2.04zM16 4h4v4M12 12l5.88 5.88M20 16v4h-4M4 8V4h4"/></svg>
                                Compare Original
                            </>
                        )}
                     </button>
                 </div>
             )}

             <div className="w-full rounded-xl overflow-hidden relative min-h-[300px] bg-stone-50 dark:bg-stone-950 flex items-center justify-center transition-colors">
                 {showCompare && beforeImage ? (
                    <BeforeAfterSlider 
                        beforeImage={beforeImage} 
                        afterImage={resultImage} 
                        className="w-full"
                    />
                 ) : (
                    <img 
                        src={resultImage} 
                        className="w-full h-auto object-contain max-h-[80vh]" 
                        alt="Result" 
                    />
                 )}
             </div>
         </div>
      </div>
    );
  }

  // --- Render Form ---

  return (
    <>
        <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-800 my-8 relative overflow-hidden transition-colors">
        
        {isGenerating && <BananaLoader />}

        <button onClick={onBack} className="mb-6 text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 font-semibold text-sm transition-colors">
            ← BACK
        </button>

        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-colors">
            {app.emoji}
            </div>
            <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 transition-colors">{app.name}</h1>
            <p className="text-stone-500 dark:text-stone-400 transition-colors">{app.tagline}</p>
            </div>
        </div>

        {/* Description Section */}
        {app.description && (
          <div className="mb-6 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {app.description}
          </div>
        )}

        {/* --- Header Split Preview --- */}
        {app.example_input_image && headerGallery.length > 0 && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-sm border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800">
                <div className="relative w-full h-64 md:h-80 flex">
                    {/* Left Half (Input) */}
                    <div className="relative w-1/2 h-full border-r border-white/20 overflow-hidden flex flex-col">
                        {Array.isArray(app.example_input_image) ? (
                            <>
                                <div className="h-1/2 w-full relative border-b border-white/20">
                                    <img 
                                        src={app.example_input_image[0]} 
                                        alt="Example Input 1"
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div className="h-1/2 w-full relative">
                                    <img 
                                        src={app.example_input_image[1]} 
                                        alt="Example Input 2"
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                            </>
                        ) : (
                            <img 
                                src={app.example_input_image} 
                                alt="Example Input"
                                className="w-full h-full object-cover" 
                            />
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded-md backdrop-blur-md shadow-sm z-10">ORIGINAL</div>
                    </div>
                    
                    {/* Right Half (Output Carousel) */}
                    <div className="relative w-1/2 h-full overflow-hidden group">
                        <img 
                            key={currentHeaderItem.url}
                            src={currentHeaderItem.url} 
                            alt="Example Output"
                            className="w-full h-full object-cover animate-in fade-in duration-300"
                        />
                        <div className="absolute bottom-2 right-2 bg-yellow-400 text-black text-[9px] font-bold px-2 py-1 rounded-md shadow-sm z-10 uppercase">
                            {currentHeaderItem.label || 'RESULT'}
                        </div>

                        {/* Navigation Arrows */}
                        {headerGallery.length > 1 && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleHeaderPrev(); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleHeaderNext(); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                                
                                {/* Dots */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
                                    {headerGallery.map((_, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentHeaderIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Center Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-30 border-2 border-stone-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-stone-900"><path d="M5 12h14m-4 4l4-4-4-4"/></svg>
                    </div>
                </div>
            </div>
        )}

        {/* App Info / Guide Section */}
        {(app.input_tips || app.output_expectations) && (
            <div className="mb-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 md:p-5 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {app.input_tips && app.input_tips.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                                <span>💡</span> Best Inputs
                            </h3>
                            <ul className="space-y-1.5">
                                {app.input_tips.map((tip, i) => (
                                    <li key={i} className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0"></span>
                                        <span className="opacity-90">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {app.output_expectations && app.output_expectations.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-1.5">
                                <span>✨</span> What to Expect
                            </h3>
                            <ul className="space-y-1.5">
                                {app.output_expectations.map((expect, i) => (
                                    <li key={i} className="text-sm text-purple-900 dark:text-purple-100 flex items-start gap-2">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-400 shrink-0"></span>
                                        <span className="opacity-90">{expect}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900 text-sm">
                    {error}
                </div>
            )}

            {app.inputs.map((input) => (
            <div key={input.id}>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 transition-colors">
                {input.label} {input.optional && <span className="text-stone-400 dark:text-stone-600 font-normal">(Optional)</span>}
                </label>
                
                {input.type === 'image' ? (
                cameraActive === input.id ? (
                    // Camera View
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-lg group">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                        />
                        
                        {/* Camera Controls Overlay */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                            {/* Top Bar */}
                            <div className="flex justify-end">
                                <button 
                                    onClick={toggleCamera}
                                    className="text-white bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-all active:scale-95"
                                    title="Switch Camera"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 4v6h-6"></path>
                                        <path d="M1 20v-6h6"></path>
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* Bottom Bar */}
                            <div className="flex items-center justify-center relative">
                                <button 
                                    onClick={stopCamera}
                                    className="absolute left-0 text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full text-sm backdrop-blur-md font-medium"
                                >
                                    Cancel
                                </button>

                                <button 
                                    onClick={() => capturePhoto(input.id)}
                                    className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform bg-transparent"
                                    aria-label="Capture"
                                >
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Upload + Camera Start View
                    <div className="space-y-2">
                        <div className="relative group">
                            <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files && handleInputChange(input.id, e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${inputs[input.id] ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700'}`}>
                            {previews[input.id] ? (
                                <img src={previews[input.id]} alt="Preview" className="h-48 mx-auto rounded-lg object-contain shadow-sm" />
                            ) : (
                                <div className="space-y-2">
                                    <div className="mx-auto w-12 h-12 bg-white dark:bg-stone-700 rounded-full flex items-center justify-center shadow-sm text-stone-900 dark:text-stone-100">
                                        <span className="text-2xl">📷</span>
                                    </div>
                                    <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Drag & Drop or Click to Upload</p>
                                </div>
                            )}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => startCamera(input.id)}
                            className="w-full py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                            Use Camera
                        </button>
                    </div>
                )
                ) : input.type === 'select' ? (
                <select
                    className="w-full p-3 bg-stone-50 dark:bg-stone-800 dark:text-white border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    defaultValue=""
                >
                    <option value="" disabled>Select an option</option>
                    {input.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                ) : (
                <input
                    type="text"
                    placeholder={input.placeholder || "Type here..."}
                    className="w-full p-3 bg-stone-50 dark:bg-stone-800 dark:text-white border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                />
                )}
            </div>
            ))}

            {!hasKey && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex justify-between items-center transition-colors">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Billing Required:</strong> This app uses the advanced Gemini 3 Pro model.
                    </div>
                    <button 
                        onClick={() => onOpenSettings ? onOpenSettings() : null}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                    >
                        Connect API Key
                    </button>
                </div>
            )}

            <button
            onClick={handleGenerate}
            disabled={isGenerating || !hasKey}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
                isGenerating 
                ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed' 
                : hasKey 
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-black' 
                    : 'bg-stone-300 dark:bg-stone-700 text-stone-500 dark:text-stone-400 cursor-not-allowed'
            }`}
            >
            {isGenerating ? "Processing..." : !hasKey ? "Connect Key to Start" : "Run App 🚀"}
            </button>
            
            {!hasKey && (
                <p className="text-center text-xs text-stone-400 dark:text-stone-500">
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline">Billing info</a>
                </p>
            )}
        </div>
        </div>

        {/* Sticky Action Bar for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800 md:hidden z-40 flex items-center justify-between gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-stone-400">Ready?</span>
                <span className="text-xs font-bold text-stone-900 dark:text-white truncate max-w-[120px]">{app.name}</span>
             </div>
             <button
                onClick={handleGenerate}
                disabled={isGenerating || !hasKey}
                className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 ${
                    isGenerating 
                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-not-allowed' 
                    : hasKey 
                        ? 'bg-yellow-400 hover:bg-yellow-300 text-black' 
                        : 'bg-stone-300 dark:bg-stone-700 text-stone-500 cursor-not-allowed'
                }`}
            >
                {isGenerating ? "Processing..." : !hasKey ? "Key Needed" : "Run App 🚀"}
            </button>
        </div>

        {/* Remix Footer */}
        {(app.remixable !== false) && (
            <div className="max-w-2xl mx-auto mb-24 md:mb-12 text-center opacity-60 hover:opacity-100 transition-opacity">
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">Want to change how this app works?</p>
                <button 
                    onClick={onRemix}
                    className="text-stone-800 dark:text-stone-200 font-bold border-b-2 border-yellow-400 hover:bg-yellow-400 hover:border-transparent hover:text-stone-900 transition-all px-1"
                >
                    Remix this Recipe ⚡
                </button>
            </div>
        )}
    </>
  );
};

export default AppRunner;
