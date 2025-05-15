import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A component that scrolls the page to the top when the route changes
 */
export function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [location]);
  
  return null; // This component doesn't render anything
}