import React, { createContext, useContext, useEffect, useState } from 'react';

// Define a simplified auth user type
interface AuthUser {
  id: number;
  email: string;
  name?: string;
  isAdmin?: boolean;
}

// Define the shape of our auth context
type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  checkAuth: () => Promise<void>;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Include cookies for session-based auth
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log('Auth state changed:', 'AUTHENTICATED');
      } else {
        setUser(null);
        console.log('Auth state changed:', 'SIGNED_OUT');
      }
    } catch (error) {
      setError(error as Error);
      console.error('Error checking auth session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: any = {}) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify({ email, password, ...userData })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Sign up failed');
      }

      setUser(data.user);
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Set user immediately from login response
      setUser(data.user);
      console.log('Auth state changed:', 'AUTHENTICATED');
      
      // Wait a bit for cookie to be set, then verify with checkAuth
      setTimeout(async () => {
        await checkAuth();
      }, 100);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Include cookies for session-based auth
      });
      setUser(null);
      console.log('Auth state changed:', 'SIGNED_OUT');
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}