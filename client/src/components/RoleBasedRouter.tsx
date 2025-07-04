import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

interface RoleBasedRouterProps {
  children: React.ReactNode;
}

export function RoleBasedRouter({ children }: RoleBasedRouterProps) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Only handle redirection if user is authenticated and not loading
    if (!loading && user) {
      // Check if user just logged in (coming from login page or auth callback)
      const isFromLogin = location === '/auth' || location === '/login' || location === '/auth/callback';
      const isFromRoot = location === '/';
      
      // If user is an employer and coming from login/auth pages, redirect to post job page
      if (user.isEmployer && (isFromLogin || isFromRoot)) {
        navigate('/post-job');
        return;
      }
      
      // If user is a regular job seeker and coming from login/auth pages, redirect to dashboard
      if (!user.isEmployer && (isFromLogin || isFromRoot)) {
        navigate('/dashboard');
        return;
      }
    }
  }, [user, loading, location, navigate]);

  return <>{children}</>;
}