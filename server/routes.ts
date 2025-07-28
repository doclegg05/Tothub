import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { TimesheetService } from "./services/timesheetService";
import { QuickBooksExporter } from "./services/quickbooksExporter";
import { SchedulingService } from "./services/schedulingService";
import { sendEmail } from "./services/emailService";
import { memoryCache } from "./services/memoryOptimizationService";
import { autoRestartService } from "./services/autoRestartService";
import { insertChildSchema, insertStaffSchema, insertAttendanceSchema, insertStaffScheduleSchema, insertSettingSchema, insertAlertSchema, insertMessageSchema, insertMediaShareSchema, insertBillingSchema, insertDailyReportSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Children routes
  app.get("/api/children", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await storage.getActiveChildren({ page, limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  app.get("/api/children/:id", async (req, res) => {
    try {
      const child = await storage.getChild(req.params.id);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      res.json(child);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch child" });
    }
  });

  app.post("/api/children", async (req, res) => {
    try {
      console.log("Creating child with data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertChildSchema.parse(req.body);
      const child = await storage.createChild(validatedData);
      res.status(201).json(child);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating child:", error);
      res.status(500).json({ message: "Failed to create child" });
    }
  });

  app.put("/api/children/:id", async (req, res) => {
    try {
      const validatedData = insertChildSchema.partial().parse(req.body);
      const child = await storage.updateChild(req.params.id, validatedData);
      res.json(child);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update child" });
    }
  });

  // Staff routes
  app.get("/api/staff", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await storage.getActiveStaff({ page, limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // Staff clock-in endpoint
  app.post("/api/staff/:staffId/clock-in", async (req, res) => {
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
  app.post("/api/staff/:staffId/clock-out", async (req, res) => {
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
  app.get("/api/staff/:staffId/clock-status", async (req, res) => {
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
  app.get("/api/staff/:staffId/timesheet-summary", async (req, res) => {
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

  app.post("/api/staff", async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(validatedData);
      res.status(201).json(staff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  // Attendance routes
  app.get("/api/attendance/today", async (req, res) => {
    try {
      const attendance = await storage.getTodaysAttendance();
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's attendance" });
    }
  });

  app.get("/api/attendance/present", async (req, res) => {
    try {
      const present = await storage.getCurrentlyPresentChildren();
      res.json(present);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch present children" });
    }
  });

  app.post("/api/attendance/check-in", async (req, res) => {
    try {
      const schema = insertAttendanceSchema.omit({ checkOutTime: true, checkOutBy: true });
      const validatedData = schema.parse({
        ...req.body,
        date: new Date(),
        checkInTime: new Date(),
      });
      const attendance = await storage.createAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to check in child" });
    }
  });

  app.post("/api/attendance/check-out/:id", async (req, res) => {
    try {
      const { checkOutBy } = req.body;
      if (!checkOutBy) {
        return res.status(400).json({ message: "checkOutBy is required" });
      }
      const attendance = await storage.checkOutChild(req.params.id, checkOutBy, new Date());
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to check out child" });
    }
  });

  // Staff schedules routes
  app.get("/api/staff-schedules/today", async (req, res) => {
    try {
      const schedules = await storage.getTodaysStaffSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's staff schedules" });
    }
  });

  app.post("/api/staff-schedules", async (req, res) => {
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

  app.post("/api/staff-schedules/:id/mark-present", async (req, res) => {
    try {
      const schedule = await storage.markStaffPresent(req.params.id, new Date());
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark staff as present" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || !value) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      const setting = await storage.createOrUpdateSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/unread", async (req, res) => {
    try {
      const alerts = await storage.getUnreadAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.post("/api/alerts/:id/mark-read", async (req, res) => {
    try {
      const alert = await storage.markAlertAsRead(req.params.id);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req, res) => {
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

  // Room ratios route with state-based calculations
  app.get("/api/ratios", async (req, res) => {
    try {
      const presentChildren = await storage.getCurrentlyPresentChildren();
      const todaysSchedules = await storage.getTodaysStaffSchedules();
      
      // Get current state setting
      const stateSetting = await storage.getSetting('selected_state');
      const selectedState = stateSetting?.value || 'West Virginia';
      
      const roomStats = new Map();
      
      // Group children by room with full child objects
      presentChildren.forEach(({ child }) => {
        const room = child.room;
        if (!roomStats.has(room)) {
          roomStats.set(room, { children: [], staff: 0 });
        }
        roomStats.get(room).children.push(child);
      });
      
      // Group staff by room
      todaysSchedules.filter(s => s.isPresent).forEach(schedule => {
        const room = schedule.room;
        if (!roomStats.has(room)) {
          roomStats.set(room, { children: [], staff: 0 });
        }
        roomStats.get(room).staff += 1;
      });

      // Get current state compliance data
      const currentCompliance = await storage.getStateCompliance();
      let ratiosData: Record<string, string> = {};
      
      if (currentCompliance && currentCompliance.ratiosData) {
        try {
          ratiosData = JSON.parse(currentCompliance.ratiosData);
        } catch (e) {
          console.error('Failed to parse ratios data:', e);
          // Fallback to West Virginia ratios
          ratiosData = {
            "Infants (0-12 months)": "4:1",
            "Toddlers (13-24 months)": "6:1", 
            "2-3 years": "10:1",
            "3-4 years": "12:1",
            "4-5 years": "14:1",
            "School-age (6+)": "16:1"
          };
        }
      }

      // Helper function to calculate required staff for age group
      const calculateRequiredStaffForRoom = (children: any[], staff: number) => {
        if (children.length === 0) return { required: 0, isCompliant: true, ratio: "N/A" };
        
        // Group children by age and find most restrictive ratio needed  
        const ageGroupCounts: Record<string, number> = {};
        children.forEach((child: any) => {
          const ageGroup = child.ageGroup;
          const mappedGroup = mapAgeGroupToRatio(ageGroup);
          ageGroupCounts[mappedGroup] = (ageGroupCounts[mappedGroup] || 0) + 1;
        });

        let maxRequired = 0;
        let mostRestrictiveRatio = "";
        
        for (const [ageGroup, count] of Object.entries(ageGroupCounts) as [string, number][]) {
          const ratioString = ratiosData[ageGroup] || "10:1";
          const ratioValue = parseInt(ratioString.split(':')[0]);
          const required = Math.ceil(count / ratioValue);
          
          if (required > maxRequired) {
            maxRequired = required;
            mostRestrictiveRatio = ratioString;
          }
        }

        return {
          required: maxRequired,
          isCompliant: staff >= maxRequired,
          ratio: staff > 0 ? `${children.length}:${staff}` : "N/A",
          requiredRatio: mostRestrictiveRatio
        };
      };

      // Helper to map our age groups to ratio categories
      const mapAgeGroupToRatio = (ageGroup: string) => {
        switch (ageGroup) {
          case 'infant': return "Infants (0-12 months)";
          case 'young_toddler': return "Toddlers (13-24 months)";
          case 'toddler': return "2-3 years";
          case 'preschool': return "3-4 years";
          case 'school_age': return "School-age (6+)";
          case 'older_school_age': return "School-age (6+)";
          default: return "2-3 years";
        }
      };

      const ratios = Array.from(roomStats).map(([room, stats]) => {
        const calculation = calculateRequiredStaffForRoom(stats.children, stats.staff);
        
        return {
          room,
          children: stats.children.length,
          staff: stats.staff,
          requiredStaff: calculation.required,
          ratio: calculation.ratio,
          requiredRatio: calculation.requiredRatio,
          isCompliant: calculation.isCompliant,
          state: currentCompliance?.state || selectedState,
          ageGroups: Array.from(new Set(stats.children.map((c: any) => c.ageGroup)))
        };
      });

      res.json(ratios);
    } catch (error) {
      console.error('Ratio calculation error:', error);
      res.status(500).json({ message: "Failed to calculate ratios" });
    }
  });

  // State ratios routes
  app.get("/api/states", async (req, res) => {
    try {
      const { US_STATES } = await import("@shared/stateRatios");
      res.json(US_STATES);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });

  app.get("/api/state-ratios/:state", async (req, res) => {
    try {
      const stateRatio = await storage.getStateRatio(req.params.state);
      if (!stateRatio) {
        return res.status(404).json({ message: "State ratios not found" });
      }
      res.json(stateRatio);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch state ratios" });
    }
  });

  app.post("/api/seed-state-ratios", async (req, res) => {
    try {
      await storage.seedStateRatios();
      res.json({ message: "State ratios seeded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed state ratios" });
    }
  });

  // Email test route
  app.post("/api/send-test-email", async (req, res) => {
    try {
      const { to, subject, message } = req.body;
      const success = await sendEmail({
        to,
        subject,
        text: message,
        html: `<p>${message}</p>`
      });
      
      if (success) {
        res.json({ message: "Email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Enhanced Check-In/Out Routes
  app.post("/api/attendance/checkin", async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.extend({
        moodRating: z.number().optional(),
        checkInPhotoUrl: z.string().optional(),
        notes: z.string().optional(),
      }).parse(req.body);
      
      const attendance = await storage.createAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to check in child" });
    }
  });

  app.post("/api/attendance/checkout", async (req, res) => {
    try {
      const { attendanceId, checkOutBy, notes, checkOutPhotoUrl, activitiesCompleted } = req.body;
      const attendance = await storage.updateAttendance(attendanceId, {
        checkOutTime: new Date(),
        checkOutBy,
        notes,
        checkOutPhotoUrl,
        activitiesCompleted,
      });
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to check out child" });
    }
  });

  // Parent Communication Routes
  app.get("/api/messages", async (req, res) => {
    try {
      // Mock response for now - will implement storage methods
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      // Mock response for now - will implement storage methods
      res.status(201).json({ id: "mock-id", ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Media Sharing Routes
  app.get("/api/media-shares", async (req, res) => {
    try {
      // Mock response for now - will implement storage methods
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media shares" });
    }
  });

  app.post("/api/media-shares", async (req, res) => {
    try {
      const validatedData = insertMediaShareSchema.parse(req.body);
      // Mock response for now - will implement storage methods  
      res.status(201).json({ id: "mock-id", ...validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to share media" });
    }
  });

  // Security System Routes
  app.get("/api/security/devices", async (req, res) => {
    try {
      const devices = await storage.getAllSecurityDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security devices" });
    }
  });

  app.post("/api/security/devices", async (req, res) => {
    try {
      const { insertSecurityDeviceSchema } = await import("@shared/schema");
      const validatedData = insertSecurityDeviceSchema.parse(req.body);
      
      // Encrypt connection config
      const device = await storage.createSecurityDevice({
        ...validatedData,
        connectionConfig: JSON.stringify(validatedData.connectionConfig),
      });
      
      // Initialize device in security service
      const { securityService } = await import("./services/securityService");
      await securityService.initializeDevice(device);
      
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create security device" });
    }
  });

  app.post("/api/security/devices/:id/test", async (req, res) => {
    try {
      const { securityService } = await import("./services/securityService");
      const success = await securityService.testDevice(req.params.id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Device test failed", success: false });
    }
  });

  app.post("/api/security/devices/:id/unlock", async (req, res) => {
    try {
      const { securityService } = await import("./services/securityService");
      const success = await securityService.unlockDevice(req.params.id, 'admin');
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Unlock failed", success: false });
    }
  });

  app.post("/api/security/devices/:id/lock", async (req, res) => {
    try {
      const { securityService } = await import("./services/securityService");
      const success = await securityService.lockDevice(req.params.id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Lock failed", success: false });
    }
  });

  app.post("/api/security/emergency-unlock", async (req, res) => {
    try {
      const { securityService } = await import("./services/securityService");
      await securityService.emergencyUnlockAll();
      res.json({ message: "Emergency unlock activated" });
    } catch (error) {
      res.status(500).json({ message: "Emergency unlock failed" });
    }
  });

  app.get("/api/security/logs", async (req, res) => {
    try {
      const logs = await storage.getSecurityLogs(100);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security logs" });
    }
  });

  app.get("/api/security/zones", async (req, res) => {
    try {
      const zones = await storage.getAllSecurityZones();
      res.json(zones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security zones" });
    }
  });

  // Security System Test Routes
  app.post("/api/security/test/full-simulation", async (req, res) => {
    try {
      const { SecurityTestScript } = await import("./services/securityTestScript");
      const result = await SecurityTestScript.runFullSimulation();
      res.json(result);
    } catch (error) {
      console.error("Security simulation error:", error);
      res.status(500).json({ message: "Failed to run security simulation" });
    }
  });

  app.post("/api/security/test/keypad-only", async (req, res) => {
    try {
      const { SecurityTestScript } = await import("./services/securityTestScript");
      await SecurityTestScript.testKeypadOnly();
      res.json({ message: "Keypad test completed" });
    } catch (error) {
      console.error("Keypad test error:", error);
      res.status(500).json({ message: "Failed to test keypad device" });
    }
  });

  // Test Data Routes for Performance Testing
  app.post("/api/test/seed-data", async (req, res) => {
    try {
      const { TestDataService } = await import("./services/testDataService");
      const result = await TestDataService.seedTestData();
      res.json(result);
    } catch (error) {
      console.error("Test data seeding error:", error);
      res.status(500).json({ message: "Failed to seed test data" });
    }
  });

  app.delete("/api/test/clear-data", async (req, res) => {
    try {
      const { TestDataService } = await import("./services/testDataService");
      const result = await TestDataService.clearTestData();
      res.json(result);
    } catch (error) {
      console.error("Test data clearing error:", error);
      res.status(500).json({ message: "Failed to clear test data" });
    }
  });

  app.get("/api/test/scenario-summary", async (req, res) => {
    try {
      const { TestDataService } = await import("./services/testDataService");
      const summary = TestDataService.getTestScenarioSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to get scenario summary" });
    }
  });

  // State Compliance Routes
  app.get("/api/compliance/current-state", async (req, res) => {
    try {
      const currentState = await storage.getCurrentState();
      const compliance = await storage.getStateCompliance();
      res.json({ 
        state: currentState, 
        compliance,
        isInitialized: !!compliance 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current state" });
    }
  });

  app.post("/api/compliance/update-state", async (req, res) => {
    try {
      const { state, auditNote } = req.body;
      
      if (!state || typeof state !== 'string') {
        return res.status(400).json({ message: "Valid state name is required" });
      }

      // Validate state exists in our compliance data
      const { STATE_COMPLIANCE_RATIOS } = await import("@shared/stateComplianceData");
      if (!STATE_COMPLIANCE_RATIOS[state]) {
        return res.status(400).json({ message: "Invalid state - not found in compliance database" });
      }

      const compliance = await storage.updateStateCompliance(state, auditNote);
      
      // Generate alert about state change
      await storage.createAlert({
        type: "general",
        message: `Updated compliance settings for ${state} - review for compliance.`,
        severity: "medium",
        isRead: false,
      });

      res.json({ 
        success: true, 
        compliance,
        message: `State compliance updated to ${state}` 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update state compliance" });
    }
  });

  app.get("/api/compliance/available-states", async (req, res) => {
    try {
      const { US_STATES_LIST, STATE_COMPLIANCE_RATIOS } = await import("@shared/stateComplianceData");
      
      const statesWithData = US_STATES_LIST.map(state => ({
        name: state,
        hasData: !!STATE_COMPLIANCE_RATIOS[state],
        ratios: STATE_COMPLIANCE_RATIOS[state] || null
      }));

      res.json(statesWithData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available states" });
    }
  });

  app.get("/api/compliance/:state/ratios", async (req, res) => {
    try {
      const { state } = req.params;
      const { getStateRatios } = await import("@shared/stateComplianceData");
      
      const ratios = getStateRatios(state);
      if (!ratios) {
        return res.status(404).json({ message: "State ratios not found" });
      }

      res.json({
        state,
        ratios,
        notes: ratios.notes
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch state ratios" });
    }
  });

  // Biometric authentication routes
  app.post('/api/biometric/enroll/:userType/:userId', async (req, res) => {
    try {
      const { userType, userId } = req.params;
      const { faceDescriptor, fingerprintCredentialId } = req.body;

      if (userType === 'child') {
        const child = await storage.getChild(userId);
        if (!child) {
          return res.status(404).json({ error: 'Child not found' });
        }

        const updateData: any = {
          biometricEnrolledAt: new Date(),
          biometricEnabled: true,
        };
        if (faceDescriptor) updateData.faceDescriptor = faceDescriptor;
        if (fingerprintCredentialId) updateData.fingerprintHash = fingerprintCredentialId;
        
        await storage.updateChild(userId, updateData);
      } else if (userType === 'staff') {
        const staff = await storage.getStaff(userId);
        if (!staff) {
          return res.status(404).json({ error: 'Staff member not found' });
        }

        await storage.updateStaff(userId, {
          faceDescriptor: faceDescriptor || staff.faceDescriptor,
          fingerprintHash: fingerprintCredentialId || staff.fingerprintHash,
          biometricEnrolledAt: new Date(),
          biometricEnabled: true,
        });
      } else {
        return res.status(400).json({ error: 'Invalid user type' });
      }

      res.json({ success: true, message: 'Biometric data enrolled successfully' });
    } catch (error) {
      console.error('Biometric enrollment error:', error);
      res.status(500).json({ error: 'Failed to enroll biometric data' });
    }
  });

  app.get('/api/biometric/auth-data/:userType/:userId', async (req, res) => {
    try {
      const { userType, userId } = req.params;

      let user;
      if (userType === 'child') {
        user = await storage.getChild(userId);
      } else if (userType === 'staff') {
        user = await storage.getStaff(userId);
      } else {
        return res.status(400).json({ error: 'Invalid user type' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        hasFaceData: !!user.faceDescriptor,
        hasFingerprintData: !!user.fingerprintHash,
        biometricEnabled: user.biometricEnabled || false,
        faceDescriptor: user.faceDescriptor,
        fingerprintHash: user.fingerprintHash,
      });
    } catch (error) {
      console.error('Get biometric data error:', error);
      res.status(500).json({ error: 'Failed to get biometric data' });
    }
  });

  app.post('/api/biometric/verify/:userType/:userId', async (req, res) => {
    try {
      const { userType, userId } = req.params;
      const { method, confidence } = req.body;

      let user;
      if (userType === 'child') {
        user = await storage.getChild(userId);
      } else if (userType === 'staff') {
        user = await storage.getStaff(userId);
      } else {
        return res.status(400).json({ error: 'Invalid user type' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.biometricEnabled) {
        return res.status(400).json({ error: 'Biometric authentication not enabled for this user' });
      }

      const minimumConfidence = method === 'fingerprint' ? 0.9 : 0.6;
      
      if (confidence < minimumConfidence) {
        return res.status(401).json({ error: 'Biometric verification failed' });
      }

      res.json({
        success: true,
        method,
        confidence,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Biometric verification error:', error);
      res.status(500).json({ error: 'Failed to verify biometric data' });
    }
  });

  // QuickBooks Export Routes
  app.get("/api/payroll/export/quickbooks/:payPeriodId", async (req, res) => {
    try {
      const { payPeriodId } = req.params;
      const { format } = req.query;

      if (format === 'iif') {
        const iifContent = await QuickBooksExporter.generatePayrollIIF(payPeriodId);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="payroll-${payPeriodId}.iif"`);
        res.send(iifContent);
      } else {
        // Default to CSV
        const csvContent = await QuickBooksExporter.generatePayrollCSV(payPeriodId);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="payroll-${payPeriodId}.csv"`);
        res.send(csvContent);
      }
    } catch (error) {
      console.error('QuickBooks export error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to export to QuickBooks" 
      });
    }
  });

  // General Ledger Summary
  app.get("/api/payroll/export/gl-summary/:payPeriodId", async (req, res) => {
    try {
      const { payPeriodId } = req.params;
      const summary = await QuickBooksExporter.generateGeneralLedgerSummary(payPeriodId);
      res.json(summary);
    } catch (error) {
      console.error('GL summary error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate GL summary" 
      });
    }
  });

  // Tax Reports (941, State)
  app.get("/api/payroll/export/tax-reports", async (req, res) => {
    try {
      const { quarter, year } = req.query;
      
      if (!quarter || !year) {
        return res.status(400).json({ message: "Quarter and year are required" });
      }

      const reports = await QuickBooksExporter.generateTaxReports(
        parseInt(quarter as string),
        parseInt(year as string)
      );
      
      res.json(reports);
    } catch (error) {
      console.error('Tax reports error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate tax reports" 
      });
    }
  });

  // Scheduling Routes
  app.get("/api/staff-schedules/:date?", async (req, res) => {
    try {
      const date = req.params.date || new Date().toISOString().split('T')[0];
      const schedules = await SchedulingService.getStaffSchedules(date);
      res.json(schedules);
    } catch (error) {
      console.error('Get staff schedules error:', error);
      res.status(500).json({ message: "Failed to fetch staff schedules" });
    }
  });

  app.post("/api/staff-schedules", async (req, res) => {
    try {
      const schedule = await SchedulingService.createStaffSchedule(req.body);
      res.json(schedule);
    } catch (error) {
      console.error('Create staff schedule error:', error);
      res.status(500).json({ message: "Failed to create staff schedule" });
    }
  });

  app.get("/api/child-schedules/:date?", async (req, res) => {
    try {
      const date = req.params.date || new Date().toISOString().split('T')[0];
      const schedules = await SchedulingService.getChildSchedules(date);
      res.json(schedules);
    } catch (error) {
      console.error('Get child schedules error:', error);
      res.status(500).json({ message: "Failed to fetch child schedules" });
    }
  });

  app.post("/api/child-schedules", async (req, res) => {
    try {
      const schedule = await SchedulingService.createChildSchedule(req.body);
      res.json(schedule);
    } catch (error) {
      console.error('Create child schedule error:', error);
      res.status(500).json({ message: "Failed to create child schedule" });
    }
  });

  app.patch("/api/staff-schedules/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const schedule = await SchedulingService.updateScheduleStatus(id, 'staff', status);
      res.json(schedule);
    } catch (error) {
      console.error('Update staff schedule status error:', error);
      res.status(500).json({ message: "Failed to update schedule status" });
    }
  });

  app.patch("/api/child-schedules/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const schedule = await SchedulingService.updateScheduleStatus(id, 'child', status);
      res.json(schedule);
    } catch (error) {
      console.error('Update child schedule status error:', error);
      res.status(500).json({ message: "Failed to update schedule status" });
    }
  });

  app.get("/api/room-utilization/:date?", async (req, res) => {
    try {
      const date = req.params.date || new Date().toISOString().split('T')[0];
      const utilization = await SchedulingService.getRoomUtilization(date);
      res.json(utilization);
    } catch (error) {
      console.error('Get room utilization error:', error);
      res.status(500).json({ message: "Failed to fetch room utilization" });
    }
  });

  app.get("/api/weekly-schedule/:startDate", async (req, res) => {
    try {
      const { startDate } = req.params;
      const overview = await SchedulingService.getWeeklyScheduleOverview(startDate);
      res.json(overview);
    } catch (error) {
      console.error('Get weekly schedule error:', error);
      res.status(500).json({ message: "Failed to fetch weekly schedule" });
    }
  });

  // Payroll routes
  app.use("/api/payroll", (await import("./routes/payroll")).default);

  // Memory monitoring endpoint
  app.get("/api/memory-stats", (_req, res) => {
    const memUsage = process.memoryUsage();
    const formatBytes = (bytes: number) => {
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };
    
    res.json({
      memory: {
        heapUsed: formatBytes(memUsage.heapUsed),
        heapTotal: formatBytes(memUsage.heapTotal),
        rss: formatBytes(memUsage.rss),
        external: formatBytes(memUsage.external),
        arrayBuffers: formatBytes(memUsage.arrayBuffers),
      },
      cache: memoryCache.getStats(),
      uptime: process.uptime(),
    });
  });

  // Auto-restart service endpoints
  app.get("/api/auto-restart/status", (_req, res) => {
    try {
      const status = autoRestartService.getStatus();
      res.json(status);
    } catch (error) {
      console.error('Auto-restart status error:', error);
      res.status(500).json({ message: "Failed to get auto-restart status" });
    }
  });

  app.post("/api/auto-restart/config", (req, res) => {
    try {
      const { memoryThreshold, checkInterval, cooldownPeriod, enabled } = req.body;
      
      const config: any = {};
      if (typeof memoryThreshold === 'number') config.memoryThreshold = memoryThreshold;
      if (typeof checkInterval === 'number') config.checkInterval = checkInterval;
      if (typeof cooldownPeriod === 'number') config.cooldownPeriod = cooldownPeriod;
      if (typeof enabled === 'boolean') config.enabled = enabled;
      
      autoRestartService.updateConfig(config);
      res.json({ message: "Auto-restart configuration updated", status: autoRestartService.getStatus() });
    } catch (error) {
      console.error('Auto-restart config error:', error);
      res.status(500).json({ message: "Failed to update auto-restart configuration" });
    }
  });

  app.post("/api/auto-restart/trigger", async (_req, res) => {
    try {
      res.json({ message: "Manual restart triggered. Server will restart in 5 seconds." });
      // Trigger restart after response is sent
      setTimeout(() => {
        autoRestartService.triggerManualRestart();
      }, 100);
    } catch (error) {
      console.error('Manual restart error:', error);
      res.status(500).json({ message: "Failed to trigger manual restart" });
    }
  });

  // Parent Portal API Routes
  app.get("/api/parent/children", authMiddleware, async (req, res) => {
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

  app.get("/api/parent/attendance/today", authMiddleware, async (req, res) => {
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

  app.get("/api/parent/messages", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (!user || user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get messages for this parent
      const { messages } = await import("@shared/schema");
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

  app.get("/api/parent/media", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (!user || user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const children = await storage.getParentChildren(user.parentId || user.userId);
      const childIds = children.map(c => c.id);
      
      // Get media shares for parent's children
      const { mediaShares } = await import("@shared/schema");
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

  const httpServer = createServer(app);
  return httpServer;
}
