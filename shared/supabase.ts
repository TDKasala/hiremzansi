import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Use import.meta.env for Vite/client-side, fallback to process.env for server-side
const supabaseUrl = (typeof import.meta !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : process.env.SUPABASE_URL) as string || 'https://qvhmqyhapkcszioydfoa.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : process.env.SUPABASE_ANON_KEY) as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aG1xeWhhcGtjc3ppb3lkZm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODI4NjEsImV4cCI6MjA2MzY1ODg2MX0.EgDdrsYL3Sdwr1L_l0lfKgnpQTkK-426yuzLdLHCGP8';

// Create a single instance of the Supabase client to use throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
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
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
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