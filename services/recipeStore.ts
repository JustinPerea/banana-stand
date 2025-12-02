
import { BananaApp } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'banana_stand_custom_recipes_v1';

export const RecipeStore = {
  /**
   * Loads custom created apps from LocalStorage.
   */
  getCustomApps: (): BananaApp[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load custom recipes", e);
      return [];
    }
  },

  /**
   * Saves a new app to LocalStorage.
   */
  saveCustomApp: (app: BananaApp): BananaApp[] => {
    try {
      const current = RecipeStore.getCustomApps();
      // Add new app to the beginning of the list
      const updated = [app, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Failed to save custom recipe", e);
      return [];
    }
  },

  /**
   * Clears all custom apps (Dev utility).
   */
  clearCustomApps: () => {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  },

  /**
   * Publishes a recipe to the Community (Supabase).
   */
  publishRecipe: async (app: BananaApp, authorName: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('recipes')
        .insert({
          name: app.name,
          author_name: authorName,
          app_data: app,
          created_at: new Date().toISOString(),
          downloads: 0
        });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Failed to publish recipe", e);
      return false;
    }
  },

  /**
   * Fetches recipes from the Community.
   */
  fetchCommunityRecipes: async (): Promise<BananaApp[]> => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map((row: any) => ({
        ...row.app_data,
        id: row.app_data.id, // Ensure ID matches
        _community: {
          author: row.author_name,
          downloads: row.downloads
        }
      }));
    } catch (e) {
      console.error("Failed to fetch community recipes", e);
      return [];
    }
  },

  /**
   * Fetches recipes by a specific author name.
   */
  fetchRecipesByAuthor: async (authorName: string): Promise<BananaApp[]> => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('author_name', authorName)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((row: any) => ({
        ...row.app_data,
        id: row.app_data.id,
        _community: {
          author: row.author_name,
          downloads: row.downloads
        }
      }));
    } catch (e) {
      console.error("Failed to fetch recipes by author", e);
      return [];
    }
  }
};
