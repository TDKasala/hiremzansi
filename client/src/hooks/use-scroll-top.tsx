import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook that scrolls the page to the top when the route changes
 */
export const useScrollTop = () => {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
};