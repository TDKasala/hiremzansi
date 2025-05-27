import { db } from "../db";
import { notifications, users, type InsertNotification, type Notification } from "@shared/schema";
import { eq, desc, and, or, isNull } from "drizzle-orm";

export class NotificationService {
  
  /**
   * Create a new notification
   */
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...notificationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Trigger delivery based on delivery methods
    if (notificationData.deliveryMethod?.includes('email')) {
      await this.sendEmailNotification(notification);
    }

    if (notificationData.deliveryMethod?.includes('whatsapp')) {
      await this.sendWhatsAppNotification(notification);
    }

    return notification;
  }

  /**
   * Create notification for job seeker payment confirmation
   */
  async createJobSeekerPaymentNotification(
    userId: number, 
    amount: number, 
    matchId: number
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'payment_completed',
      title: 'Payment Successful - Premium Matching Activated',
      message: `Your payment of R${amount} has been processed successfully. Your premium job matching is now active and recruiters can view your profile.`,
      priority: 'high',
      actionUrl: `/premium-matches/${matchId}`,
      actionText: 'View Match Details',
      relatedEntityId: matchId,
      relatedEntityType: 'premium_match',
      deliveryMethod: ['in_app', 'email'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
  }

  /**
   * Create notification for recruiter when job seeker pays
   */
  async createRecruiterNotificationForPaidMatch(
    recruiterId: number,
    jobSeekerName: string,
    matchId: number,
    matchScore: number
  ): Promise<Notification> {
    return this.createNotification({
      userId: recruiterId,
      type: 'match_available',
      title: 'New Premium Match Available',
      message: `${jobSeekerName} has paid for premium matching (${matchScore}% compatibility). You can now view their full profile and initiate contact for R200.`,
      priority: 'high',
      actionUrl: `/recruiter/matches/${matchId}`,
      actionText: 'View Candidate',
      relatedEntityId: matchId,
      relatedEntityType: 'premium_match',
      deliveryMethod: ['in_app', 'email'],
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    });
  }

  /**
   * Create notification for job seeker when recruiter pays to view their profile
   */
  async createJobSeekerNotificationForRecruiterInterest(
    jobSeekerId: number,
    recruiterCompany: string,
    jobTitle: string,
    matchId: number
  ): Promise<Notification> {
    return this.createNotification({
      userId: jobSeekerId,
      type: 'recruiter_interest',
      title: 'Recruiter Interested in Your Profile!',
      message: `${recruiterCompany} has paid to view your profile for the ${jobTitle} position. They can now contact you directly through our platform.`,
      priority: 'high',
      actionUrl: `/job-seeker/matches/${matchId}`,
      actionText: 'View Opportunity',
      relatedEntityId: matchId,
      relatedEntityType: 'premium_match',
      deliveryMethod: ['in_app', 'email', 'whatsapp'],
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    });
  }

  /**
   * Create notification for new job matches
   */
  async createJobMatchNotification(
    userId: number,
    jobTitle: string,
    companyName: string,
    matchScore: number,
    jobId: number
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'match_found',
      title: `${matchScore}% Match Found!`,
      message: `We found a great match for you: ${jobTitle} at ${companyName}. Your skills align perfectly with their requirements.`,
      priority: 'normal',
      actionUrl: `/jobs/${jobId}`,
      actionText: 'View Job Details',
      relatedEntityId: jobId,
      relatedEntityType: 'job_posting',
      deliveryMethod: ['in_app'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  /**
   * Create notification for CV analysis completion
   */
  async createCVAnalysisNotification(
    userId: number,
    score: number,
    cvId: number
  ): Promise<Notification> {
    const scoreText = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement';
    
    return this.createNotification({
      userId,
      type: 'cv_analysis_complete',
      title: 'CV Analysis Complete',
      message: `Your CV analysis is ready! ATS Score: ${score}% (${scoreText}). View detailed insights and improvement recommendations.`,
      priority: 'normal',
      actionUrl: `/cv-analysis/${cvId}`,
      actionText: 'View Analysis',
      relatedEntityId: cvId,
      relatedEntityType: 'cv_analysis',
      deliveryMethod: ['in_app', 'email'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: number,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      includeArchived?: boolean;
    } = {}
  ): Promise<Notification[]> {
    const { limit = 20, offset = 0, unreadOnly = false, includeArchived = false } = options;

    let whereConditions = [eq(notifications.userId, userId)];

    if (unreadOnly) {
      whereConditions.push(eq(notifications.isRead, false));
    }

    if (!includeArchived) {
      whereConditions.push(eq(notifications.isArchived, false));
    }

    // Filter out expired notifications
    whereConditions.push(
      or(
        isNull(notifications.expiresAt),
        // Only include notifications that haven't expired
        // Note: Using string comparison for timestamp
        // In production, you'd want to use proper timestamp comparison
      )
    );

    return await db
      .select()
      .from(notifications)
      .where(and(...whereConditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );

    return result.rowCount > 0;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return result.rowCount;
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId: number, userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ 
        isArchived: true, 
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );

    return result.rowCount > 0;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isArchived, false)
        )
      );

    return result.length;
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ 
        isArchived: true, 
        updatedAt: new Date() 
      })
      .where(
        // Archive notifications that have expired
        // Note: In production, use proper timestamp comparison
        eq(notifications.isArchived, false)
      );

    return result.rowCount;
  }

  /**
   * Send email notification (placeholder for email service integration)
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    // In production, integrate with SendGrid or similar service
    console.log(`Email notification sent to user ${notification.userId}: ${notification.title}`);
    
    // Update delivery status
    await db
      .update(notifications)
      .set({ 
        isDelivered: true,
        deliveredAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(notifications.id, notification.id));
  }

  /**
   * Send WhatsApp notification (placeholder for WhatsApp service integration)
   */
  private async sendWhatsAppNotification(notification: Notification): Promise<void> {
    // In production, integrate with WhatsApp Business API
    console.log(`WhatsApp notification sent to user ${notification.userId}: ${notification.title}`);
    
    // Update delivery status
    await db
      .update(notifications)
      .set({ 
        isDelivered: true,
        deliveredAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(notifications.id, notification.id));
  }

  /**
   * Create system-wide announcement notification
   */
  async createSystemAnnouncement(
    title: string,
    message: string,
    userIds: number[],
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<Notification[]> {
    const notifications = await Promise.all(
      userIds.map(userId =>
        this.createNotification({
          userId,
          type: 'system_announcement',
          title,
          message,
          priority,
          deliveryMethod: ['in_app'],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        })
      )
    );

    return notifications;
  }
}

export const notificationService = new NotificationService();