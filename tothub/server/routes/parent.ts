import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { messages, mediaShares } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Get parent's children
router.get("/children", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ message: "Access denied" });
    }

    const children = await storage.getParentChildren(user.parentId || user.userId);
    res.json(children);
  } catch (error) {
    console.error('Get parent children error:', error);
    res.status(500).json({ message: "Failed to fetch children" });
  }
});

// Get today's attendance for parent's children
router.get("/attendance/today", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ message: "Access denied" });
    }

    const children = await storage.getParentChildren(user.parentId || user.userId);
    const childIds = children.map(c => c.id);
    
    const attendance = await storage.getTodaysAttendance();
    const parentAttendance = attendance.filter(a => childIds.includes(a.childId));
    
    // Add child info to attendance records
    const attendanceWithChild = parentAttendance.map(a => {
      const child = children.find(c => c.id === a.childId);
      return {
        ...a,
        child: {
          firstName: child?.firstName || '',
          lastName: child?.lastName || '',
          room: child?.room || ''
        }
      };
    });
    
    res.json(attendanceWithChild);
  } catch (error) {
    console.error('Get parent attendance error:', error);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

// Get parent messages
router.get("/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get messages for this parent
    const parentMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.recipientId, user.parentId || user.userId))
      .orderBy(desc(messages.createdAt))
      .limit(50);
    
    res.json(parentMessages);
  } catch (error) {
    console.error('Get parent messages error:', error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Get media shares for parent's children
router.get("/media", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ message: "Access denied" });
    }

    const children = await storage.getParentChildren(user.parentId || user.userId);
    const childIds = children.map(c => c.id);
    
    // Get media shares for parent's children
    const media = await db
      .select()
      .from(mediaShares)
      .where(sql`${mediaShares.childId} = ANY(${childIds})`)
      .orderBy(desc(mediaShares.createdAt))
      .limit(50);
    
    res.json(media);
  } catch (error) {
    console.error('Get parent media error:', error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
});

export default router;