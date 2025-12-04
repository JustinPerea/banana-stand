
import React, { useState, useMemo } from 'react';
import { BananaApp } from '../types';
import AppCard from './AppCard';
import SkeletonCard from './SkeletonCard';
import { FLAGSHIP_APPS, APP_CATEGORIES } from '../constants';
import FallingBananas from './FallingBananas';
import { AppStats } from '../services/statsService';

interface MarketplaceViewProps {
  customApps: BananaApp[];
  communityApps: BananaApp[];
  onSelectApp: (app: BananaApp) => void;
  onCreateNew: () => void;
  appStats: Record<string, AppStats>;
  userFavorites: string[];
  onToggleFavorite?: (appId: string) => void;
  onAuthorClick?: (author: string) => void;
  isLoadingCommunity?: boolean;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  customApps,
  communityApps,
  onSelectApp,
  onCreateNew,
  appStats,
  userFavorites,
  onToggleFavorite,
  onAuthorClick,
  isLoadingCommunity = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Dynamically extract categories from all available apps, but respect the library order
  const categories = useMemo(() => {
    const allApps = [...customApps, ...communityApps, ...FLAGSHIP_APPS];
    // Get all used categories
    const usedCategories = Array.from(new Set(allApps.map(app => app.category).filter(Boolean))) as string[];
    
    // Sort logic: Library order first, then alphabetical for custom ones
    const libraryOrder = APP_CATEGORIES.map(c => c.label);
    
    usedCategories.sort((a, b) => {
        const idxA = libraryOrder.indexOf(a);
        const idxB = libraryOrder.indexOf(b);
        
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    return ['All', ...usedCategories];
  }, [customApps, communityApps]);

  // Filter lists based on selection
  const filterApps = (apps: BananaApp[]) => {
    let result = apps;

    if (selectedCategory !== 'All') {
        result = result.filter(app => app.category === selectedCategory);
    }

    if (selectedAuthor) {
        result = result.filter(app => (app.author || 'Anonymous') === selectedAuthor);
    }

    if (selectedTag) {
        result = result.filter(app => app.tags?.includes(selectedTag));
    }

    return result;
  };

  const filteredCustomApps = filterApps(customApps);
  const filteredCommunityApps = filterApps(communityApps);
  const filteredFlagshipApps = filterApps(FLAGSHIP_APPS);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative mb-6 sm:mb-8 text-center max-w-3xl mx-auto py-8 sm:py-12">
        <FallingBananas />
        <div className="relative z-10">
          <div className="inline-block bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full mb-3 sm:mb-4 border border-yellow-200">
            BETA • GEMINI 3 PRO ENABLED
          </div>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-stone-900 dark:text-stone-100 mb-4 sm:mb-6 tracking-tight leading-tight transition-colors">
          Build & Discover <br className="hidden sm:block" />
          <span className="relative inline-block">
            <span className="relative z-10">AI Image Apps.</span>
            <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-2 sm:h-3 bg-yellow-400 -rotate-1 z-0 opacity-60 mix-blend-multiply dark:mix-blend-normal"></span>
          </span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-stone-600 dark:text-stone-400 font-medium max-w-2xl mx-auto leading-relaxed transition-colors px-2">
          The community marketplace for Gemini 3 Pro "Recipes." <br className="hidden sm:block" />
          Turn your prompts into shareable micro-apps that transform any photo in seconds.
        </p>
        </div>
      </div>

      {/* Category Menu - adjust top offset for mobile header */}
      <div className="sticky top-[57px] sm:top-[73px] z-40 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-sm py-3 sm:py-4 mb-6 sm:mb-8 -mx-3 sm:-mx-6 px-3 sm:px-6 border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
            
            {/* Active Filters Bar */}
            {(selectedAuthor || selectedTag) && (
                <div className="flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-top-2">
                    <span className="text-xs font-bold uppercase text-stone-400 mr-1">Active Filters:</span>
                    
                    {/* Author Filter Badge */}
                    {selectedAuthor && (
                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full pl-3 pr-1 py-1 shadow-sm">
                            <span className="text-xs text-yellow-800 dark:text-yellow-200 font-bold flex items-center gap-1">
                                <span>👤</span> {selectedAuthor}
                            </span>
                            <button 
                                onClick={() => setSelectedAuthor(null)}
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-white dark:bg-stone-800 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors text-[10px]"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Tag Filter Badge */}
                    {selectedTag && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full pl-3 pr-1 py-1 shadow-sm">
                            <span className="text-xs text-blue-800 dark:text-blue-200 font-bold flex items-center gap-1">
                                <span>#</span> {selectedTag}
                            </span>
                            <button 
                                onClick={() => setSelectedTag(null)}
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-white dark:bg-stone-800 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors text-[10px]"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={() => { setSelectedAuthor(null); setSelectedTag(null); }}
                        className="text-xs font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 ml-auto underline"
                    >
                        Clear All
                    </button>
                </div>
            )}

            <div className="overflow-x-auto no-scrollbar flex gap-2 pb-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as string)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border
                ${selectedCategory === category 
                  ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-md transform scale-105' 
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800 dark:hover:bg-stone-800 dark:hover:border-stone-700'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-12 pb-12">

        {/* Community Recipes Section */}
        <section>
          <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2 transition-colors">
            <span>🌍</span> Community Marketplace
          </h3>
          
          {isLoadingCommunity ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <SkeletonCard count={6} />
            </div>
          ) : filteredCommunityApps.length === 0 && filteredFlagshipApps.length === 0 ? (
             <div className="text-center py-20 text-stone-400 dark:text-stone-500">
               <div className="text-4xl mb-4">🌪️</div>
               <p className="font-bold">No apps found.</p>
               <p className="text-sm mt-1 opacity-70">
                    Try adjusting your filters to see more results.
               </p>
               <button
                 onClick={() => { setSelectedCategory('All'); setSelectedAuthor(null); setSelectedTag(null); }}
                 className="mt-4 text-yellow-600 dark:text-yellow-500 hover:underline font-bold text-sm"
               >
                 Clear All Filters
               </button>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredCommunityApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onClick={onSelectApp}
                  onAuthorClick={onAuthorClick || setSelectedAuthor}
                  onTagClick={setSelectedTag}
                  stats={appStats[app.id]}
                  isFavorited={userFavorites.includes(app.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
              {filteredFlagshipApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onClick={onSelectApp}
                  onAuthorClick={onAuthorClick || setSelectedAuthor}
                  onTagClick={setSelectedTag}
                  stats={appStats[app.id]}
                  isFavorited={userFavorites.includes(app.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default MarketplaceView;

