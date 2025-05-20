import { sendWeeklyCareerDigests } from './recommendationService';
import { log } from '../vite';

/**
 * Schedule interval for running tasks (in milliseconds)
 * Set to 24 hours by default
 */
const TASK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Store task intervals for cleanup
const taskIntervals: NodeJS.Timeout[] = [];

/**
 * Set up scheduled tasks to run at regular intervals
 */
export function setupScheduledTasks() {
  log('Setting up scheduled tasks...', 'scheduler');
  
  // Schedule weekly career digests
  const weeklyDigestInterval = setInterval(async () => {
    try {
      log('Running scheduled task: Weekly career recommendation digests', 'scheduler');
      const sentCount = await sendWeeklyCareerDigests();
      log(`Sent ${sentCount} career recommendation emails`, 'scheduler');
    } catch (error) {
      log(`Error running weekly digests task: ${error}`, 'scheduler');
    }
  }, TASK_INTERVAL_MS);
  
  // Store interval for cleanup
  taskIntervals.push(weeklyDigestInterval);
  
  // Also run tasks immediately on startup (after a short delay)
  setTimeout(async () => {
    try {
      // Only run in production to avoid sending test emails during development
      if (process.env.NODE_ENV === 'production') {
        log('Running initial weekly career digests task', 'scheduler');
        const sentCount = await sendWeeklyCareerDigests();
        log(`Sent ${sentCount} career recommendation emails`, 'scheduler');
      } else {
        log('Skipping initial digest task in development mode', 'scheduler');
      }
    } catch (error) {
      log(`Error running initial digests task: ${error}`, 'scheduler');
    }
  }, 60 * 1000); // Wait 1 minute after startup
  
  log('Scheduled tasks initialized successfully', 'scheduler');
}

/**
 * Clean up scheduled tasks (for graceful shutdown)
 */
export function cleanupScheduledTasks() {
  log('Cleaning up scheduled tasks...', 'scheduler');
  
  for (const interval of taskIntervals) {
    clearInterval(interval);
  }
  
  taskIntervals.length = 0;
  
  log('Scheduled tasks cleaned up successfully', 'scheduler');
}