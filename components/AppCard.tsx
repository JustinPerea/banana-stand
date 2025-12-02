
import React, { useMemo, useState } from 'react';
import { BananaApp } from '../types';
import { BananaIcon } from './Logo';
import { AppStats } from '../services/statsService';

interface AppCardProps {
  app: BananaApp;
  onClick: (app: BananaApp) => void;
  onAuthorClick?: (author: string) => void;
  onTagClick?: (tag: string) => void;
  stats?: AppStats;
  isFavorited?: boolean;
  onToggleFavorite?: (appId: string) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onClick, onAuthorClick, onTagClick, stats, isFavorited, onToggleFavorite }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && gallery.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
    }
    if (isRightSwipe && gallery.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }
  };

  // Use real stats from database, fall back to 0 if not available
  const usageCount = stats?.usage_count ?? 0;
  const favoriteCount = stats?.favorite_count ?? 0;

  // Construct gallery from available images
  const gallery = useMemo(() => {
     // If we have both input and output, the first "slide" is a split view
     // We represent this with a special object structure that our renderer will handle
     const items: Array<{ url: string; label: string | null; type?: 'split'; otherUrl?: string | string[] }> = [];
     const hasSplitView = !!(app.example_input_image && app.example_output_image);

     if (hasSplitView) {
         items.push({
             url: app.example_output_image!, // Main view (Right)
             otherUrl: app.example_input_image!, // Split view (Left)
             label: 'Before / After',
             type: 'split'
         });
     } else if (app.cover_image) {
         items.push({ url: app.cover_image, label: null });
     }

     // Add individual images
     // We skip the standalone "Input" image if we already have the split view, as requested.
     if (!hasSplitView && app.example_input_image) {
        if (Array.isArray(app.example_input_image)) {
            items.push({ url: app.example_input_image[0], label: 'Input' });
        } else {
            items.push({ url: app.example_input_image, label: 'Input' });
        }
     }
     
     if (app.example_output_image) items.push({ url: app.example_output_image, label: 'Result' });
     
     // Add additional gallery images
     if (app.additional_images) {
         app.additional_images.forEach(img => {
             items.push({ url: img.url, label: img.label });
         });
     }
     
     // Deduplicate: If cover image is same as output, we might have duplicates, but for now it's fine.
     return items;
  }, [app]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the app
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the app
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const currentItem = gallery[currentImageIndex];

  return (
    <div 
      onClick={() => onClick(app)}
      className="group relative flex flex-col h-full bg-white dark:bg-stone-900 rounded-2xl border-2 border-stone-200 dark:border-stone-800 transition-all duration-200 cursor-pointer
                 hover:-translate-y-1 hover:border-black dark:hover:border-stone-400 hover:shadow-[6px_6px_0px_0px_#FACC15] dark:hover:shadow-[6px_6px_0px_0px_#78350F]"
    >
      {/* --- Image Section --- */}
      <div
        className="relative h-64 w-full overflow-hidden rounded-t-[14px] border-b-2 border-stone-100 dark:border-stone-800 group-hover:border-stone-900 dark:group-hover:border-stone-500 transition-colors bg-stone-100 dark:bg-stone-800"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        
        {currentItem.type === 'split' && currentItem.otherUrl ? (
            <div className="relative w-full h-full flex flex-col sm:flex-row">
                {/* Left/Top Half (Input) */}
                <div className="relative w-full sm:w-1/2 h-1/2 sm:h-full border-b sm:border-b-0 sm:border-r border-white/20 overflow-hidden flex flex-col">
                    {Array.isArray(currentItem.otherUrl) ? (
                        <>
                            <div className="h-1/2 w-full relative border-b border-white/20">
                                <img
                                    src={currentItem.otherUrl[0]}
                                    alt="Before 1"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="h-1/2 w-full relative">
                                <img
                                    src={currentItem.otherUrl[1]}
                                    alt="Before 2"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </>
                    ) : (
                        <img
                            src={currentItem.otherUrl}
                            alt="Before"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 bg-black/60 text-white text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md backdrop-blur-md shadow-sm">ORIGINAL</div>
                </div>
                {/* Right/Bottom Half (Output) */}
                <div className="relative w-full sm:w-1/2 h-1/2 sm:h-full overflow-hidden">
                    <img
                        src={currentItem.url}
                        alt="After"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-yellow-400 text-black text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm">REMIX</div>
                </div>

                {/* Center Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-30 border-2 border-stone-100">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-stone-900 sm:w-[14px] sm:h-[14px] rotate-90 sm:rotate-0"><path d="M5 12h14m-4 4l4-4-4-4"/></svg>
                </div>
            </div>
        ) : (
            <img 
            key={currentItem.url} // Force fade effect when switching if we added animation, or just clean swap
            src={currentItem.url} 
            alt={app.name} 
            onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/FACC15/000?text=App+Preview';
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
        )}
        
        {/* Navigation Arrows (Only if multiple images) */}
        {gallery.length > 1 && (
            <>
                {/* Left Arrow - visible on mobile, hover on desktop */}
                <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center shadow-md backdrop-blur-sm opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-30 hover:scale-110 active:scale-95"
                    title="Previous Image"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>

                {/* Right Arrow - visible on mobile, hover on desktop */}
                <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center shadow-md backdrop-blur-sm opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-30 hover:scale-110 active:scale-95"
                    title="Next Image"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>

                {/* Dots Indicator - always visible, indicates swipeable */}
                 <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
                    {gallery.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 md:w-1.5 md:h-1.5 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                        />
                    ))}
                 </div>
            </>
        )}

        {/* Label Badge (Input vs Result) */}
        {currentItem.label && (
             <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-20 shadow-sm animate-in fade-in duration-300">
                {currentItem.label}
             </div>
        )}

        {/* Top Right Tag */}
        <div className="absolute top-3 right-3 flex gap-2 z-20">
            {app.category && (
                <div className="bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    {app.category}
                </div>
            )}
            <div className="bg-yellow-400 text-black border border-black/10 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                GEMINI 3 PRO
            </div>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-black text-xl text-stone-900 dark:text-stone-100 leading-tight mb-1 group-hover:text-black dark:group-hover:text-white transition-colors flex items-center gap-2">
            <span>{app.emoji}</span>
            <span>{app.name}</span>
        </h3>
        
        <p className="text-sm text-stone-500 dark:text-stone-400 font-medium leading-relaxed line-clamp-2 mb-4 transition-colors">
            {app.tagline}
        </p>

        {/* Tags Row */}
        {app.tags && app.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
                {app.tags.map(tag => (
                    <button 
                        key={tag} 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onTagClick) onTagClick(tag);
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-full uppercase tracking-wide border border-stone-200 dark:border-stone-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-700 dark:hover:text-yellow-300 hover:border-yellow-200 dark:hover:border-yellow-800 transition-colors"
                    >
                        #{tag}
                    </button>
                ))}
            </div>
        )}

        {/* Footer Metadata */}
        <div className="mt-auto pt-4 border-t border-dashed border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wide transition-colors">
            
            {/* Author / Creator Indicator */}
            <div className="flex items-center gap-2">
                {app.author === 'Banana Stand' ? (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onAuthorClick) onAuthorClick('Banana Stand');
                        }}
                        className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 transition-colors"
                        title="View Official Apps"
                    >
                        <BananaIcon size={16} />
                        <span>Banana Stand</span>
                    </button>
                ) : (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onAuthorClick) onAuthorClick(app.author || 'Anonymous');
                        }}
                        className="flex items-center gap-1.5 hover:text-stone-600 dark:hover:text-stone-300 transition-colors group/author"
                    >
                        <div className="w-4 h-4 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center text-[10px] group-hover/author:bg-stone-300 dark:group-hover/author:bg-stone-600 transition-colors">👤</div>
                        <span className="group-hover/author:underline">{app.author || 'Anonymous'}</span>
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-stone-400 dark:text-stone-500" title="Total Runs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    {usageCount.toLocaleString()}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleFavorite) onToggleFavorite(app.id);
                    }}
                    className={`flex items-center gap-1 transition-colors ${onToggleFavorite ? 'hover:text-red-500 cursor-pointer' : 'cursor-default'}`}
                    title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                    disabled={!onToggleFavorite}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "currentColor"} className={`transition-colors ${isFavorited ? 'text-red-500' : 'text-stone-300 dark:text-stone-600'} ${onToggleFavorite ? 'hover:text-red-400' : ''}`}>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {favoriteCount.toLocaleString()}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
