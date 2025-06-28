import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./db-init";
import { checkDatabaseHealth } from "./db-utils";
import { runMigrations } from "./db-migrate";
import adminRoutes from "./routes/admin";
import { closeDbConnection } from "./db";
import { setupScheduledTasks, cleanupScheduledTasks } from "./services/scheduledTasks";

const app = express();

// Configure session middleware for authentication persistence
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always use secure cookies since Replit serves over HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax' // Allow cookies to be sent on navigation
  }
}));

// Force redirect to custom domain and set primary domain headers
app.use((req, res, next) => {
  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || req.protocol;
  
  // If accessing via replit.app domain, redirect to custom domain
  if (host && host.includes('replit.app')) {
    return res.redirect(301, `https://hiremzansi.co.za${req.originalUrl}`);
  }
  
  // Set security headers for primary domain with cache control (except for static assets)
  const isStaticAsset = req.url && (req.url.endsWith('.png') || req.url.endsWith('.jpg') || req.url.endsWith('.jpeg') || req.url.endsWith('.gif') || req.url.endsWith('.ico') || req.url.endsWith('.svg'));
  
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (!isStaticAsset) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else {
    // Cache static assets for better performance
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
  }
  
  // Set canonical domain headers and HSTS for security
  if (host === 'hiremzansi.co.za') {
    res.setHeader('Link', '<https://hiremzansi.co.za>; rel="canonical"');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log('Starting Hire Mzansi CV Optimization Platform...');
    
    // Skip database initialization for now to ensure platform runs
    log('Starting platform in development mode');
    
    // Serve static files from public directory BEFORE Vite middleware
    app.use(express.static('public', {
      maxAge: '1d', // Cache static assets for 1 day
      setHeaders: (res, path) => {
        if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.svg') || path.endsWith('.ico')) {
          res.setHeader('Content-Type', 'image/' + path.split('.').pop());
        }
      }
    }));

    // Add API route protection BEFORE Vite middleware
    app.use((req, res, next) => {
      // Only apply special handling to API routes
      if (req.path.startsWith('/api/')) {
        res.locals.isApiRoute = true;
      }
      next();
    });

    const server = await registerRoutes(app);

    // Catch unhandled API routes AFTER all routes are registered
    app.use('/api/*', (req: Request, res: Response) => {
      res.status(404).json({ error: 'API endpoint not found' });
    });

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      // Log the error but don't throw it again in production
      if (process.env.NODE_ENV === 'production') {
        console.error('Server error:', err);
      } else {
        console.error('Server error:', err);
        // Only rethrow in development for better debugging
        // throw err;
      }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      
      // Initialize scheduled tasks for email digests
      setupScheduledTasks();
    });
    
    // Set up graceful shutdown
    setupGracefulShutdown(server);
  } catch (error) {
    console.error('Failed to start server:', error);
    await closeDbConnection().catch(e => console.error('Error closing DB during startup failure:', e));
    process.exit(1);
  }
})();

/**
 * Set up graceful shutdown handling
 * This ensures database connections are properly closed before the server exits
 */
function setupGracefulShutdown(server: any) {
  // Handle process termination signals
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      log(`${signal} received, shutting down gracefully...`, 'server');
      
      // Set a timeout for shutdown in case something hangs
      const forceExitTimeout = setTimeout(() => {
        log('Forcing server shutdown after timeout', 'server');
        process.exit(1);
      }, 15000); // 15 seconds timeout
      
      try {
        // Close HTTP server first (stop accepting new connections)
        log('Closing HTTP server...', 'server');
        await new Promise((resolve, reject) => {
          server.close((err: Error | undefined) => {
            if (err) {
              log(`Error closing HTTP server: ${err.message}`, 'server');
              reject(err);
            } else {
              log('HTTP server closed successfully', 'server');
              resolve(true);
            }
          });
        });
        
        // Close database connections
        log('Closing database connections...', 'server');
        await closeDbConnection();
        log('Database connections closed successfully', 'server');
        
        // Clear the force exit timeout since we've completed gracefully
        clearTimeout(forceExitTimeout);
        log('Graceful shutdown completed', 'server');
        
        // Exit with success code
        process.exit(0);
      } catch (error) {
        log(`Error during graceful shutdown: ${error}`, 'server');
        clearTimeout(forceExitTimeout);
        process.exit(1);
      }
    });
  });
  
  // For nodemon restarts or unexpected exits
  process.on('exit', () => {
    log('Process exiting...', 'server');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Promise Rejection: ${reason}`, 'server');
    // Don't exit the process, just log it
  });
};
