
import React, { useState, useEffect } from 'react';
import { BananaApp } from './types';
import AppRunner from './components/AppRunner';
import RecipeBuilder from './components/RecipeBuilder';
import Logo from './components/Logo';
import BananaCharacter from './components/BananaCharacter';
import ApiKeyModal from './components/ApiKeyModal';
import ImportRecipeModal from './components/ImportRecipeModal';
import MarketplaceView from './components/MarketplaceView';
import UserMenu from './components/UserMenu';
import UserProfile from './components/UserProfile';
import { ToastProvider, useToast } from './components/ToastProvider';
import { RecipeStore } from './services/recipeStore';
import { checkApiKey, requestApiKey, isAIStudioAvailable } from './services/geminiService';
import { supabase } from './services/supabase';
import { User } from '@supabase/supabase-js';
import { fetchAllAppStats, AppStats, getUserFavorites, toggleFavorite } from './services/statsService';
import { HistoryService, HistoryItem } from './services/historyService';
import { FLAGSHIP_APPS } from './constants';

// Separate content component to use the hook
const AppContent = () => {
  const { showToast } = useToast();
  // We keep custom apps separate from flagship apps
  const [customApps, setCustomApps] = useState<BananaApp[]>([]);
  const [communityApps, setCommunityApps] = useState<BananaApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<BananaApp | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<BananaApp | undefined>(undefined);

  // Key Management State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Theme State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
               (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // App Stats State
  const [appStats, setAppStats] = useState<Record<string, AppStats>>({});
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  // History State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [viewingHistoryItem, setViewingHistoryItem] = useState<HistoryItem | null>(null);

  // Profile View State
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);
  const [profileRecipes, setProfileRecipes] = useState<BananaApp[]>([]);
  const [profileFavorites, setProfileFavorites] = useState<BananaApp[]>([]);

  useEffect(() => {
      if (isDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
      }
  }, [isDark]);

  // Load custom apps from "Backend" (LocalStorage) on mount
  useEffect(() => {
    const loaded = RecipeStore.getCustomApps();
    setCustomApps(loaded);
    checkApiKey().then(setHasKey);

    // Load Community Apps
    RecipeStore.fetchCommunityRecipes().then(setCommunityApps);

    // Load App Stats
    fetchAllAppStats().then(setAppStats);

    // Load History
    setHistoryItems(HistoryService.getHistory());
  }, [showKeyModal]); // Re-check key when modal closes

  // Refresh history function
  const refreshHistory = () => {
    setHistoryItems(HistoryService.getHistory());
  };

  // Handle viewing a user profile
  const handleViewProfile = async (authorName: string) => {
    setViewingProfile(authorName);
    setSelectedApp(null);
    setIsBuilding(false);
    setViewingHistoryItem(null);

    // Fetch recipes by this author
    const recipes = await RecipeStore.fetchRecipesByAuthor(authorName);

    // For "Banana Stand" official, include flagship apps
    if (authorName === 'Banana Stand') {
      setProfileRecipes([...FLAGSHIP_APPS, ...recipes]);
    } else {
      setProfileRecipes(recipes);
    }

    // For now, favorites are empty for public profiles (would need public favorites table)
    // In the future, this could be populated if users opt to make their favorites public
    setProfileFavorites([]);
  };

  // Function to refresh stats (called after app runs)
  const refreshStats = () => {
    fetchAllAppStats().then(setAppStats);
  };

  // Auth Listener
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user favorites when user changes
  useEffect(() => {
    if (user) {
      getUserFavorites(user.id).then(setUserFavorites);
    } else {
      setUserFavorites([]);
    }
  }, [user]);

  // Handle favorite toggle
  const handleToggleFavorite = async (appId: string) => {
    if (!user) {
      showToast("Sign in to favorite apps!", 'error');
      return;
    }

    // Optimistic update
    const wasFavorited = userFavorites.includes(appId);
    if (wasFavorited) {
      setUserFavorites(prev => prev.filter(id => id !== appId));
    } else {
      setUserFavorites(prev => [...prev, appId]);
    }

    const newState = await toggleFavorite(user.id, appId);

    // If the toggle returned a different state than expected, revert
    if (newState !== !wasFavorited) {
      if (wasFavorited) {
        setUserFavorites(prev => [...prev, appId]);
      } else {
        setUserFavorites(prev => prev.filter(id => id !== appId));
      }
    }

    // Refresh stats to get updated favorite count
    refreshStats();
  };

  // Compute the actual BananaApp objects for favorites
  const allApps = [...FLAGSHIP_APPS, ...communityApps, ...customApps];
  const favoriteApps = userFavorites
    .map(id => allApps.find(app => app.id === id))
    .filter((app): app is BananaApp => app !== undefined);

  const handleSaveRecipe = (newApp: BananaApp) => {
    // Save to "Backend"
    const updatedCustomApps = RecipeStore.saveCustomApp(newApp);
    setCustomApps(updatedCustomApps);

    setIsBuilding(false);
    setEditingRecipe(undefined);
  };

  const handleRemix = (app: BananaApp) => {
    setEditingRecipe(app);
    setIsBuilding(true);
    setSelectedApp(null); // Close runner when starting remix
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const onImportRecipe = (app: BananaApp) => {
    const updated = RecipeStore.saveCustomApp(app);
    setCustomApps(updated);
    // Optional: Switch to the newly imported app or just show list
    setSelectedApp(null);
    setIsBuilding(false);
    showToast("Recipe Imported Successfully! 🍌", 'success');
  };

  const handlePublish = async (newApp: BananaApp) => {
    // 1. Save locally first
    handleSaveRecipe(newApp);

    // 2. Publish to Supabase
    const authorName = prompt("Enter your name for the community:", "Anonymous") || "Anonymous";
    const success = await RecipeStore.publishRecipe(newApp, authorName);

    if (success) {
      showToast("Published to Community Marketplace! 🌍", 'success');
      // Refresh community apps
      RecipeStore.fetchCommunityRecipes().then(setCommunityApps);
    } else {
      showToast("Failed to publish. Please check your connection.", 'error');
    }
  };

  const handleKeyClick = async () => {
    if (isAIStudioAvailable()) {
      await requestApiKey();
      // After they select, re-check (give it a small delay for propagation)
      setTimeout(() => {
        checkApiKey().then(setHasKey);
      }, 500);
    } else {
      setShowKeyModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 dark:text-stone-100 pb-20 transition-colors duration-300">
      
      {/* Beta Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-stone-900 text-[10px] font-black tracking-widest text-center py-1 uppercase shadow-sm relative z-[60]">
        🚧 BYOK Beta • Bring Your Own Key Phase
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 px-3 sm:px-6 py-3 sm:py-4 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-2">
          <div
            className="cursor-pointer group hover:opacity-90 transition-opacity shrink-0"
            onClick={() => { setSelectedApp(null); setIsBuilding(false); setEditingRecipe(undefined); setViewingHistoryItem(null); setViewingProfile(null); }}
          >
            <Logo />
          </div>
          <div className="flex gap-1.5 sm:gap-3 items-center">
            {/* Theme Toggle */}
            <button
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 sm:p-2 rounded-full text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDark ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
            </button>

            {/* API Key Status Button - Only show if logged in, hide text on small screens */}
            {user && (
                <button
                onClick={handleKeyClick}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full border text-[10px] sm:text-xs font-bold transition-all ${hasKey ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                title={isAIStudioAvailable() ? "Select Google Project" : "Manage API Key"}
                >
                {hasKey ? (
                    <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="hidden sm:inline">KEY ACTIVE</span>
                    <span className="sm:hidden">KEY</span>
                    </>
                ) : (
                    <>
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="hidden sm:inline">SET KEY</span>
                    <span className="sm:hidden">KEY</span>
                    </>
                )}
                </button>
            )}

            {!isBuilding && !selectedApp && !viewingProfile && !viewingHistoryItem && (
              <>
                <button
                  onClick={handleImport}
                  className="text-stone-500 font-bold px-4 py-2 rounded-full hover:bg-stone-100 transition-all text-sm hidden md:block"
                >
                  📥 Import
                </button>
                <button
                  onClick={() => {
                    setEditingRecipe(undefined);
                    setIsBuilding(true);
                  }}
                  className="bg-stone-900 text-white font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl active:scale-95 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                >
                  <span className="text-base sm:text-lg">🔨</span>
                  <span className="hidden sm:inline">Build a Recipe</span>
                  <span className="sm:hidden">Build</span>
                </button>
              </>
            )}

            <div className="h-6 w-px bg-stone-200 mx-0.5 sm:mx-1 hidden sm:block"></div>
            <UserMenu
                user={user}
                customApps={customApps}
                favoriteApps={favoriteApps}
                historyItems={historyItems}
                onSelectApp={setSelectedApp}
                onCreateNew={() => {
                    setEditingRecipe(undefined);
                    setIsBuilding(true);
                }}
                onHistoryItemClick={setViewingHistoryItem}
                onHistoryUpdate={refreshHistory}
                onViewProfile={user ? () => {
                    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                    handleViewProfile(userName);
                } : undefined}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8">

        {isBuilding ? (
          <RecipeBuilder
            initialData={editingRecipe}
            onSave={handleSaveRecipe}
            onPublish={handlePublish}
            onCancel={() => { setIsBuilding(false); setEditingRecipe(undefined); }}
          />
        ) : selectedApp ? (
          <AppRunner
            app={selectedApp}
            onBack={() => setSelectedApp(null)}
            onRemix={() => handleRemix(selectedApp)}
            onOpenSettings={() => setShowKeyModal(true)}
            onStatsUpdate={refreshStats}
            onHistoryUpdate={refreshHistory}
          />
        ) : viewingProfile ? (
          /* User Profile View */
          <UserProfile
            authorName={viewingProfile}
            authorRecipes={profileRecipes}
            authorFavorites={profileFavorites}
            onSelectApp={setSelectedApp}
            onBack={() => setViewingProfile(null)}
            appStats={appStats}
            userFavorites={userFavorites}
            onToggleFavorite={user ? handleToggleFavorite : undefined}
            onAuthorClick={handleViewProfile}
          />
        ) : viewingHistoryItem ? (
          /* History Image Viewer */
          <div className="max-w-5xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setViewingHistoryItem(null)}
                className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white font-medium flex items-center gap-2 transition-colors"
              >
                ← Back to Store
              </button>
              <div className="flex gap-2">
                <a
                  href={viewingHistoryItem.imageData}
                  download={`${viewingHistoryItem.appName}-${new Date(viewingHistoryItem.createdAt).getTime()}.png`}
                  className="px-4 py-2 bg-yellow-400 rounded-lg font-bold shadow-sm hover:bg-yellow-300 text-black transition-colors"
                >
                  Download
                </a>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-2 md:p-4 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 transition-colors">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{viewingHistoryItem.appEmoji}</span>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">{viewingHistoryItem.appName}</h3>
                    <p className="text-xs text-stone-500">{new Date(viewingHistoryItem.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-bold">FROM HISTORY</span>
              </div>
              <div className="w-full rounded-xl overflow-hidden relative min-h-[300px] bg-stone-50 dark:bg-stone-950 flex items-center justify-center transition-colors">
                <img
                  src={viewingHistoryItem.imageData}
                  className="w-full h-auto object-contain max-h-[80vh]"
                  alt="History Result"
                />
              </div>
            </div>
          </div>
        ) : (
          <MarketplaceView
            customApps={customApps}
            communityApps={communityApps}
            onSelectApp={setSelectedApp}
            onCreateNew={() => {
              setEditingRecipe(undefined);
              setIsBuilding(true);
            }}
            appStats={appStats}
            userFavorites={userFavorites}
            onToggleFavorite={user ? handleToggleFavorite : undefined}
            onAuthorClick={handleViewProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-stone-400 dark:text-stone-600 text-sm font-medium border-t border-stone-200 dark:border-stone-800 mt-auto transition-colors">
        <p>© 2025 The Banana Stand • Powered by Google Gemini 3 Pro</p>
        <div className="flex justify-center gap-4 mt-6 opacity-50 hover:opacity-100 transition-opacity duration-500">
            <BananaCharacter size={32} variant="happy" />
            <BananaCharacter size={32} variant="cool" />
            <BananaCharacter size={32} variant="wink" />
            <BananaCharacter size={32} variant="surprised" />
        </div>
      </footer>

      {showKeyModal && <ApiKeyModal onClose={() => setShowKeyModal(false)} />}
      {showImportModal && (
        <ImportRecipeModal 
          onClose={() => setShowImportModal(false)} 
          onImport={onImportRecipe} 
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
