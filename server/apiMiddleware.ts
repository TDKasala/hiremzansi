import type { Express, Request, Response, NextFunction } from "express";

/**
 * Custom middleware to handle API routes before Vite intercepts them
 * This works by monkey-patching the Express app's use method
 */
export function setupApiProtection(app: Express) {
  const originalUse = app.use.bind(app);
  
  // Override app.use to intercept Vite middleware
  app.use = function(this: Express, ...args: any[]) {
    // If this is the Vite middleware setup (detected by middleware function characteristics)
    if (args.length === 1 && typeof args[0] === 'function' && args[0].name === '') {
      const viteMiddleware = args[0];
      
      // Wrap Vite middleware to skip API routes
      const wrappedMiddleware = (req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith('/api/')) {
          // Skip Vite middleware for API routes
          return next();
        }
        return viteMiddleware(req, res, next);
      };
      
      return originalUse.call(this, wrappedMiddleware);
    }
    
    // For all other middleware, use original behavior
    return originalUse.apply(this, args);
  };
}