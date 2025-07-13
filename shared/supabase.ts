import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Use environment variables for production, fallback to placeholder for development
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Helper functions for authentication
export const signUp = async (email: string, password: string, userData: any = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://www.atsboost.co.za/auth/callback'
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

// Storage helper functions
export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: File,
  options = {}
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, options);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error uploading file to ${bucket}:`, error);
    return { data: null, error };
  }
};

export const getFileUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

export const deleteFile = async (bucket: string, filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error deleting file from ${bucket}:`, error);
    return { data: null, error };
  }
};