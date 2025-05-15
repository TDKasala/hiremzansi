import { ReactNode, useCallback } from 'react';
import { Link } from 'wouter';

interface CustomLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * A custom Link component that wraps wouter's Link component
 * and automatically scrolls to the top of the page on navigation
 */
export default function CustomLink({ 
  href, 
  children, 
  className = "", 
  onClick 
}: CustomLinkProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // If onClick is provided, call it
      if (onClick) {
        onClick();
      }
      
      // Scroll to top after a short delay to ensure navigation has completed
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    },
    [onClick]
  );
  
  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}