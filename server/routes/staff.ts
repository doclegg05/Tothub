import { Router } from "express";
import { storage } from "../storage";
import { TimesheetService } from "../services/timesheetService";
import { insertStaffSchema } from "@shared/schema";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Get all staff (paginated)
router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await storage.getActiveStaff({ page, limit });
    res.json(result);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
});

// Staff clock-in endpoint
router.post("/:staffId/clock-in", auth, async (req, res) => {
  try {
    const { staffId } = req.params;
    const clockInTime = req.body.clockInTime ? new Date(req.body.clockInTime) : new Date();
    
    const timesheetEntry = await TimesheetService.clockIn(staffId, clockInTime);
    
    res.status(201).json({
      success: true,
      message: "Clocked in successfully",
      timesheetEntry,
    });
  } catch (error) {
    console.error('Clock-in error:', error);
    res.status(400).json({ 
      success: false,
      message: error instanceof Error ? error.message : "Failed to clock in" 
    });
  }
});

// Staff clock-out endpoint
router.post("/:staffId/clock-out", auth, async (req, res) => {
  try {
    const { staffId } = req.params;
    const clockOutTime = req.body.clockOutTime ? new Date(req.body.clockOutTime) : new Date();
    
    const timesheetEntry = await TimesheetService.clockOut(staffId, clockOutTime);
    
    res.status(200).json({
      success: true,
      message: "Clocked out successfully",
      timesheetEntry,
    });
  } catch (error) {
    console.error('Clock-out error:', error);
    res.status(400).json({ 
      success: false,
      message: error instanceof Error ? error.message : "Failed to clock out" 
    });
  }
});

// Get staff clock status
router.get("/:staffId/clock-status", auth, async (req, res) => {
  try {
    const { staffId } = req.params;
    const status = await TimesheetService.getClockStatus(staffId);
    res.json(status);
  } catch (error) {
    console.error('Get clock status error:', error);
    res.status(500).json({ message: "Failed to get clock status" });
  }
});

// Get staff timesheet summary
router.get("/:staffId/timesheet-summary", auth, async (req, res) => {
  try {
    const { staffId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }
    
    const summary = await TimesheetService.getTimesheetSummary(
      staffId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    res.json(summary);
  } catch (error) {
    console.error('Get timesheet summary error:', error);
    res.status(500).json({ message: "Failed to get timesheet summary" });
  }
});

// Create new staff member
router.post("/", auth, async (req, res) => {
  try {
    console.log('Staff creation request body:', req.body);
    const validatedData = insertStaffSchema.parse(req.body);
    const staff = await storage.createStaff(validatedData);
    res.status(201).json(staff);
  } catch (error: any) {
    console.error('Staff creation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    
    // Check for unique constraint violation (duplicate email)
    if (error?.code === '23505' && error?.constraint === 'staff_email_unique') {
      return res.status(400).json({ message: "A staff member with this email already exists" });
    }
    
    res.status(500).json({ 
      message: "Failed to create staff member",
      details: error?.message || 'Unknown error'
    });
  }
});

export default router;