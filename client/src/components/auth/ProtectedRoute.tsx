import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    // Use React.useEffect to avoid issues with redirecting during render
    React.useEffect(() => {
      setLocation('/login');
    }, [setLocation]);
    
    return null;
  }
  
  // Render children if authenticated
  return <>{children}</>;
}