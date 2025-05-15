import { useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom navigation hook that wraps wouter's useLocation
 * with additional functionality like scrolling to top on navigation
 */
export function useNavigation() {
  const [location, setLocation] = useLocation();

  // Scroll to top after navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Navigate to a new page and scroll to top
  const navigate = useCallback(
    (to: string) => {
      setLocation(to);
      window.scrollTo(0, 0);
    },
    [setLocation]
  );

  return {
    location,
    navigate
  };
}