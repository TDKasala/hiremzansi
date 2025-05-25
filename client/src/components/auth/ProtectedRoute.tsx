import React from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from '../../context/AuthContext';

// This component wraps a Route to provide authentication protection
export function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Create a wrapper component that handles the auth logic
  const ProtectedComponent = (props: any) => {
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
      React.useEffect(() => {
        setLocation('/login');
      }, []);
      return null;
    }
    
    // Render the protected component if authenticated
    return <Component {...props} />;
  };
  
  // Return a Route with the protected component
  return <Route {...rest} component={ProtectedComponent} />;
}