
import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get the current user's profile
 */
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return null;
      }
      throw error;
    }

    return data;
  } catch (e) {
    console.error('Failed to get profile:', e);
    return null;
  }
};

/**
 * Check if a username is available
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .maybeSingle();

    if (error) throw error;
    return data === null;
  } catch (e) {
    console.error('Failed to check username:', e);
    return false;
  }
};

/**
 * Create or update a user's profile with a username
 */
export const setUsername = async (userId: string, username: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if username is valid
    if (!username || username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    if (username.length > 20) {
      return { success: false, error: 'Username must be 20 characters or less' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    // Check if username is available
    const available = await isUsernameAvailable(username);
    if (!available) {
      // Check if it's the user's own username
      const existingProfile = await getProfile(userId);
      if (existingProfile && existingProfile.username.toLowerCase() === username.toLowerCase()) {
        // Same username, allow update
      } else {
        return { success: false, error: 'Username is already taken' };
      }
    }

    // Check if user already has a profile
    const existingProfile = await getProfile(userId);

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Create new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    return { success: true };
  } catch (e: any) {
    console.error('Failed to set username:', e);
    return { success: false, error: e.message || 'Failed to save username' };
  }
};

/**
 * Get username by user ID (for displaying in UI)
 */
export const getUsername = async (userId: string): Promise<string | null> => {
  const profile = await getProfile(userId);
  return profile?.username || null;
};
