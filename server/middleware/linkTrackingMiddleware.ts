import { Request, Response, NextFunction } from "express";
import { linkTrackingService, LinkTrackingService } from "../services/linkTrackingService";

// Extend Request interface to include tracking data
declare global {
  namespace Express {
    interface Request {
      trackingData?: {
        userId?: number;
        sessionId?: string;
        ipAddress?: string;
        userAgent?: string;
        referer?: string;
        device?: string;
        browser?: string;
        os?: string;
      };
    }
  }
}

// Middleware to extract tracking data from request
export const extractTrackingData = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID if authenticated
    const userId = req.user?.id || (req.session as any)?.userId || null;
    
    // Get session ID
    const sessionId = req.sessionID || 'anonymous';
    
    // Get IP address (handle proxy headers)
    const ipAddress = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown';
    
    // Get user agent
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Get referer
    const refererHeader = req.headers.referer || req.headers.referrer;
    const referer = Array.isArray(refererHeader) ? refererHeader[0] : refererHeader || 'direct';
    
    // Detect device, browser, and OS
    const device = LinkTrackingService.detectDevice(userAgent);
    const browser = LinkTrackingService.detectBrowser(userAgent);
    const os = LinkTrackingService.detectOS(userAgent);
    
    // Attach tracking data to request
    req.trackingData = {
      userId,
      sessionId,
      ipAddress,
      userAgent,
      referer,
      device,
      browser,
      os,
    };
    
    next();
  } catch (error) {
    console.error("Error extracting tracking data:", error);
    next(); // Continue even if tracking fails
  }
};

// Function to create trackable link and record click
export const trackLinkClick = async (
  linkName: string,
  linkUrl: string,
  linkType: 'internal' | 'external' | 'download' | 'action',
  category: 'navigation' | 'cta' | 'social' | 'referral' | 'footer' | 'header',
  page: string,
  req: Request,
  description?: string
) => {
  try {
    // Create or get tracked link
    const trackedLink = await linkTrackingService.getOrCreateTrackedLink({
      linkName,
      linkUrl,
      linkType,
      category,
      page,
      description,
    });

    // Record click if tracking data is available
    if (req.trackingData && trackedLink) {
      await linkTrackingService.recordClick({
        linkId: trackedLink.id,
        userId: req.trackingData.userId,
        sessionId: req.trackingData.sessionId,
        ipAddress: req.trackingData.ipAddress,
        userAgent: req.trackingData.userAgent,
        referer: req.trackingData.referer,
        device: req.trackingData.device,
        browser: req.trackingData.browser,
        os: req.trackingData.os,
      });
    }

    return trackedLink;
  } catch (error) {
    console.error("Error tracking link click:", error);
    // Don't throw error to prevent breaking the user experience
    return null;
  }
};

// Express route handler for tracking link clicks via API
export const handleLinkClick = async (req: Request, res: Response) => {
  try {
    const { linkName, linkUrl, linkType, category, page, description } = req.body;

    if (!linkName || !linkUrl || !linkType || !category || !page) {
      return res.status(400).json({ 
        error: "Missing required fields: linkName, linkUrl, linkType, category, page" 
      });
    }

    const result = await trackLinkClick(
      linkName,
      linkUrl,
      linkType,
      category,
      page,
      req,
      description
    );

    res.json({ success: true, tracked: !!result });
  } catch (error) {
    console.error("Error handling link click:", error);
    res.status(500).json({ error: "Failed to track link click" });
  }
};