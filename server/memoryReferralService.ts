interface ReferralData {
  id: string;
  referrerId: number;
  referralCode: string;
  refereeEmail?: string;
  refereeId?: number;
  status: 'pending' | 'registered' | 'premium';
  registeredAt?: Date;
  premiumUpgradeAt?: Date;
  createdAt: Date;
}

interface ReferralReward {
  id: string;
  userId: number;
  referralId: string;
  rewardType: string;
  rewardValue: number;
  rewardAmount: number;
  description: string;
  isRedeemed: boolean;
  redeemedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

interface UserCredits {
  userId: number;
  freeAnalysisCredits: number;
  scanCredits: number;
  premiumMonths: number;
  discountCredits: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Date;
  createdAt: Date;
}

export class MemoryReferralService {
  private referrals: Map<string, ReferralData> = new Map();
  private rewards: Map<string, ReferralReward> = new Map();
  private userCredits: Map<number, UserCredits> = new Map();
  
  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(userId: number): Promise<string> {
    let code: string;
    let isUnique = false;
    
    while (!isUnique) {
      code = `REF${userId}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      isUnique = !Array.from(this.referrals.values()).some(r => r.referralCode === code);
    }
    
    return code!;
  }

  /**
   * Create a referral record when someone clicks a referral link
   */
  async createReferral(referrerId: number, refereeEmail: string): Promise<string> {
    const referralCode = await this.generateReferralCode(referrerId);
    const id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const referral: ReferralData = {
      id,
      referrerId,
      referralCode,
      refereeEmail,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.referrals.set(id, referral);
    return referralCode;
  }

  /**
   * Process referral when someone signs up using a referral code
   */
  async processReferralSignup(referralCode: string, refereeId: number): Promise<void> {
    const referral = Array.from(this.referrals.values()).find(r => r.referralCode === referralCode);
    
    if (!referral) {
      throw new Error('Invalid referral code');
    }
    
    referral.refereeId = refereeId;
    referral.status = 'registered';
    referral.registeredAt = new Date();
    
    this.referrals.set(referral.id, referral);
    
    // Check and award signup rewards
    await this.checkAndAwardRewards(referral.referrerId);
  }

  /**
   * Process referral when someone upgrades to premium
   */
  async processReferralUpgrade(refereeId: number): Promise<void> {
    const referral = Array.from(this.referrals.values()).find(r => r.refereeId === refereeId);
    
    if (!referral) return;
    
    referral.status = 'premium';
    referral.premiumUpgradeAt = new Date();
    this.referrals.set(referral.id, referral);
    
    // Check and award premium upgrade rewards
    await this.checkAndAwardRewards(referral.referrerId);
  }

  /**
   * Check referral milestones and award rewards
   */
  async checkAndAwardRewards(referrerId: number): Promise<void> {
    const stats = await this.getReferralStats(referrerId);
    
    // Award based on milestones - aligned with actual pricing
    if (stats.registered >= 1 && !await this.hasReward(referrerId, 'free_analysis')) {
      await this.awardReward(referrerId, 'free_analysis', 2, 0, '2 Free CV Analyses (Welcome Reward)');
    }
    
    if (stats.registered >= 3 && !await this.hasReward(referrerId, 'essential_pack')) {
      await this.awardReward(referrerId, 'essential_pack', 1, 4900, 'Free Essential Pack (R49 value)');
    }
    
    if (stats.registered >= 5 && !await this.hasReward(referrerId, 'professional_month')) {
      await this.awardReward(referrerId, 'professional_month', 1, 9900, '1-Month Professional Plan (R99 value)');
    }
    
    if (stats.premiumConversions >= 3 && !await this.hasReward(referrerId, 'professional_bonus')) {
      await this.awardReward(referrerId, 'professional_month', 1, 9900, 'Bonus Professional Month (Premium Referrals)');
    }
    
    if (stats.registered >= 10 && !await this.hasReward(referrerId, 'annual_discount')) {
      await this.awardReward(referrerId, 'discount_credit', 1, 20000, '20% Discount on Annual Plans');
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
    const id = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const reward: ReferralReward = {
      id,
      userId,
      referralId: '0',
      rewardType,
      rewardValue,
      rewardAmount,
      description,
      isRedeemed: false,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      createdAt: new Date()
    };
    
    this.rewards.set(id, reward);
    
    // Update user credits
    await this.updateUserCredits(userId, rewardType, rewardValue);
  }

  /**
   * Check if user has already received a specific reward type
   */
  private async hasReward(userId: number, rewardType: string): Promise<boolean> {
    return Array.from(this.rewards.values()).some(r => 
      r.userId === userId && r.rewardType === rewardType
    );
  }

  /**
   * Update user credits based on reward
   */
  private async updateUserCredits(userId: number, rewardType: string, rewardValue: number): Promise<void> {
    let credits = this.userCredits.get(userId);
    
    if (!credits) {
      credits = {
        userId,
        freeAnalysisCredits: 0,
        scanCredits: 0,
        premiumMonths: 0,
        discountCredits: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: new Date(),
        createdAt: new Date()
      };
    }
    
    switch (rewardType) {
      case 'free_analysis':
        credits.freeAnalysisCredits += rewardValue;
        break;
      case 'essential_pack':
        credits.freeAnalysisCredits += 5; // Essential pack = 5 analyses
        break;
      case 'scan_credits':
        credits.scanCredits += rewardValue;
        break;
      case 'professional_month':
      case 'professional_bonus':
        credits.premiumMonths += rewardValue;
        break;
      case 'discount_credit':
        credits.discountCredits += rewardValue;
        break;
    }
    
    credits.totalEarned += rewardValue;
    credits.lastUpdated = new Date();
    
    this.userCredits.set(userId, credits);
  }

  /**
   * Get referral statistics for a user
   */
  async getReferralStats(userId: number) {
    const userReferrals = Array.from(this.referrals.values()).filter(r => r.referrerId === userId);
    
    const invited = userReferrals.length;
    const registered = userReferrals.filter(r => r.status === 'registered' || r.status === 'premium').length;
    const premiumConversions = userReferrals.filter(r => r.status === 'premium').length;
    const rewardsEarned = Array.from(this.rewards.values()).filter(r => r.userId === userId).length;
    
    return {
      invited,
      registered,
      premiumConversions,
      freeAnalysisEarned: rewardsEarned
    };
  }

  /**
   * Get user's active rewards
   */
  async getUserRewards(userId: number) {
    return Array.from(this.rewards.values()).filter(r => r.userId === userId);
  }

  /**
   * Get user's credit balance
   */
  async getUserCredits(userId: number) {
    const credits = this.userCredits.get(userId);
    
    if (!credits) {
      const newCredits: UserCredits = {
        userId,
        freeAnalysisCredits: 0,
        scanCredits: 0,
        premiumMonths: 0,
        discountCredits: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: new Date(),
        createdAt: new Date()
      };
      
      this.userCredits.set(userId, newCredits);
      return newCredits;
    }
    
    return credits;
  }

  /**
   * Spend user credits
   */
  async spendCredits(userId: number, type: 'free_analysis' | 'scan_credits' | 'professional_month' | 'discount_credit', amount: number = 1): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    
    let canSpend = false;
    
    switch (type) {
      case 'free_analysis':
        if (credits.freeAnalysisCredits >= amount) {
          credits.freeAnalysisCredits -= amount;
          credits.totalSpent += amount;
          canSpend = true;
        }
        break;
      case 'scan_credits':
        if (credits.scanCredits >= amount) {
          credits.scanCredits -= amount;
          credits.totalSpent += amount;
          canSpend = true;
        }
        break;
      case 'professional_month':
        if (credits.premiumMonths >= amount) {
          credits.premiumMonths -= amount;
          credits.totalSpent += amount;
          canSpend = true;
        }
        break;
      case 'discount_credit':
        if (credits.discountCredits >= amount) {
          credits.discountCredits -= amount;
          credits.totalSpent += amount;
          canSpend = true;
        }
        break;
    }
    
    if (canSpend) {
      credits.lastUpdated = new Date();
      this.userCredits.set(userId, credits);
    }
    
    return canSpend;
  }

  /**
   * Get user's referral code
   */
  async getUserReferralCode(userId: number): Promise<string> {
    const existingReferral = Array.from(this.referrals.values())
      .find(r => r.referrerId === userId);
    
    if (existingReferral) {
      return existingReferral.referralCode;
    }
    
    // Create new referral code
    const code = await this.generateReferralCode(userId);
    const id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const referral: ReferralData = {
      id,
      referrerId: userId,
      referralCode: code,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.referrals.set(id, referral);
    return code;
  }

  /**
   * Get all referrals made by a user
   */
  async getUserReferrals(userId: number) {
    return Array.from(this.referrals.values())
      .filter(r => r.referrerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const memoryReferralService = new MemoryReferralService();