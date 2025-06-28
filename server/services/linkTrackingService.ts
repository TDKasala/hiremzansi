import { db } from "../db";
import { linkTracking, linkClicks, type InsertLinkTracking, type InsertLinkClick } from "../../shared/schema";
import { eq, desc, sql, and, gte, count } from "drizzle-orm";

export class LinkTrackingService {
  // Create or get a tracked link
  async getOrCreateTrackedLink(linkData: InsertLinkTracking) {
    try {
      // Check if link already exists
      const existingLink = await db
        .select()
        .from(linkTracking)
        .where(and(
          eq(linkTracking.linkName, linkData.linkName),
          eq(linkTracking.page, linkData.page)
        ))
        .limit(1);

      if (existingLink.length > 0) {
        return existingLink[0];
      }

      // Create new tracked link
      const [newLink] = await db
        .insert(linkTracking)
        .values(linkData)
        .returning();

      return newLink;
    } catch (error) {
      console.error("Error creating tracked link:", error);
      throw error;
    }
  }

  // Record a click event
  async recordClick(clickData: InsertLinkClick) {
    try {
      const [click] = await db
        .insert(linkClicks)
        .values(clickData)
        .returning();

      return click;
    } catch (error) {
      console.error("Error recording click:", error);
      throw error;
    }
  }

  // Get click analytics for admin dashboard
  async getClickAnalytics(dateRange?: { start: Date; end: Date }) {
    try {
      const whereClause = dateRange
        ? gte(linkClicks.clickedAt, dateRange.start)
        : undefined;

      // Total clicks
      const totalClicks = await db
        .select({ count: count() })
        .from(linkClicks)
        .where(whereClause);

      // Clicks by link
      const clicksByLink = await db
        .select({
          linkId: linkTracking.id,
          linkName: linkTracking.linkName,
          linkUrl: linkTracking.linkUrl,
          category: linkTracking.category,
          page: linkTracking.page,
          clickCount: count(linkClicks.id),
        })
        .from(linkTracking)
        .leftJoin(linkClicks, eq(linkTracking.id, linkClicks.linkId))
        .where(whereClause ? gte(linkClicks.clickedAt, dateRange!.start) : undefined)
        .groupBy(
          linkTracking.id,
          linkTracking.linkName,
          linkTracking.linkUrl,
          linkTracking.category,
          linkTracking.page
        )
        .orderBy(desc(count(linkClicks.id)));

      // Clicks by page
      const clicksByPage = await db
        .select({
          page: linkTracking.page,
          clickCount: count(linkClicks.id),
        })
        .from(linkTracking)
        .leftJoin(linkClicks, eq(linkTracking.id, linkClicks.linkId))
        .where(whereClause ? gte(linkClicks.clickedAt, dateRange!.start) : undefined)
        .groupBy(linkTracking.page)
        .orderBy(desc(count(linkClicks.id)));

      // Clicks by device
      const clicksByDevice = await db
        .select({
          device: linkClicks.device,
          clickCount: count(),
        })
        .from(linkClicks)
        .where(whereClause)
        .groupBy(linkClicks.device)
        .orderBy(desc(count()));

      // Recent clicks (last 100)
      const recentClicks = await db
        .select({
          id: linkClicks.id,
          linkName: linkTracking.linkName,
          linkUrl: linkTracking.linkUrl,
          page: linkTracking.page,
          userId: linkClicks.userId,
          device: linkClicks.device,
          browser: linkClicks.browser,
          country: linkClicks.country,
          city: linkClicks.city,
          clickedAt: linkClicks.clickedAt,
        })
        .from(linkClicks)
        .leftJoin(linkTracking, eq(linkClicks.linkId, linkTracking.id))
        .where(whereClause)
        .orderBy(desc(linkClicks.clickedAt))
        .limit(100);

      return {
        totalClicks: totalClicks[0]?.count || 0,
        clicksByLink,
        clicksByPage,
        clicksByDevice,
        recentClicks,
      };
    } catch (error) {
      console.error("Error getting click analytics:", error);
      throw error;
    }
  }

  // Get top performing links
  async getTopLinks(limit: number = 10, dateRange?: { start: Date; end: Date }) {
    try {
      const whereClause = dateRange
        ? gte(linkClicks.clickedAt, dateRange.start)
        : undefined;

      const topLinks = await db
        .select({
          linkId: linkTracking.id,
          linkName: linkTracking.linkName,
          linkUrl: linkTracking.linkUrl,
          category: linkTracking.category,
          page: linkTracking.page,
          clickCount: count(linkClicks.id),
        })
        .from(linkTracking)
        .leftJoin(linkClicks, eq(linkTracking.id, linkClicks.linkId))
        .where(whereClause)
        .groupBy(
          linkTracking.id,
          linkTracking.linkName,
          linkTracking.linkUrl,
          linkTracking.category,
          linkTracking.page
        )
        .orderBy(desc(count(linkClicks.id)))
        .limit(limit);

      return topLinks;
    } catch (error) {
      console.error("Error getting top links:", error);
      throw error;
    }
  }

  // Get click trends by day
  async getClickTrends(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await db
        .select({
          date: sql<string>`DATE(${linkClicks.clickedAt})`,
          clickCount: count(),
        })
        .from(linkClicks)
        .where(gte(linkClicks.clickedAt, startDate))
        .groupBy(sql`DATE(${linkClicks.clickedAt})`)
        .orderBy(sql`DATE(${linkClicks.clickedAt})`);

      return trends;
    } catch (error) {
      console.error("Error getting click trends:", error);
      throw error;
    }
  }

  // Utility function to detect device type from user agent
  static detectDevice(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Utility function to detect browser from user agent
  static detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    return 'Unknown';
  }

  // Utility function to detect OS from user agent
  static detectOS(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios')) return 'iOS';
    return 'Unknown';
  }
}

export const linkTrackingService = new LinkTrackingService();