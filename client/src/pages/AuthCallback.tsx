import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/../../shared/supabase';
import { useAuth } from '@/hooks/use-auth';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setLocation('/signin?error=callback_failed');
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          setLocation('/dashboard');
        } else {
          // No session, redirect to signin
          setLocation('/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setLocation('/signin?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}