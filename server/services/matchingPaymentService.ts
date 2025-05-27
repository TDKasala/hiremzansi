import { db } from "../db";
import { 
  matchingServicePayments, 
  premiumJobMatches,
  recruiterProfiles,
  premiumJobSeekerProfiles,
  type InsertMatchingServicePayment 
} from "../../shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Payment Service for Premium Matching
 * Handles payments for contact unlocking and subscription plans
 */
export class MatchingPaymentService {
  
  /**
   * Create payment for contact unlock (used by both recruiters and job seekers)
   */
  async createContactUnlockPayment(
    userId: number,
    userType: 'recruiter' | 'job_seeker',
    matchId: number,
    amount: number = 99.00 // R99 default for contact unlock
  ) {
    try {
      // Verify the match exists and belongs to the user
      const match = await this.verifyMatchAccess(matchId, userId, userType);
      if (!match) {
        throw new Error('Match not found or access denied');
      }
      
      // Check if already paid
      const existingPayment = await db
        .select()
        .from(matchingServicePayments)
        .where(
          and(
            eq(matchingServicePayments.userId, userId),
            eq(matchingServicePayments.relatedEntityId, matchId),
            eq(matchingServicePayments.paymentType, 'contact_unlock'),
            eq(matchingServicePayments.status, 'completed')
          )
        )
        .limit(1);
        
      if (existingPayment.length > 0) {
        throw new Error('Contact already unlocked for this match');
      }
      
      // Create payment intent with Stripe
      const paymentData: InsertMatchingServicePayment = {
        userId,
        userType,
        paymentType: 'contact_unlock',
        amount: amount.toString(),
        currency: 'ZAR',
        description: `Unlock contact details for job match`,
        relatedEntityId: matchId,
        relatedEntityType: 'match',
        status: 'pending'
      };
      
      const [payment] = await db
        .insert(matchingServicePayments)
        .values(paymentData)
        .returning();
        
      return {
        paymentId: payment.id,
        amount,
        currency: 'ZAR',
        description: paymentData.description
      };
      
    } catch (error) {
      console.error('Error creating contact unlock payment:', error);
      throw error;
    }
  }
  
  /**
   * Process successful payment and unlock contact
   */
  async processSuccessfulPayment(
    paymentId: number,
    stripePaymentIntentId: string
  ) {
    try {
      // Update payment status
      const [payment] = await db
        .update(matchingServicePayments)
        .set({
          status: 'completed',
          stripePaymentIntentId,
          updatedAt: new Date()
        })
        .where(eq(matchingServicePayments.id, paymentId))
        .returning();
        
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      // If this is a contact unlock payment, unlock the contact
      if (payment.paymentType === 'contact_unlock' && payment.relatedEntityId) {
        await this.unlockMatchContact(payment.relatedEntityId, payment.userId, payment.userType);
      }
      
      return payment;
      
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw error;
    }
  }
  
  /**
   * Unlock contact information for a match
   */
  private async unlockMatchContact(
    matchId: number, 
    userId: number, 
    userType: 'recruiter' | 'job_seeker'
  ) {
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (userType === 'recruiter') {
      updateData.recruiterPaidToContact = true;
    } else {
      updateData.jobSeekerPaidToContact = true;
    }
    
    // Check if both parties have paid (mutual unlock)
    const match = await db
      .select()
      .from(premiumJobMatches)
      .where(eq(premiumJobMatches.id, matchId))
      .limit(1);
      
    if (match.length > 0) {
      const currentMatch = match[0];
      const bothPaid = userType === 'recruiter' 
        ? true && currentMatch.jobSeekerPaidToContact
        : currentMatch.recruiterPaidToContact && true;
        
      if (bothPaid) {
        updateData.contactUnlocked = true;
        updateData.contactUnlockedAt = new Date();
        updateData.status = 'mutual_interest';
      }
    }
    
    await db
      .update(premiumJobMatches)
      .set(updateData)
      .where(eq(premiumJobMatches.id, matchId));
  }
  
  /**
   * Verify user has access to this match
   */
  private async verifyMatchAccess(
    matchId: number, 
    userId: number, 
    userType: 'recruiter' | 'job_seeker'
  ) {
    const match = await db
      .select()
      .from(premiumJobMatches)
      .where(eq(premiumJobMatches.id, matchId))
      .limit(1);
      
    if (match.length === 0) return null;
    
    const matchData = match[0];
    
    if (userType === 'recruiter') {
      // Verify recruiter owns this match
      const recruiter = await db
        .select()
        .from(recruiterProfiles)
        .where(
          and(
            eq(recruiterProfiles.userId, userId),
            eq(recruiterProfiles.id, matchData.recruiterId)
          )
        )
        .limit(1);
        
      return recruiter.length > 0 ? matchData : null;
    } else {
      // Verify job seeker owns this match
      const jobSeeker = await db
        .select()
        .from(premiumJobSeekerProfiles)
        .where(
          and(
            eq(premiumJobSeekerProfiles.userId, userId),
            eq(premiumJobSeekerProfiles.id, matchData.jobSeekerId)
          )
        )
        .limit(1);
        
      return jobSeeker.length > 0 ? matchData : null;
    }
  }
  
  /**
   * Get payment history for user
   */
  async getUserPaymentHistory(userId: number, limit: number = 50) {
    return await db
      .select()
      .from(matchingServicePayments)
      .where(eq(matchingServicePayments.userId, userId))
      .orderBy(matchingServicePayments.createdAt)
      .limit(limit);
  }
  
  /**
   * Get revenue analytics (admin only)
   */
  async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    // TODO: Implement comprehensive revenue analytics
    // This would include total revenue, revenue by payment type, etc.
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      contactUnlockRevenue: 0,
      subscriptionRevenue: 0
    };
  }
}

export const matchingPaymentService = new MatchingPaymentService();