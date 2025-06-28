import React from 'react';

interface TrackedLinkProps {
  href: string;
  children: React.ReactNode;
  name: string;
  category?: 'navigation' | 'cta' | 'social' | 'referral' | 'external';
  className?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

export const TrackedLink: React.FC<TrackedLinkProps> = ({
  href,
  children,
  name,
  category = 'navigation',
  className,
  target,
  rel,
  onClick,
  ...props
}) => {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call the custom onClick handler if provided
    if (onClick) {
      onClick();
    }

    // Track the link click
    try {
      await fetch('/api/track/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkName: name,
          linkUrl: href,
          category,
          page: window.location.pathname,
        }),
      });
    } catch (error) {
      // Silently fail to avoid disrupting user experience
      console.log('Link tracking failed:', error);
    }
  };

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
};

// Hook for tracking programmatic navigation
export const useTrackNavigation = () => {
  const trackClick = async (linkName: string, linkUrl: string, category: string = 'navigation') => {
    try {
      await fetch('/api/track/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkName,
          linkUrl,
          category,
          page: window.location.pathname,
        }),
      });
    } catch (error) {
      console.log('Navigation tracking failed:', error);
    }
  };

  return { trackClick };
};