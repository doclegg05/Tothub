import { Router } from "express";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Dashboard stats route
router.get("/stats", auth, async (req, res) => {
  try {
    const presentChildren = await storage.getCurrentlyPresentChildren();
    const todaysSchedules = await storage.getTodaysStaffSchedules();
    const unreadAlerts = await storage.getUnreadAlerts();
    
    const childrenPresent = presentChildren.length;
    const staffOnDuty = todaysSchedules.filter(s => s.isPresent).length;
    
    // Calculate compliance based on ratios
    const roomStats = new Map();
    
    // Group children by room
    presentChildren.forEach(({ child }) => {
      const room = child.room;
      if (!roomStats.has(room)) {
        roomStats.set(room, { children: 0, staff: 0, ageGroup: child.ageGroup });
      }
      roomStats.get(room).children += 1;
    });
    
    // Group staff by room
    todaysSchedules.filter(s => s.isPresent).forEach(schedule => {
      const room = schedule.room;
      if (!roomStats.has(room)) {
        roomStats.set(room, { children: 0, staff: 0, ageGroup: 'mixed' });
      }
      roomStats.get(room).staff += 1;
    });

    // Check compliance for each room
    let isCompliant = true;
    const ratioRequirements = {
      'infant': 4,
      'young_toddler': 5,
      'toddler': 8,
      'preschool': 10,
      'school_age': 18,
      'older_school_age': 20
    };

    for (const [room, stats] of Array.from(roomStats)) {
      if (stats.children > 0) {
        const requiredRatio = ratioRequirements[stats.ageGroup as keyof typeof ratioRequirements] || 10;
        const requiredStaff = Math.ceil(stats.children / requiredRatio);
        if (stats.staff < requiredStaff) {
          isCompliant = false;
          break;
        }
      }
    }

    res.json({
      childrenPresent,
      staffOnDuty,
      complianceStatus: isCompliant ? 'Compliant' : 'Non-Compliant',
      unreadAlertsCount: unreadAlerts.length,
      revenue: 2340, // This would come from billing system integration
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

export default router;