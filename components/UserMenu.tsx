
import React, { useState } from 'react';
import { signInWithGoogle, signOut } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { BananaApp } from '../types';

interface UserMenuProps {
    user: User | null;
    customApps: BananaApp[];
    favoriteApps: BananaApp[];
    onSelectApp: (app: BananaApp) => void;
    onCreateNew: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, customApps, favoriteApps, onSelectApp, onCreateNew }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipes' | 'favorites'>('recipes');

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
                {/* Backdrop to close */}
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-stone-100 bg-stone-50 shrink-0">
                        <p className="text-xs font-bold text-stone-900 truncate">
                            {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex border-b border-stone-100 shrink-0">
                        <button
                            onClick={() => setActiveTab('recipes')}
                            className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                activeTab === 'recipes'
                                    ? 'text-stone-900 border-b-2 border-yellow-400 bg-yellow-50'
                                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                            }`}
                        >
                            My Recipes ({customApps.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                activeTab === 'favorites'
                                    ? 'text-stone-900 border-b-2 border-red-400 bg-red-50'
                                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={activeTab === 'favorites' ? 'text-red-500' : ''}>
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                Favorites ({favoriteApps.length})
                            </span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {activeTab === 'recipes' ? (
                            <>
                                <div className="flex justify-end px-2 mb-2">
                                    <button
                                        onClick={() => { onCreateNew(); setIsOpen(false); }}
                                        className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-1 rounded transition-colors"
                                    >
                                        + New
                                    </button>
                                </div>

                                {customApps.length === 0 ? (
                                    <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-3 text-3xl opacity-50 grayscale">
                                            🍌
                                        </div>
                                        <p className="text-xs font-bold text-stone-500">Your crate is empty.</p>
                                        <p className="text-[10px] text-stone-400 mt-1 mb-3 text-center leading-relaxed">
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
                                                className="w-full text-left flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg group transition-colors"
                                            >
                                                <span className="text-xl group-hover:scale-110 transition-transform">{app.emoji}</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-stone-700 truncate group-hover:text-stone-900">{app.name}</p>
                                                    <p className="text-[10px] text-stone-400 truncate">{app.tagline}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {favoriteApps.length === 0 ? (
                                    <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-3 text-3xl opacity-50">
                                            ❤️
                                        </div>
                                        <p className="text-xs font-bold text-stone-500">No favorites yet.</p>
                                        <p className="text-[10px] text-stone-400 mt-1 text-center leading-relaxed">
                                            Click the heart on any app to save it here for quick access.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {favoriteApps.map(app => (
                                            <button
                                                key={app.id}
                                                onClick={() => { onSelectApp(app); setIsOpen(false); }}
                                                className="w-full text-left flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg group transition-colors"
                                            >
                                                <span className="text-xl group-hover:scale-110 transition-transform">{app.emoji}</span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-stone-700 truncate group-hover:text-stone-900">{app.name}</p>
                                                    <p className="text-[10px] text-stone-400 truncate">{app.tagline}</p>
                                                </div>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400 shrink-0">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    <div className="border-t border-stone-100 p-1 shrink-0">
                        <button 
                            onClick={() => {
                                signOut();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors rounded-lg"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

export default UserMenu;

