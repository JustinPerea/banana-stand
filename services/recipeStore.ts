import { get, set } from 'idb-keyval';
import { BananaApp } from '../types';
import { supabase } from './supabase';
import { uploadRecipeImages } from './imageUploadService';

const LOCAL_STORAGE_KEY = 'banana_stand_custom_recipes_v1';
const CACHE_KEY = 'banana_stand_community_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const RecipeStore = {
  /**
   * Loads custom created apps from LocalStorage.
   */
  getCustomApps: (): BananaApp[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load custom recipes", e);
      return [];
    }
  },

  /**
   * Saves a new app to LocalStorage.
   * Strips large base64 images to avoid quota errors.
   */
  saveCustomApp: (app: BananaApp): BananaApp[] => {
    try {
      const current = RecipeStore.getCustomApps();

      // Create a lightweight copy without large base64 images for localStorage
      const appForStorage = { ...app };

      // Only strip if they're base64 (not URLs)
      if (appForStorage.example_input_image &&
          typeof appForStorage.example_input_image === 'string' &&
          appForStorage.example_input_image.startsWith('data:')) {
        appForStorage.example_input_image = undefined;
      }
      if (appForStorage.example_output_image &&
          appForStorage.example_output_image.startsWith('data:')) {
        appForStorage.example_output_image = undefined;
      }
      if (appForStorage.cover_image &&
          appForStorage.cover_image.startsWith('data:')) {
        appForStorage.cover_image = undefined;
      }

      // Add new app to the beginning of the list
      const updated = [appForStorage, ...current.filter(a => a.id !== app.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Failed to save custom recipe", e);
      return RecipeStore.getCustomApps();
    }
  },

  /**
   * Clears all custom apps (Dev utility).
   */
  clearCustomApps: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return [];
  },

  /**
   * Publishes a recipe to the Community (Supabase).
   * Uploads images to Storage first, then stores URLs instead of base64.
   * @param app - The app to publish
   * @param authorName - The author's display name
   * @param userId - The authenticated user's ID (for RLS)
   */
  publishRecipe: async (app: BananaApp, authorName: string, userId: string): Promise<boolean> => {
    try {
      // Create a copy of the app to modify
      const appToPublish = { ...app };

      // Upload images to Supabase Storage and get URLs
      const imageUrls = await uploadRecipeImages(
        app.id,
        app.example_input_image as string | undefined,
        app.example_output_image as string | undefined
      );

      // Replace base64 images with URLs
      if (imageUrls.inputUrl) {
        appToPublish.example_input_image = imageUrls.inputUrl;
      }
      if (imageUrls.outputUrl) {
        appToPublish.example_output_image = imageUrls.outputUrl;
      }
      if (imageUrls.coverUrl) {
        appToPublish.cover_image = imageUrls.coverUrl;
      }

      const { error } = await supabase
        .from('recipes')
        .insert({
          name: appToPublish.name,
          author_name: authorName,
          user_id: userId,
          app_data: appToPublish,
          created_at: new Date().toISOString(),
          downloads: 0
        });

      if (error) throw error;

      // Invalidate cache so the new recipe shows up
      if (typeof window !== 'undefined') {
        // We use idb-keyval for caching now, so simple removal isn't synchronous but valid
        set(CACHE_KEY, null).catch(console.error);
      }

      return true;
    } catch (e) {
      console.error("Failed to publish recipe", e);
      return false;
    }
  },

  /**
   * Fetches recipes from the Community with caching (via IndexedDB).
   */
  fetchCommunityRecipes: async (): Promise<BananaApp[]> => {
    try {
      // Check cache first
      if (typeof window !== 'undefined') {
        try {
            const cached: any = await get(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = cached;
                if (Date.now() - timestamp < CACHE_DURATION) {
                    // Return cached data immediately, but refresh in background
                    RecipeStore._refreshCommunityCache();
                    return data;
                }
            }
        } catch (err) {
            console.warn("Cache read error:", err);
        }
      }

      return await RecipeStore._fetchAndCacheCommunity();
    } catch (e) {
      console.error("Failed to fetch community recipes", e);
      return [];
    }
  },

  /**
   * Internal: Fetch from Supabase and cache results
   */
  _fetchAndCacheCommunity: async (): Promise<BananaApp[]> => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const recipes = data.map((row: any) => ({
      ...row.app_data,
      id: row.app_data.id,
      author: row.author_name,
      _community: {
        author: row.author_name,
        downloads: row.downloads
      }
    }));

    // Cache in IndexedDB (handles large payloads much better than sessionStorage)
    if (typeof window !== 'undefined') {
      try {
        await set(CACHE_KEY, {
          data: recipes,
          timestamp: Date.now()
        });
      } catch (err) {
        console.warn('Failed to cache community recipes to IndexedDB', err);
      }
    }

    return recipes;
  },

  /**
   * Internal: Refresh cache in background
   */
  _refreshCommunityCache: async (): Promise<void> => {
    try {
      await RecipeStore._fetchAndCacheCommunity();
    } catch (e) {
      // Silent fail for background refresh
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
        author: row.author_name, // Set author from database
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
