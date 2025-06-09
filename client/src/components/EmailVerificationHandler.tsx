import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export function EmailVerificationHandler() {
  const [location] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    
    if (verified === 'true') {
      toast({
        title: "Email Verified Successfully!",
        description: "Your email has been verified. You now have full access to all features.",
        variant: "default",
      });
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } else if (verified === 'false') {
      toast({
        title: "Email Verification Failed",
        description: "The verification link is invalid or has expired. Please try again.",
        variant: "destructive",
      });
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [location, toast]);

  return null;
}