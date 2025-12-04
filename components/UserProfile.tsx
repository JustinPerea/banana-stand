
import React, { useState } from 'react';
import { BananaApp } from '../types';
import AppCard from './AppCard';
import { AppStats } from '../services/statsService';
import { BananaIcon } from './Logo';
import SkeletonCard, { SkeletonProfileHeader } from './SkeletonCard';

interface UserProfileProps {
  authorName: string;
  authorRecipes: BananaApp[];
  authorFavorites: BananaApp[];
  onSelectApp: (app: BananaApp) => void;
  onBack: () => void;
  appStats: Record<string, AppStats>;
  userFavorites: string[];
  onToggleFavorite?: (appId: string) => void;
  onAuthorClick?: (author: string) => void;
  onTagClick?: (tag: string) => void;
  isLoading?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  authorName,
  authorRecipes,
  authorFavorites,
  onSelectApp,
  onBack,
  appStats,
  userFavorites,
  onToggleFavorite,
  onAuthorClick,
  onTagClick,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'favorites'>('recipes');

  const isOfficial = authorName === 'Banana Stand';
  const displayApps = activeTab === 'recipes' ? authorRecipes : authorFavorites;

  // Calculate total stats for this author
  const totalRuns = authorRecipes.reduce((sum, app) => sum + (appStats[app.id]?.usage_count ?? 0), 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white font-medium flex items-center gap-2 transition-colors"
      >
        ← Back to Store
      </button>

      {/* Profile Header */}
      {isLoading ? (
        <SkeletonProfileHeader />
      ) : (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 mb-8 transition-colors">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          {isOfficial ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center border-4 border-yellow-400 shadow-lg">
              <BananaIcon size={48} className="sm:w-14 sm:h-14" />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-4xl sm:text-5xl border-4 border-stone-300 dark:border-stone-700 shadow-lg">
              👤
            </div>
          )}

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">
                {authorName}
              </h1>
              {isOfficial && (
                <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Official
                </span>
              )}
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">
              {isOfficial
                ? 'The official collection of recipes from The Banana Stand team.'
                : 'Community recipe creator'
              }
            </p>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100">{authorRecipes.length}</div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100">{totalRuns.toLocaleString()}</div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Runs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-red-500">{authorFavorites.length}</div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Favorites</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 mb-6">
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 sm:flex-none px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'recipes'
              ? 'text-stone-900 dark:text-stone-100 border-b-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
              : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <span>🍌</span>
            Recipes ({authorRecipes.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 sm:flex-none px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'favorites'
              ? 'text-stone-900 dark:text-stone-100 border-b-2 border-red-400 bg-red-50 dark:bg-red-900/20'
              : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={activeTab === 'favorites' ? 'text-red-500' : ''}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Favorites ({authorFavorites.length})
          </span>
        </button>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <SkeletonCard count={6} />
        </div>
      ) : displayApps.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl opacity-50">
            {activeTab === 'recipes' ? '🍌' : '❤️'}
          </div>
          <h3 className="text-lg font-bold text-stone-500 dark:text-stone-400 mb-2">
            {activeTab === 'recipes' ? 'No recipes yet' : 'No public favorites'}
          </h3>
          <p className="text-sm text-stone-400 dark:text-stone-500 max-w-md mx-auto">
            {activeTab === 'recipes'
              ? `${authorName} hasn't published any recipes to the community yet.`
              : `${authorName} hasn't made their favorites public.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {displayApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onClick={onSelectApp}
              onAuthorClick={onAuthorClick}
              onTagClick={onTagClick}
              stats={appStats[app.id]}
              isFavorited={userFavorites.includes(app.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
