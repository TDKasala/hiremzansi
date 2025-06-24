// Application configuration
export const APP_CONFIG = {
  // Primary domain configuration
  DOMAIN: 'hiremzansi.co.za',
  BASE_URL: 'https://hiremzansi.co.za',
  
  // API configuration
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://hiremzansi.co.za/api'
    : '/api',
  
  // Application metadata
  APP_NAME: 'Hire Mzansi',
  APP_DESCRIPTION: 'South Africa\'s Premier CV Optimization & Job Matching Platform',
  
  // Contact information
  CONTACT_EMAIL: 'hello@hiremzansi.co.za',
  SUPPORT_EMAIL: 'support@hiremzansi.co.za',
  
  // Social media
  SOCIAL_LINKS: {
    twitter: 'https://twitter.com/hiremzansi',
    linkedin: 'https://linkedin.com/company/hiremzansi',
    facebook: 'https://facebook.com/hiremzansi'
  }
};

// Canonical URL helper
export const getCanonicalUrl = (path: string = '') => {
  return `${APP_CONFIG.BASE_URL}${path}`;
};

// Check if current domain is the primary domain
export const isPrimaryDomain = () => {
  if (typeof window === 'undefined') return true;
  return window.location.hostname === APP_CONFIG.DOMAIN;
};