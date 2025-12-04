import { supabase } from './supabase';

export interface AppStats {
  id: string;
  usage_count: number;
  favorite_count: number;
}

export interface UserFavorite {
  user_id: string;
  app_id: string;
}

// Fetch stats for all apps
export async function fetchAllAppStats(): Promise<Record<string, AppStats>> {
  const { data, error } = await supabase
    .from('app_stats')
    .select('*');

  if (error) {
    console.error('Error fetching app stats:', error);
    return {};
  }

  // Convert array to object keyed by app id
  const statsMap: Record<string, AppStats> = {};
  data?.forEach((stat: AppStats) => {
    statsMap[stat.id] = stat;
  });

  return statsMap;
}

// Fetch stats for a single app
export async function fetchAppStats(appId: string): Promise<AppStats | null> {
  const { data, error } = await supabase
    .from('app_stats')
    .select('*')
    .eq('id', appId)
    .single();

  if (error) {
    console.error('Error fetching app stats:', error);
    return null;
  }

  return data;
}

// Increment usage count when an app is run
// Returns true if successful, false otherwise
export async function incrementUsageCount(appId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_usage', { app_id: appId });

    if (error) {
      console.error('Error incrementing usage count:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception incrementing usage count:', e);
    return false;
  }
}

// Check if user has favorited an app
export async function checkUserFavorite(userId: string, appId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('app_id')
    .eq('user_id', userId)
    .eq('app_id', appId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking favorite:', error);
  }

  return !!data;
}

// Get all favorites for a user
export async function getUserFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('app_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }

  return data?.map((f: UserFavorite) => f.app_id) || [];
}

// Toggle favorite status
// Returns the new favorite state (true = favorited, false = not favorited)
export async function toggleFavorite(userId: string, appId: string): Promise<boolean> {
  try {
    // Check if already favorited
    const isFavorited = await checkUserFavorite(userId, appId);

    if (isFavorited) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('app_id', appId);

      if (deleteError) {
        console.error('Error removing favorite:', deleteError);
        return true; // Return previous state on error
      }

      // Decrement favorite count (don't fail if this errors)
      const { error: rpcError } = await supabase.rpc('decrement_favorite', { app_id: appId });
      if (rpcError) {
        console.error('Error decrementing favorite count:', rpcError);
      }
      return false;
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, app_id: appId });

      if (insertError) {
        console.error('Error adding favorite:', insertError);
        return false; // Return previous state on error
      }

      // Increment favorite count (don't fail if this errors)
      const { error: rpcError } = await supabase.rpc('increment_favorite', { app_id: appId });
      if (rpcError) {
        console.error('Error incrementing favorite count:', rpcError);
      }
      return true;
    }
  } catch (e) {
    console.error('Exception in toggleFavorite:', e);
    // Return the opposite of expected to indicate failure
    const currentState = await checkUserFavorite(userId, appId);
    return currentState;
  }
}
