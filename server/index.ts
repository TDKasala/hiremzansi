import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./db-init";
import { checkDatabaseHealth } from "./db-utils";
import { runMigrations } from "./db-migrate";
import adminRoutes from "./routes/admin";
import { closeDbConnection } from "./db";

const app = express();
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
    // Run database migrations first
    const appliedMigrations = await runMigrations();
    if (appliedMigrations.length > 0) {
      log(`Applied ${appliedMigrations.length} database migrations`, 'database');
    }
    
    // Initialize database and check health before starting server
    await initializeDatabase();
    await checkDatabaseHealth();
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
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
