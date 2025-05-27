import { Router } from "express";
import { notificationService } from "../services/notificationService";

const router = Router();

/**
 * Get user notifications
 * GET /api/notifications
 */
router.get("/", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { 
      limit = 20, 
      offset = 0, 
      unreadOnly = false, 
      includeArchived = false 
    } = req.query;

    const notifications = await notificationService.getUserNotifications(
      req.user.id,
      {
        limit: Number(limit),
        offset: Number(offset),
        unreadOnly: unreadOnly === 'true',
        includeArchived: includeArchived === 'true',
      }
    );

    res.json({
      success: true,
      notifications: notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        isArchived: notification.isArchived,
        priority: notification.priority,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        relatedEntityId: notification.relatedEntityId,
        relatedEntityType: notification.relatedEntityType,
        createdAt: notification.createdAt,
        expiresAt: notification.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
router.get("/unread-count", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const count = await notificationService.getUnreadCount(req.user.id);

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
router.put("/:id/read", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const notificationId = Number(req.params.id);
    
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const success = await notificationService.markAsRead(notificationId, req.user.id);

    if (!success) {
      return res.status(404).json({ error: "Notification not found or access denied" });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
router.put("/read-all", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const count = await notificationService.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: `${count} notifications marked as read`,
      markedCount: count,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

/**
 * Archive notification
 * PUT /api/notifications/:id/archive
 */
router.put("/:id/archive", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const notificationId = Number(req.params.id);
    
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const success = await notificationService.archiveNotification(notificationId, req.user.id);

    if (!success) {
      return res.status(404).json({ error: "Notification not found or access denied" });
    }

    res.json({
      success: true,
      message: "Notification archived",
    });
  } catch (error) {
    console.error("Archive notification error:", error);
    res.status(500).json({ error: "Failed to archive notification" });
  }
});

/**
 * Create test notification (development only)
 * POST /api/notifications/test
 */
router.post("/test", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { type = "test", title = "Test Notification", message = "This is a test notification" } = req.body;

    const notification = await notificationService.createNotification({
      userId: req.user.id,
      type,
      title,
      message,
      priority: "normal",
      deliveryMethod: ["in_app"],
    });

    res.json({
      success: true,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt,
      },
      message: "Test notification created",
    });
  } catch (error) {
    console.error("Create test notification error:", error);
    res.status(500).json({ error: "Failed to create test notification" });
  }
});

export default router;