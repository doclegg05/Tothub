import { Router } from "express";
import { storage } from "../storage";
import { SchedulingService } from "../services/schedulingService";
import { insertStaffScheduleSchema } from "@shared/schema";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Get today's staff schedules
router.get("/today", auth, async (req, res) => {
  try {
    const schedules = await storage.getTodaysStaffSchedules();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch today's staff schedules" });
  }
});

// Create staff schedule
router.post("/", auth, async (req, res) => {
  try {
    const validatedData = insertStaffScheduleSchema.parse(req.body);
    const schedule = await storage.createStaffSchedule(validatedData);
    res.status(201).json(schedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create staff schedule" });
  }
});

// Mark staff as present
router.post("/:id/mark-present", auth, async (req, res) => {
  try {
    const schedule = await storage.markStaffPresent(req.params.id, new Date());
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark staff as present" });
  }
});

// Get monthly schedule - commented out until SchedulingService method is implemented
// router.get("/monthly/:yearMonth", auth, async (req, res) => {
//   try {
//     const { yearMonth } = req.params;
//     const schedule = await SchedulingService.getMonthlySchedule(yearMonth);
//     res.json(schedule);
//   } catch (error) {
//     console.error('Get monthly schedule error:', error);
//     res.status(500).json({ message: "Failed to fetch monthly schedule" });
//   }
// });

// Get weekly schedule overview
router.get("/weekly/:startDate", auth, async (req, res) => {
  try {
    const { startDate } = req.params;
    const overview = await SchedulingService.getWeeklyScheduleOverview(startDate);
    res.json(overview);
  } catch (error) {
    console.error('Get weekly schedule error:', error);
    res.status(500).json({ message: "Failed to fetch weekly schedule" });
  }
});

export default router;