import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import NotFound from '@/pages/not-found';

interface RouterWrapperProps {
  children: ReactNode;
  validPaths: string[];
}

/**
 * A wrapper component that checks if the current path is valid
 * and renders the NotFound component if it's not
 */
export function RouterWrapper({ children, validPaths }: RouterWrapperProps) {
  const [location] = useLocation();
  const [showNotFound, setShowNotFound] = useState(false);
  
  useEffect(() => {
    // Check if the current path is in the valid paths list
    // For paths with parameters, we need to check the pattern without the parameter value
    const isValidPath = validPaths.some(path => {
      if (path.includes(':')) {
        // For paths with parameters like /cv/:id
        const pathPattern = path.split(':')[0]; // Get the part before the parameter
        return location.startsWith(pathPattern);
      }
      return path === location;
    });
    
    setShowNotFound(!isValidPath);
  }, [location, validPaths]);
  
  if (showNotFound) {
    return <NotFound />;
  }
  
  return <>{children}</>;
}