import { db } from "../db";
import { paymentTransactions, premiumJobMatches, users, type InsertPaymentTransaction, type PaymentTransaction } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { notificationService } from "./notificationService";

export class PaymentService {
  private readonly JOB_SEEKER_PRICE = 50; // R50 for job seekers
  private readonly RECRUITER_PRICE = 200; // R200 for recruiters

  /**
   * Create payment for job seeker to join premium matching
   */
  async createJobSeekerPayment(
    userId: number,
    cvId: number,
    matchId?: number
  ): Promise<{ payment: PaymentTransaction; paymentUrl: string }> {
    const transactionId = this.generateTransactionId();
    
    const paymentData: InsertPaymentTransaction = {
      userId,
      amount: this.JOB_SEEKER_PRICE.toString(),
      paymentType: 'job_seeker_match',
      userType: 'job_seeker',
      transactionId,
      relatedEntityId: matchId || cvId,
      relatedEntityType: matchId ? 'premium_match' : 'cv',
      description: `Premium Job Matching Access - CV #${cvId}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    const [payment] = await db
      .insert(paymentTransactions)
      .values(paymentData)
      .returning();

    // Generate PayFast payment URL
    const paymentUrl = this.generatePayFastUrl(payment);

    // Update payment with URLs
    await db
      .update(paymentTransactions)
      .set({
        paymentUrl,
        returnUrl: `${process.env.BASE_URL}/payment/success?id=${payment.id}`,
        cancelUrl: `${process.env.BASE_URL}/payment/cancel?id=${payment.id}`,
        notifyUrl: `${process.env.BASE_URL}/api/payment/notify`,
      })
      .where(eq(paymentTransactions.id, payment.id));

    return { payment, paymentUrl };
  }

  /**
   * Create payment for recruiter to access job seeker profile
   */
  async createRecruiterPayment(
    recruiterId: number,
    matchId: number,
    jobSeekerId: number
  ): Promise<{ payment: PaymentTransaction; paymentUrl: string }> {
    const transactionId = this.generateTransactionId();
    
    const paymentData: InsertPaymentTransaction = {
      userId: recruiterId,
      amount: this.RECRUITER_PRICE.toString(),
      paymentType: 'recruiter_access',
      userType: 'recruiter',
      transactionId,
      relatedEntityId: matchId,
      relatedEntityType: 'premium_match',
      description: `Premium Candidate Access - Match #${matchId}`,
      metadata: { jobSeekerId },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    const [payment] = await db
      .insert(paymentTransactions)
      .values(paymentData)
      .returning();

    // Generate PayFast payment URL
    const paymentUrl = this.generatePayFastUrl(payment);

    // Update payment with URLs
    await db
      .update(paymentTransactions)
      .set({
        paymentUrl,
        returnUrl: `${process.env.BASE_URL}/recruiter/payment/success?id=${payment.id}`,
        cancelUrl: `${process.env.BASE_URL}/recruiter/payment/cancel?id=${payment.id}`,
        notifyUrl: `${process.env.BASE_URL}/api/payment/notify`,
      })
      .where(eq(paymentTransactions.id, payment.id));

    return { payment, paymentUrl };
  }

  /**
   * Process successful payment notification from PayFast
   */
  async processPaymentSuccess(
    transactionId: string,
    providerTransactionId: string,
    metadata?: any
  ): Promise<boolean> {
    const [payment] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, transactionId));

    if (!payment) {
      console.error(`Payment not found for transaction: ${transactionId}`);
      return false;
    }

    if (payment.status === 'completed') {
      console.log(`Payment already processed: ${transactionId}`);
      return true;
    }

    // Update payment status
    await db
      .update(paymentTransactions)
      .set({
        status: 'completed',
        providerTransactionId,
        paidAt: new Date(),
        metadata: { ...payment.metadata, ...metadata },
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.id, payment.id));

    // Handle payment completion based on type
    if (payment.paymentType === 'job_seeker_match') {
      await this.handleJobSeekerPaymentSuccess(payment);
    } else if (payment.paymentType === 'recruiter_access') {
      await this.handleRecruiterPaymentSuccess(payment);
    }

    return true;
  }

  /**
   * Handle job seeker payment success
   */
  private async handleJobSeekerPaymentSuccess(payment: PaymentTransaction): Promise<void> {
    // Create success notification for job seeker
    await notificationService.createJobSeekerPaymentNotification(
      payment.userId,
      Number(payment.amount),
      payment.relatedEntityId || 0
    );

    // If this is for a specific match, update the match record
    if (payment.relatedEntityType === 'premium_match' && payment.relatedEntityId) {
      await db
        .update(premiumJobMatches)
        .set({
          jobSeekerPaid: true,
          jobSeekerPaymentId: payment.id,
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(premiumJobMatches.id, payment.relatedEntityId));

      // Notify the recruiter that a candidate is now available
      const [match] = await db
        .select()
        .from(premiumJobMatches)
        .where(eq(premiumJobMatches.id, payment.relatedEntityId));

      if (match) {
        const [jobSeeker] = await db
          .select()
          .from(users)
          .where(eq(users.id, match.jobSeekerId));

        if (jobSeeker) {
          await notificationService.createRecruiterNotificationForPaidMatch(
            match.recruiterId,
            jobSeeker.name || jobSeeker.username,
            match.id,
            match.matchScore
          );
        }
      }
    }

    console.log(`Job seeker payment processed successfully: ${payment.transactionId}`);
  }

  /**
   * Handle recruiter payment success
   */
  private async handleRecruiterPaymentSuccess(payment: PaymentTransaction): Promise<void> {
    // Update the match record
    if (payment.relatedEntityType === 'premium_match' && payment.relatedEntityId) {
      await db
        .update(premiumJobMatches)
        .set({
          recruiterPaid: true,
          recruiterPaymentId: payment.id,
          communicationEnabled: true,
          updatedAt: new Date(),
        })
        .where(eq(premiumJobMatches.id, payment.relatedEntityId));

      // Notify the job seeker that a recruiter is interested
      const [match] = await db
        .select()
        .from(premiumJobMatches)
        .where(eq(premiumJobMatches.id, payment.relatedEntityId));

      if (match) {
        await notificationService.createJobSeekerNotificationForRecruiterInterest(
          match.jobSeekerId,
          "A Premium Company", // In production, get actual company name
          "Exciting Position", // In production, get actual job title
          match.id
        );
      }
    }

    console.log(`Recruiter payment processed successfully: ${payment.transactionId}`);
  }

  /**
   * Process failed payment
   */
  async processPaymentFailure(
    transactionId: string,
    failureReason: string
  ): Promise<boolean> {
    const [payment] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, transactionId));

    if (!payment) {
      return false;
    }

    await db
      .update(paymentTransactions)
      .set({
        status: 'failed',
        failureReason,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.id, payment.id));

    // Create failure notification
    await notificationService.createNotification({
      userId: payment.userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Your payment of R${payment.amount} could not be processed. ${failureReason}`,
      priority: 'high',
      actionUrl: `/payment/retry?id=${payment.id}`,
      actionText: 'Retry Payment',
      relatedEntityId: payment.id,
      relatedEntityType: 'payment',
      deliveryMethod: ['in_app', 'email'],
    });

    return true;
  }

  /**
   * Get user payment history
   */
  async getUserPaymentHistory(
    userId: number,
    limit: number = 10,
    offset: number = 0
  ): Promise<PaymentTransaction[]> {
    return await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(transactionId: string): Promise<PaymentTransaction | null> {
    const [payment] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, transactionId));

    return payment || null;
  }

  /**
   * Check if user has paid for a specific match
   */
  async hasUserPaidForMatch(userId: number, matchId: number, userType: 'job_seeker' | 'recruiter'): Promise<boolean> {
    const paymentType = userType === 'job_seeker' ? 'job_seeker_match' : 'recruiter_access';
    
    const [payment] = await db
      .select()
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.userId, userId),
          eq(paymentTransactions.relatedEntityId, matchId),
          eq(paymentTransactions.paymentType, paymentType),
          eq(paymentTransactions.status, 'completed')
        )
      );

    return !!payment;
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ATS_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Generate PayFast payment URL
   */
  private generatePayFastUrl(payment: PaymentTransaction): string {
    // In production, you would use actual PayFast integration
    // For now, return a mock URL that redirects to success/cancel pages
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    
    // Mock PayFast URL - replace with actual PayFast integration
    const payFastParams = new URLSearchParams({
      merchant_id: process.env.PAYFAST_MERCHANT_ID || 'demo_merchant',
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || 'demo_key',
      return_url: `${baseUrl}/payment/success?id=${payment.id}`,
      cancel_url: `${baseUrl}/payment/cancel?id=${payment.id}`,
      notify_url: `${baseUrl}/api/payment/notify`,
      amount: payment.amount,
      item_name: payment.description || 'Hire Mzansi Premium Service',
      custom_str1: payment.transactionId,
    });

    // For development - simulate payment gateway
    if (process.env.NODE_ENV === 'development') {
      return `${baseUrl}/payment/simulator?${payFastParams.toString()}`;
    }

    // Production PayFast URL
    return `https://www.payfast.co.za/eng/process?${payFastParams.toString()}`;
  }

  /**
   * Process refund request
   */
  async processRefund(
    paymentId: number,
    refundAmount: number,
    reason: string
  ): Promise<boolean> {
    const [payment] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, paymentId));

    if (!payment || payment.status !== 'completed') {
      return false;
    }

    await db
      .update(paymentTransactions)
      .set({
        status: 'refunded',
        refundAmount: refundAmount.toString(),
        refundReason: reason,
        refundedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.id, paymentId));

    // Create refund notification
    await notificationService.createNotification({
      userId: payment.userId,
      type: 'payment_refunded',
      title: 'Refund Processed',
      message: `Your refund of R${refundAmount} has been processed successfully. ${reason}`,
      priority: 'normal',
      relatedEntityId: payment.id,
      relatedEntityType: 'payment',
      deliveryMethod: ['in_app', 'email'],
    });

    return true;
  }
}

export const paymentService = new PaymentService();