
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
import { ToastProvider, useToast } from './components/ToastProvider';
import { RecipeStore } from './services/recipeStore';
import { checkApiKey, requestApiKey, isAIStudioAvailable } from './services/geminiService';
import { supabase } from './services/supabase';
import { User } from '@supabase/supabase-js';

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
  }, [showKeyModal]); // Re-check key when modal closes

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
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 px-6 py-4 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div
            className="cursor-pointer group hover:opacity-90 transition-opacity"
            onClick={() => { setSelectedApp(null); setIsBuilding(false); setEditingRecipe(undefined); }}
          >
            <Logo />
          </div>
          <div className="flex gap-3 items-center">
            {/* Theme Toggle */}
            <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDark ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
            </button>

            {/* API Key Status Button - Only show if logged in */}
            {user && (
                <button
                onClick={handleKeyClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${hasKey ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                title={isAIStudioAvailable() ? "Select Google Project" : "Manage API Key"}
                >
                {hasKey ? (
                    <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    KEY ACTIVE
                    </>
                ) : (
                    <>
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    SET KEY
                    </>
                )}
                </button>
            )}

            {!isBuilding && !selectedApp && (
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
                  className="bg-stone-900 text-white font-bold px-5 py-2.5 rounded-full hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm flex items-center gap-2"
                >
                  <span className="text-lg">🔨</span> Build a Recipe
                </button>
              </>
            )}
            
            <div className="h-6 w-px bg-stone-200 mx-1 hidden md:block"></div>
            <UserMenu 
                user={user} 
                customApps={customApps}
                onSelectApp={setSelectedApp}
                onCreateNew={() => {
                    setEditingRecipe(undefined);
                    setIsBuilding(true);
                }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-8">

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
          />
        ) : (
          <MarketplaceView 
            customApps={customApps}
            communityApps={communityApps}
            onSelectApp={setSelectedApp}
            onCreateNew={() => {
              setEditingRecipe(undefined);
              setIsBuilding(true);
            }}
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
