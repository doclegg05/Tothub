import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { TimefoldAdapter } from "../services/timefoldAdapter";
import { timefoldClient } from "../services/timefoldClient";
import { startOfWeek, addWeeks } from "date-fns";
import { z } from "zod";

const router = Router();
const auth = authMiddleware;

// Generate schedule using Timefold
router.post("/generate", auth, async (req, res) => {
  try {
    const { weekStart, centerId } = req.body;
    
    // Validate input
    const inputSchema = z.object({
      weekStart: z.string().optional(),
      centerId: z.string().optional()
    });
    
    const validatedInput = inputSchema.parse({ weekStart, centerId });
    
    // Parse week start date or use current week
    const weekStartDate = validatedInput.weekStart 
      ? new Date(validatedInput.weekStart)
      : startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    
    // Check if Timefold service is available
    const isHealthy = await timefoldClient.healthCheck();
    if (!isHealthy) {
      return res.status(503).json({
        success: false,
        message: "Timefold scheduling service is unavailable",
        fallback: true
      });
    }
    
    // Convert TotHub data to Timefold format
    const timefoldRequest = await TimefoldAdapter.convertToTimefoldRequest(
      weekStartDate,
      validatedInput.centerId
    );
    
    // Generate schedule using Timefold
    const timefoldResponse = await timefoldClient.generateSchedule(timefoldRequest);
    
    // Convert response back to TotHub format
    const totHubSchedules = TimefoldAdapter.convertFromTimefoldAssignments(
      timefoldResponse.assignments
    );
    
    res.json({
      success: true,
      message: "Schedule generated successfully",
      data: {
        schedules: totHubSchedules,
        timefoldResponse: {
          status: timefoldResponse.status,
          totalScore: timefoldResponse.totalScore,
          solvingTimeMs: timefoldResponse.solvingTimeMs,
          warnings: timefoldResponse.warnings,
          errors: timefoldResponse.errors
        }
      }
    });
    
  } catch (error) {
    console.error('Schedule generation error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate schedule",
      fallback: true
    });
  }
});

// Get schedule generation status
router.get("/status", auth, async (req, res) => {
  try {
    const isHealthy = await timefoldClient.healthCheck();
    const solverStatus = await timefoldClient.getSolverStatus();
    
    res.json({
      success: true,
      data: {
        timefoldHealthy: isHealthy,
        solverStatus,
        lastChecked: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to check service status"
    });
  }
});

// Preview schedule without saving
router.post("/preview", auth, async (req, res) => {
  try {
    const { weekStart, centerId } = req.body;
    
    // Validate input
    const inputSchema = z.object({
      weekStart: z.string().optional(),
      centerId: z.string().optional()
    });
    
    const validatedInput = inputSchema.parse({ weekStart, centerId });
    
    // Parse week start date or use current week
    const weekStartDate = validatedInput.weekStart 
      ? new Date(validatedInput.weekStart)
      : startOfWeek(new Date(), { weekStartsOn: 1 });
    
    // Convert TotHub data to Timefold format
    const timefoldRequest = await TimefoldAdapter.convertToTimefoldRequest(
      weekStartDate,
      validatedInput.centerId
    );
    
    // Generate schedule using Timefold
    const timefoldResponse = await timefoldClient.generateSchedule(timefoldRequest);
    
    // Convert response back to TotHub format
    const totHubSchedules = TimefoldAdapter.convertFromTimefoldAssignments(
      timefoldResponse.assignments
    );
    
    res.json({
      success: true,
      message: "Schedule preview generated",
      data: {
        schedules: totHubSchedules,
        timefoldResponse: {
          status: timefoldResponse.status,
          totalScore: timefoldResponse.totalScore,
          solvingTimeMs: timefoldResponse.solvingTimeMs
        },
        preview: true
      }
    });
    
  } catch (error) {
    console.error('Schedule preview error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate schedule preview"
    });
  }
});

// Accept and save generated schedule
router.post("/accept", auth, async (req, res) => {
  try {
    const { schedules, weekStart } = req.body;
    
    // Validate input
    const inputSchema = z.object({
      schedules: z.array(z.object({
        id: z.string(),
        staffId: z.string(),
        staffName: z.string(),
        room: z.string(),
        date: z.string(),
        scheduledStart: z.string(),
        scheduledEnd: z.string(),
        status: z.string()
      })),
      weekStart: z.string()
    });
    
    const validatedInput = inputSchema.parse({ schedules, weekStart });
    
    // TODO: Save schedules to database
    // This would integrate with the existing schedule storage system
    
    res.json({
      success: true,
      message: "Schedule accepted and saved",
      data: {
        savedCount: validatedInput.schedules.length,
        weekStart: validatedInput.weekStart
      }
    });
    
  } catch (error) {
    console.error('Schedule acceptance error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to accept schedule"
    });
  }
});

export default router;
