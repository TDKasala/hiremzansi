import express, { Request, Response, NextFunction } from 'express';
import {
  getUserPlanFeatures,
  canUserAccessFeature,
  getScansRemaining,
  incrementScanCount,
  getUserPlanName
} from '../services/planFeaturesService';

const router = express.Router();

/**
 * Get the plan features for the authenticated user
 */
router.get('/user/plan-features', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || null;
    const planFeatures = await getUserPlanFeatures(userId);
    res.json(planFeatures);
  } catch (error) {
    next(error);
  }
});

/**
 * Check if user can access a specific feature
 */
router.get('/user/can-access/:feature', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || null;
    const feature = req.params.feature as any;
    const canAccess = await canUserAccessFeature(userId, feature);
    res.json({ canAccess });
  } catch (error) {
    next(error);
  }
});

/**
 * Get the number of scans remaining for the user
 */
router.get('/user/scans-remaining', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || null;
    const scansRemaining = await getScansRemaining(userId);
    res.json(scansRemaining);
  } catch (error) {
    next(error);
  }
});

/**
 * Increment the user's scan count
 */
router.post('/user/increment-scan-count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const success = await incrementScanCount(userId);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to increment scan count' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Get the user's plan name
 */
router.get('/user/plan-name', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || null;
    const planName = await getUserPlanName(userId);
    res.json(planName);
  } catch (error) {
    next(error);
  }
});

export default router;