import { Router } from "express";
import { storage } from "../storage";
import { SchedulingService } from "../services/schedulingService";
import { insertStaffScheduleSchema } from "@shared/schema";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Get all staff schedules (for calendar view)
router.get("/", auth, async (req, res) => {
  try {
    const schedules = await storage.getAllStaffSchedules();
    const schedulesWithNames = await Promise.all(
      schedules.map(async (schedule: any) => {
        const staff = await storage.getStaff(schedule.staffId);
        return {
          ...schedule,
          staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff',
          type: schedule.scheduleType || 'regular'
        };
      })
    );
    res.json(schedulesWithNames);
  } catch (error) {
    console.error('Error fetching all schedules:', error);
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
});

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
    console.log('Creating schedule with data:', JSON.stringify(req.body, null, 2));
    
    // Convert date strings to Date objects
    const dataWithDates = {
      ...req.body,
      date: new Date(req.body.date),
      scheduledStart: new Date(req.body.scheduledStart),
      scheduledEnd: new Date(req.body.scheduledEnd),
      recurringUntil: req.body.recurringUntil ? new Date(req.body.recurringUntil) : undefined,
    };
    
    console.log('Data with parsed dates:', JSON.stringify(dataWithDates, null, 2));
    const validatedData = insertStaffScheduleSchema.parse(dataWithDates);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));
    const schedule = await storage.createStaffSchedule(validatedData);
    console.log('Created schedule:', JSON.stringify(schedule, null, 2));
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Schedule creation error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create staff schedule", error: error.message });
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