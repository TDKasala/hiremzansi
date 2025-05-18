import { db } from '../db';
import { plans, subscriptions, users } from '@shared/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

// Plan feature constants
export const PLAN_FEATURES = {
  FREE: {
    name: 'Free',
    scanLimit: 1,
    maxStrengths: 2,
    maxImprovements: 1,
    fullRecommendations: false,
    beforeAfterComparison: false,
    keywordOptimization: false,
    unlimitedUploads: false,
    bbbeeGuidance: false,
    nqfGuidance: false,
    interviewPractice: false,
    skillGapAnalysis: false,
    jobMatching: false,
    emailSupport: false,
  },
  ESSENTIAL: {
    name: 'Essential',
    scanLimit: 5,
    maxStrengths: null, // unlimited
    maxImprovements: null, // unlimited
    fullRecommendations: true,
    beforeAfterComparison: false,
    keywordOptimization: true,
    unlimitedUploads: false,
    bbbeeGuidance: true,
    nqfGuidance: true,
    interviewPractice: false,
    skillGapAnalysis: false,
    jobMatching: false,
    emailSupport: false,
  },
  PREMIUM: {
    name: 'Premium',
    scanLimit: null, // unlimited
    maxStrengths: null, // unlimited
    maxImprovements: null, // unlimited
    fullRecommendations: true,
    beforeAfterComparison: true,
    keywordOptimization: true,
    unlimitedUploads: true,
    bbbeeGuidance: true,
    nqfGuidance: true,
    interviewPractice: false,
    skillGapAnalysis: false,
    jobMatching: true,
    emailSupport: false,
  },
  PROFESSIONAL: {
    name: 'Professional',
    scanLimit: null, // unlimited
    maxStrengths: null, // unlimited
    maxImprovements: null, // unlimited
    fullRecommendations: true,
    beforeAfterComparison: true,
    keywordOptimization: true,
    unlimitedUploads: true,
    bbbeeGuidance: true,
    nqfGuidance: true,
    interviewPractice: true,
    skillGapAnalysis: true,
    jobMatching: true,
    emailSupport: true,
  },
};

export type PlanFeatures = {
  scanLimit: number | null;
  maxStrengths: number | null;
  maxImprovements: number | null;
  fullRecommendations: boolean;
  beforeAfterComparison: boolean;
  keywordOptimization: boolean;
  unlimitedUploads: boolean;
  bbbeeGuidance: boolean;
  nqfGuidance: boolean;
  interviewPractice: boolean;
  skillGapAnalysis: boolean;
  jobMatching: boolean;
  emailSupport: boolean;
};

/**
 * Get the plan features for a given user
 * @param userId User ID to check permissions for
 * @returns A PlanFeatures object containing the features available to the user
 */
export async function getUserPlanFeatures(userId: number | null): Promise<PlanFeatures> {
  // Return free plan features for anonymous users
  if (!userId) {
    return PLAN_FEATURES.FREE;
  }

  try {
    // Get the user's active subscription
    const userSubscriptions = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.currentPeriodEnd, new Date())
        )
      );

    // If no active subscription, return free plan features
    if (!userSubscriptions || userSubscriptions.length === 0) {
      return PLAN_FEATURES.FREE;
    }

    // Get the user's most premium subscription if they have multiple
    const subscription = userSubscriptions[0];
    
    // Get the plan details
    const userPlan = await db.select()
      .from(plans)
      .where(eq(plans.id, subscription.planId))
      .limit(1);
      
    if (!userPlan || userPlan.length === 0) {
      return PLAN_FEATURES.FREE;
    }

    // Determine features based on plan name
    const planName = userPlan[0].name.toUpperCase();
    
    if (planName.includes('PROFESSIONAL')) {
      return PLAN_FEATURES.PROFESSIONAL;
    } else if (planName.includes('PREMIUM')) {
      return PLAN_FEATURES.PREMIUM;
    } else if (planName.includes('ESSENTIAL')) {
      return PLAN_FEATURES.ESSENTIAL;
    } else {
      return PLAN_FEATURES.FREE;
    }
  } catch (error) {
    console.error('Error getting user plan features:', error);
    // In case of error, return free plan features
    return PLAN_FEATURES.FREE;
  }
}

/**
 * Check if the user is allowed to perform an operation based on their plan features
 * @param userId User ID to check permissions for
 * @param feature Feature to check
 * @returns Boolean indicating if the user can perform the operation
 */
export async function canUserAccessFeature(
  userId: number | null,
  feature: keyof PlanFeatures
): Promise<boolean> {
  const userFeatures = await getUserPlanFeatures(userId);
  const featureValue = userFeatures[feature];
  
  // For boolean features, simply return the value
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  // For numeric features, if it's null it means unlimited
  if (typeof featureValue === 'number' || featureValue === null) {
    if (featureValue === null) {
      return true; // Unlimited
    }
    return featureValue > 0; // Has some limit but greater than 0
  }
  
  return false;
}

/**
 * Check if the user has scans remaining in their plan
 * @param userId User ID to check
 * @returns Number of scans remaining or null if unlimited
 */
export async function getScansRemaining(userId: number | null): Promise<number | null> {
  if (!userId) {
    return PLAN_FEATURES.FREE.scanLimit;
  }
  
  try {
    const userFeatures = await getUserPlanFeatures(userId);
    
    // If scan limit is null, user has unlimited scans
    if (userFeatures.scanLimit === null) {
      return null;
    }
    
    // Get the user's active subscription
    const userSubscriptions = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.currentPeriodEnd, new Date())
        )
      );
    
    if (!userSubscriptions || userSubscriptions.length === 0) {
      return PLAN_FEATURES.FREE.scanLimit;
    }
    
    const subscription = userSubscriptions[0];
    const scansUsed = subscription.scansUsed || 0;
    const scanLimit = userFeatures.scanLimit || 0;
    
    return Math.max(0, scanLimit - scansUsed);
  } catch (error) {
    console.error('Error getting scans remaining:', error);
    return 0;
  }
}

/**
 * Increment the user's scan count
 * @param userId User ID to increment scan count for
 * @returns Boolean indicating if the operation was successful
 */
export async function incrementScanCount(userId: number): Promise<boolean> {
  if (!userId) {
    return false;
  }
  
  try {
    // Get the user's active subscription
    const userSubscriptions = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.currentPeriodEnd, new Date())
        )
      );
    
    if (!userSubscriptions || userSubscriptions.length === 0) {
      return false;
    }
    
    const subscription = userSubscriptions[0];
    
    // Increment the scan count
    await db.update(subscriptions)
      .set({
        scansUsed: (subscription.scansUsed || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription.id));
    
    return true;
  } catch (error) {
    console.error('Error incrementing scan count:', error);
    return false;
  }
}

/**
 * Gets the user's plan name
 * @param userId User ID to get plan for
 * @returns String indicating the plan name or 'Free' if no subscription
 */
export async function getUserPlanName(userId: number | null): Promise<string> {
  if (!userId) {
    return 'Free';
  }
  
  try {
    // Get the user's active subscription
    const userSubscriptions = await db.select()
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.currentPeriodEnd, new Date())
        )
      );
    
    if (!userSubscriptions || userSubscriptions.length === 0) {
      return 'Free';
    }
    
    return userSubscriptions[0].plans.name;
  } catch (error) {
    console.error('Error getting user plan name:', error);
    return 'Free';
  }
}