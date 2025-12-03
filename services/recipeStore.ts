
import { BananaApp } from '../types';
import { supabase } from './supabase';
import { uploadRecipeImages } from './imageUploadService';

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
    localStorage.removeItem(STORAGE_KEY);
    return [];
  },

  /**
   * Publishes a recipe to the Community (Supabase).
   * Uploads images to Storage first, then stores URLs instead of base64.
   */
  publishRecipe: async (app: BananaApp, authorName: string): Promise<boolean> => {
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
          app_data: appToPublish,
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
