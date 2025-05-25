import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase';
import type { User, Session, UserResponse, SignInWithPasswordCredentials } from '@supabase/supabase-js';

// Define the shape of our auth context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
};

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for active session on component mount
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        // Listen for auth changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          (_event, session) => {
            console.log('Auth state changed:', _event);
            setSession(session);
            setUser(session?.user || null);
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        setError(error as Error);
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
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

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  // AuthContext value
  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}