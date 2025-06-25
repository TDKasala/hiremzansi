import { db } from "./db";
import { referrals, referralRewards, userCredits, users } from "@shared/schema";
import { eq, and, count, sum, sql } from "drizzle-orm";
import { generateReferralCode } from "../shared/utils";

export class ReferralService {
  
  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(userId: number): Promise<string> {
    let code: string;
    let isUnique = false;
    
    while (!isUnique) {
      code = `REF${userId}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const existing = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, code))
        .limit(1);
        
      isUnique = existing.length === 0;
    }
    
    return code!;
  }

  /**
   * Get user's existing referral code
   */
  async getUserReferralCode(userId: number): Promise<string | null> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .limit(1);
    
    return referral?.referralCode || null;
  }

  /**
   * Save user's referral code
   */
  async saveUserReferralCode(userId: number, referralCode: string): Promise<void> {
    await db.insert(referrals).values({
      referrerId: userId,
      referralCode,
      status: 'pending'
    });
  }

  /**
   * Create a referral record when someone clicks a referral link
   */
  async createReferral(referrerId: number, refereeEmail: string): Promise<string> {
    const referralCode = await this.generateReferralCode(referrerId);
    
    await db.insert(referrals).values({
      referrerId,
      referralCode,
      refereeEmail,
      status: 'pending'
    });
    
    return referralCode;
  }

  /**
   * Process referral when someone signs up using a referral code
   */
  async processReferralSignup(referralCode: string, refereeId: number): Promise<void> {
    // Find the referral record
    const referral = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referralCode, referralCode))
      .limit(1);
    
    if (referral.length === 0) {
      throw new Error('Invalid referral code');
    }
    
    // Update referral with referee information
    await db
      .update(referrals)
      .set({
        refereeId,
        status: 'registered',
        registeredAt: new Date()
      })
      .where(eq(referrals.id, referral[0].id));
    
    // Check and award signup rewards
    await this.checkAndAwardRewards(referral[0].referrerId);
  }

  /**
   * Process referral when someone upgrades to premium
   */
  async processReferralUpgrade(refereeId: number): Promise<void> {
    // Find referral record for this referee
    const referral = await db
      .select()
      .from(referrals)
      .where(eq(referrals.refereeId, refereeId))
      .limit(1);
    
    if (referral.length === 0) return;
    
    // Update referral status
    await db
      .update(referrals)
      .set({
        status: 'premium',
        premiumUpgradeAt: new Date()
      })
      .where(eq(referrals.id, referral[0].id));
    
    // Check and award premium upgrade rewards
    await this.checkAndAwardRewards(referral[0].referrerId);
  }

  /**
   * Check referral milestones and award rewards
   */
  async checkAndAwardRewards(referrerId: number): Promise<void> {
    // Get referral statistics
    const stats = await this.getReferralStats(referrerId);
    
    // Award based on milestones - aligned with current pricing
    if (stats.registered >= 1 && !await this.hasReward(referrerId, 'free_analysis')) {
      await this.awardReward(referrerId, 'free_analysis', 2, 1000, '2 Free CV Analyses (R10 value)');
    }
    
    if (stats.registered >= 3 && !await this.hasReward(referrerId, 'essential_pack')) {
      await this.awardReward(referrerId, 'essential_pack', 1, 2500, 'Free Essential Pack (R25 value)');
    }
    
    if (stats.registered >= 5 && !await this.hasReward(referrerId, 'professional_month')) {
      await this.awardReward(referrerId, 'professional_month', 1, 5000, '1-Month Professional Plan (R50 value)');
    }
    
    if (stats.premiumConversions >= 2 && !await this.hasReward(referrerId, 'professional_bonus')) {
      await this.awardReward(referrerId, 'professional_month', 1, 5000, 'Bonus Professional Month (Premium Referrals)');
    }
    
    if (stats.registered >= 10 && !await this.hasReward(referrerId, 'annual_discount')) {
      await this.awardReward(referrerId, 'discount_credit', 1, 10000, '20% Discount on Annual Plans (R100 value)');
    }
  }

  /**
   * Award a specific reward to a user
   */
  private async awardReward(
    userId: number, 
    rewardType: string, 
    rewardValue: number, 
    rewardAmount: number, 
    description: string
  ): Promise<void> {
    // Create reward record
    await db.insert(referralRewards).values({
      userId,
      referralId: 0, // We'll update this with actual referral ID if needed
      rewardType,
      rewardValue,
      rewardAmount,
      description,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    });
    
    // Update user credits
    await this.updateUserCredits(userId, rewardType, rewardValue);
  }

  /**
   * Check if user has already received a specific reward type
   */
  private async hasReward(userId: number, rewardType: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(referralRewards)
      .where(and(
        eq(referralRewards.userId, userId),
        eq(referralRewards.rewardType, rewardType)
      ))
      .limit(1);
    
    return existing.length > 0;
  }

  /**
   * Update user credits based on reward
   */
  private async updateUserCredits(userId: number, rewardType: string, rewardValue: number): Promise<void> {
    // Ensure user credits record exists
    const existingCredits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);
    
    if (existingCredits.length === 0) {
      await db.insert(userCredits).values({
        userId,
        freeAnalysisCredits: 0,
        scanCredits: 0,
        premiumMonths: 0,
        discountCredits: 0
      });
    }
    
    // Update appropriate credit type
    const updateData: any = { lastUpdated: new Date() };
    
    switch (rewardType) {
      case 'free_analysis':
        updateData.freeAnalysisCredits = sql`free_analysis_credits + ${rewardValue}`;
        break;
      case 'essential_pack':
        updateData.freeAnalysisCredits = sql`free_analysis_credits + 5`; // Essential pack = 5 analyses
        break;
      case 'scan_credits':
        updateData.scanCredits = sql`scan_credits + ${rewardValue}`;
        break;
      case 'professional_month':
      case 'professional_bonus':
        updateData.premiumMonths = sql`premium_months + ${rewardValue}`;
        break;
      case 'discount_credit':
        updateData.discountCredits = sql`COALESCE(discount_credits, 0) + ${rewardValue}`;
        break;
    }
    
    await db
      .update(userCredits)
      .set(updateData)
      .where(eq(userCredits.userId, userId));
  }

  /**
   * Get referral statistics for a user
   */
  async getReferralStats(userId: number) {
    if (!userId || isNaN(userId)) {
      return {
        invited: 0,
        registered: 0,
        premiumConversions: 0,
        freeAnalysisEarned: 0
      };
    }

    try {
      const [invitedCount] = await db
        .select({ count: count() })
        .from(referrals)
        .where(eq(referrals.referrerId, userId));
      
      const [registeredCount] = await db
        .select({ count: count() })
        .from(referrals)
        .where(and(
          eq(referrals.referrerId, userId),
          eq(referrals.status, 'registered')
        ));
      
      const [premiumCount] = await db
        .select({ count: count() })
        .from(referrals)
        .where(and(
          eq(referrals.referrerId, userId),
          eq(referrals.status, 'premium')
        ));
      
      const [rewardsEarned] = await db
        .select({ count: count() })
        .from(referralRewards)
        .where(eq(referralRewards.userId, userId));
      
      return {
        invited: invitedCount?.count || 0,
        registered: registeredCount?.count || 0,
        premiumConversions: premiumCount?.count || 0,
        freeAnalysisEarned: rewardsEarned?.count || 0
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        invited: 0,
        registered: 0,
        premiumConversions: 0,
        freeAnalysisEarned: 0
      };
    }
  }

  /**
   * Get user's active rewards
   */
  async getUserRewards(userId: number) {
    return await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId));
  }

  /**
   * Get user's credit balance
   */
  async getUserCredits(userId: number) {
    const credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);
    
    if (credits.length === 0) {
      // Create initial credits record
      await db.insert(userCredits).values({
        userId,
        freeAnalysisCredits: 0,
        scanCredits: 0,
        premiumMonths: 0,
        discountCredits: 0
      });
      
      return {
        freeAnalysisCredits: 0,
        scanCredits: 0,
        premiumMonths: 0,
        discountCredits: 0,
        totalEarned: 0,
        totalSpent: 0
      };
    }
    
    return credits[0];
  }

  /**
   * Spend user credits
   */
  /**
   * Award manual reward by admin
   */
  async awardManualReward(userId: number, rewardType: string, rewardValue: number, description: string): Promise<void> {
    try {
      // Create reward record
      await db.insert(referralRewards).values({
        userId,
        rewardType,
        rewardValue,
        rewardAmount: rewardValue,
        description,
        isRedeemed: false,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
      });
      
      // Update user credits based on reward type
      const credits = await this.getUserCredits(userId);
      let updateData = {};
      
      switch (rewardType) {
        case 'free_analysis':
          updateData = { freeAnalysisCredits: (credits.freeAnalysisCredits || 0) + rewardValue };
          break;
        case 'scan_credits':
          updateData = { scanCredits: (credits.scanCredits || 0) + rewardValue };
          break;
        case 'premium_month':
          updateData = { premiumMonths: (credits.premiumMonths || 0) + rewardValue };
          break;
        case 'discount_credit':
          updateData = { discountCredits: (credits.discountCredits || 0) + rewardValue };
          break;
      }
      
      if (Object.keys(updateData).length > 0) {
        await db.update(userCredits)
          .set(updateData)
          .where(eq(userCredits.userId, userId));
      }
    } catch (error) {
      console.error('Error awarding manual reward:', error);
      throw error;
    }
  }

  async spendCredits(userId: number, type: 'free_analysis' | 'scan_credits' | 'professional_month' | 'discount_credit', amount: number = 1): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    
    let canSpend = false;
    const updateData: any = { lastUpdated: new Date() };
    
    switch (type) {
      case 'free_analysis':
        if ((credits.freeAnalysisCredits || 0) >= amount) {
          updateData.freeAnalysisCredits = (credits.freeAnalysisCredits || 0) - amount;
          updateData.totalSpent = (credits.totalSpent || 0) + amount;
          canSpend = true;
        }
        break;
      case 'scan_credits':
        if ((credits.scanCredits || 0) >= amount) {
          updateData.scanCredits = (credits.scanCredits || 0) - amount;
          updateData.totalSpent = (credits.totalSpent || 0) + amount;
          canSpend = true;
        }
        break;
      case 'professional_month':
        if ((credits.premiumMonths || 0) >= amount) {
          updateData.premiumMonths = (credits.premiumMonths || 0) - amount;
          updateData.totalSpent = (credits.totalSpent || 0) + amount;
          canSpend = true;
        }
        break;
      case 'discount_credit':
        if ((credits.discountCredits || 0) >= amount) {
          updateData.discountCredits = (credits.discountCredits || 0) - amount;
          updateData.totalSpent = (credits.totalSpent || 0) + amount;
          canSpend = true;
        }
        break;
    }
    
    if (canSpend) {
      await db
        .update(userCredits)
        .set(updateData)
        .where(eq(userCredits.userId, userId));
    }
    
    return canSpend;
  }
}

export const referralService = new ReferralService();