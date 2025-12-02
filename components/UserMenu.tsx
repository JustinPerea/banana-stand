
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { signInWithGoogle, signOut } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { BananaApp } from '../types';
import { HistoryItem, HistoryService } from '../services/historyService';

interface UserMenuProps {
    user: User | null;
    customApps: BananaApp[];
    favoriteApps: BananaApp[];
    historyItems: HistoryItem[];
    onSelectApp: (app: BananaApp) => void;
    onCreateNew: () => void;
    onHistoryItemClick?: (item: HistoryItem) => void;
    onHistoryUpdate?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, customApps, favoriteApps, historyItems, onSelectApp, onCreateNew, onHistoryItemClick, onHistoryUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipes' | 'favorites' | 'history'>('recipes');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    HistoryService.removeFromHistory(id);
    if (onHistoryUpdate) onHistoryUpdate();
  };

  const handleClearHistory = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      HistoryService.clearHistory();
      if (onHistoryUpdate) onHistoryUpdate();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
        <button 
            onClick={signInWithGoogle}
            className="text-sm font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 0.507 5.387 0 12s5.36 12 12 12c3.6 0 6.32-1.187 7.6-3.453 1.28-2.267 1.28-6.133 0-8.4l-7.6-.027z" />
            </svg>
            Sign In
        </button>
    );
  }

  return (
    <div className="relative">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 focus:outline-none"
        >
            {user.user_metadata?.avatar_url ? (
                <img 
                    src={user.user_metadata.avatar_url} 
                    alt="User" 
                    className="w-9 h-9 rounded-full border border-stone-200"
                />
            ) : (
                <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center font-bold border border-yellow-500 text-yellow-900">
                    {user.email?.[0].toUpperCase()}
                </div>
            )}
        </button>

        {isOpen && (
            <>
                {/* Mobile: Use portal to render outside header's stacking context */}
                {isMobile ? createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 z-[9998]"
                            onClick={() => setIsOpen(false)}
                        />
                        {/* Full screen menu */}
                        <div className="fixed inset-0 bg-white dark:bg-stone-900 z-[9999] flex flex-col animate-in slide-in-from-bottom duration-200">
                            <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0 safe-top">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                                            {user.user_metadata?.full_name || 'User'}
                                        </p>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="ml-2 p-2 -mr-2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex border-b border-stone-100 dark:border-stone-800 shrink-0">
                                <button
                                    onClick={() => setActiveTab('recipes')}
                                    className={`flex-1 px-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        activeTab === 'recipes'
                                            ? 'text-stone-900 dark:text-stone-100 border-b-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    Recipes ({customApps.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={`flex-1 px-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        activeTab === 'favorites'
                                            ? 'text-stone-900 dark:text-stone-100 border-b-2 border-red-400 bg-red-50 dark:bg-red-900/20'
                                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    <span className="flex items-center justify-center gap-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={activeTab === 'favorites' ? 'text-red-500' : ''}>
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                        </svg>
                                        ({favoriteApps.length})
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 px-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        activeTab === 'history'
                                            ? 'text-stone-900 dark:text-stone-100 border-b-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    <span className="flex items-center justify-center gap-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={activeTab === 'history' ? 'text-blue-500' : ''}>
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                        ({historyItems.length})
                                    </span>
                                </button>
                            </div>

                            {/* Content Area - Mobile */}
                            <div className="flex-1 overflow-y-auto p-3 safe-bottom">
                                {activeTab === 'recipes' ? (
                                    <>
                                        <div className="flex justify-end px-2 mb-2">
                                            <button
                                                onClick={() => { onCreateNew(); setIsOpen(false); }}
                                                className="text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 px-3 py-1.5 rounded transition-colors"
                                            >
                                                + New
                                            </button>
                                        </div>

                                        {customApps.length === 0 ? (
                                            <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-3xl opacity-50 grayscale">
                                                    🍌
                                                </div>
                                                <p className="text-sm font-bold text-stone-500 dark:text-stone-400">Your crate is empty.</p>
                                                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 mb-3 text-center leading-relaxed">
                                                    You haven't created any AI recipes yet.
                                                </p>
                                                <button
                                                    onClick={() => { onCreateNew(); setIsOpen(false); }}
                                                    className="text-sm bg-yellow-400 hover:bg-yellow-300 text-stone-900 font-bold px-4 py-3 rounded-lg transition-colors w-full shadow-sm border border-yellow-500"
                                                >
                                                    Build First Recipe
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {customApps.map(app => (
                                                    <button
                                                        key={app.id}
                                                        onClick={() => { onSelectApp(app); setIsOpen(false); }}
                                                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg group transition-colors"
                                                    >
                                                        <span className="text-2xl group-hover:scale-110 transition-transform">{app.emoji}</span>
                                                        <div className="min-w-0">
                                                            <p className="text-base font-bold text-stone-700 dark:text-stone-200 truncate group-hover:text-stone-900 dark:group-hover:text-white">{app.name}</p>
                                                            <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{app.tagline}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : activeTab === 'favorites' ? (
                                    <>
                                        {favoriteApps.length === 0 ? (
                                            <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-3xl opacity-50">
                                                    ❤️
                                                </div>
                                                <p className="text-sm font-bold text-stone-500 dark:text-stone-400">No favorites yet.</p>
                                                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 text-center leading-relaxed">
                                                    Click the heart on any app to save it here for quick access.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {favoriteApps.map(app => (
                                                    <button
                                                        key={app.id}
                                                        onClick={() => { onSelectApp(app); setIsOpen(false); }}
                                                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg group transition-colors"
                                                    >
                                                        <span className="text-2xl group-hover:scale-110 transition-transform">{app.emoji}</span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-base font-bold text-stone-700 dark:text-stone-200 truncate group-hover:text-stone-900 dark:group-hover:text-white">{app.name}</p>
                                                            <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{app.tagline}</p>
                                                        </div>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-400 shrink-0">
                                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* History Tab - Mobile */
                                    <>
                                        {historyItems.length > 0 && (
                                            <div className="flex justify-end px-2 mb-2">
                                                <button
                                                    onClick={handleClearHistory}
                                                    className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded transition-colors"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}

                                        {historyItems.length === 0 ? (
                                            <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-3xl opacity-50">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400 dark:text-stone-500">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <polyline points="12 6 12 12 16 14"/>
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-bold text-stone-500 dark:text-stone-400">No history yet.</p>
                                                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 text-center leading-relaxed">
                                                    Generated images will appear here.<br/>Up to 20 images saved locally.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                {historyItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                                                        onClick={() => {
                                                            if (onHistoryItemClick) onHistoryItemClick(item);
                                                            setIsOpen(false);
                                                        }}
                                                    >
                                                        <img
                                                            src={item.imageData}
                                                            alt={item.appName}
                                                            className="w-full aspect-square object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-lg">{item.appEmoji}</span>
                                                                <button
                                                                    onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                                                                    className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <p className="text-white text-xs font-bold truncate">{item.appName}</p>
                                                                <p className="text-white/70 text-[10px]">{formatDate(item.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 group-hover:opacity-0 transition-opacity">
                                                            <p className="text-white text-[10px] font-medium truncate">{item.appEmoji} {item.appName}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="border-t border-stone-100 dark:border-stone-800 p-2 shrink-0 safe-bottom">
                                <button
                                    onClick={() => {
                                        signOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-4 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors rounded-lg"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </>,
                    document.body
                ) : (
                    /* Desktop: Regular dropdown positioning */
                    <>
                        <div className="fixed inset-0 z-[99]" onClick={() => setIsOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                                            {user.user_metadata?.full_name || 'User'}
                                        </p>
                                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex border-b border-stone-100 dark:border-stone-800 shrink-0">
                                <button
                                    onClick={() => setActiveTab('recipes')}
                                    className={`flex-1 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                        activeTab === 'recipes'
                                            ? 'text-stone-900 dark:text-stone-100 border-b-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    Recipes ({customApps.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={`flex-1 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                        activeTab === 'favorites'
                                            ? 'text-stone-900 dark:text-stone-100 border-b-2 border-red-400 bg-red-50 dark:bg-red-900/20'
                                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    <span className="flex items-center justify-center gap-1">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className={activeTab === 'favorites' ? 'text-red-500' : ''}>
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                        </svg>
                                        ({favoriteApps.length})
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                        activeTab === 'history'
                                            ? 'text-stone-900 dark:text-stone-100 border-b-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    <span className="flex items-center justify-center gap-1">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={activeTab === 'history' ? 'text-blue-500' : ''}>
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                        ({historyItems.length})
                                    </span>
                                </button>
                            </div>

                            {/* Content Area - Desktop */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {activeTab === 'recipes' ? (
                                    <>
                                        <div className="flex justify-end px-2 mb-2">
                                            <button
                                                onClick={() => { onCreateNew(); setIsOpen(false); }}
                                                className="text-[10px] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 px-2 py-1 rounded transition-colors"
                                            >
                                                + New
                                            </button>
                                        </div>

                                        {customApps.length === 0 ? (
                                            <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-3xl opacity-50 grayscale">
                                                    🍌
                                                </div>
                                                <p className="text-xs font-bold text-stone-500 dark:text-stone-400">Your crate is empty.</p>
                                                <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 mb-3 text-center leading-relaxed">
                                                    You haven't created any AI recipes yet.
                                                </p>
                                                <button
                                                    onClick={() => { onCreateNew(); setIsOpen(false); }}
                                                    className="text-xs bg-yellow-400 hover:bg-yellow-300 text-stone-900 font-bold px-4 py-2 rounded-lg transition-colors w-full shadow-sm border border-yellow-500"
                                                >
                                                    Build First Recipe
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {customApps.map(app => (
                                                    <button
                                                        key={app.id}
                                                        onClick={() => { onSelectApp(app); setIsOpen(false); }}
                                                        className="w-full text-left flex items-center gap-3 p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg group transition-colors"
                                                    >
                                                        <span className="text-xl group-hover:scale-110 transition-transform">{app.emoji}</span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-stone-700 dark:text-stone-200 truncate group-hover:text-stone-900 dark:group-hover:text-white">{app.name}</p>
                                                            <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate">{app.tagline}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : activeTab === 'favorites' ? (
                                    <>
                                        {favoriteApps.length === 0 ? (
                                            <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-3xl opacity-50">
                                                    ❤️
                                                </div>
                                                <p className="text-xs font-bold text-stone-500 dark:text-stone-400">No favorites yet.</p>
                                                <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 text-center leading-relaxed">
                                                    Click the heart on any app to save it here for quick access.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {favoriteApps.map(app => (
                                                    <button
                                                        key={app.id}
                                                        onClick={() => { onSelectApp(app); setIsOpen(false); }}
                                                        className="w-full text-left flex items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg group transition-colors"
                                                    >
                                                        <span className="text-xl group-hover:scale-110 transition-transform">{app.emoji}</span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-stone-700 dark:text-stone-200 truncate group-hover:text-stone-900 dark:group-hover:text-white">{app.name}</p>
                                                            <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate">{app.tagline}</p>
                                                        </div>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400 shrink-0">
                                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* History Tab - Desktop */
                                    <>
                                        {historyItems.length > 0 && (
                                            <div className="flex justify-end px-2 mb-2">
                                                <button
                                                    onClick={handleClearHistory}
                                                    className="text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}

                                        {historyItems.length === 0 ? (
                                            <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-3xl opacity-50">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400 dark:text-stone-500">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <polyline points="12 6 12 12 16 14"/>
                                                    </svg>
                                                </div>
                                                <p className="text-xs font-bold text-stone-500 dark:text-stone-400">No history yet.</p>
                                                <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 text-center leading-relaxed">
                                                    Generated images will appear here.<br/>Up to 20 images saved locally.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {historyItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                                                        onClick={() => {
                                                            if (onHistoryItemClick) onHistoryItemClick(item);
                                                            setIsOpen(false);
                                                        }}
                                                    >
                                                        <img
                                                            src={item.imageData}
                                                            alt={item.appName}
                                                            className="w-full aspect-square object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-lg">{item.appEmoji}</span>
                                                                <button
                                                                    onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                                                                    className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <p className="text-white text-[10px] font-bold truncate">{item.appName}</p>
                                                                <p className="text-white/70 text-[9px]">{formatDate(item.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 group-hover:opacity-0 transition-opacity">
                                                            <p className="text-white text-[9px] font-medium truncate">{item.appEmoji} {item.appName}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="border-t border-stone-100 dark:border-stone-800 p-1 shrink-0">
                                <button
                                    onClick={() => {
                                        signOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors rounded-lg"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </>
        )}
    </div>
  );
};

export default UserMenu;

