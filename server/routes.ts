import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./services/emailService";
import { insertChildSchema, insertStaffSchema, insertAttendanceSchema, insertStaffScheduleSchema, insertSettingSchema, insertAlertSchema, insertMessageSchema, insertMediaShareSchema, insertBillingSchema, insertDailyReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Children routes
  app.get("/api/children", async (req, res) => {
    try {
      const children = await storage.getActiveChildren();
      res.json(children);
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
      const validatedData = insertChildSchema.parse(req.body);
      const child = await storage.createChild(validatedData);
      res.status(201).json(child);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
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
      const staff = await storage.getActiveStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
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

      for (const [room, stats] of roomStats) {
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

      // Import state ratio helpers
      const { calculateRequiredStaff, getMostRestrictiveRatio, calculateCurrentRatio, isStaffingCompliant } = await import("../client/src/lib/stateRatioCalculations");

      const ratios = Array.from(roomStats.entries()).map(([room, stats]) => {
        const requiredStaff = calculateRequiredStaff(stats.children, selectedState);
        const isCompliant = isStaffingCompliant(stats.children, stats.staff, selectedState);
        const mostRestrictiveRatio = getMostRestrictiveRatio(stats.children, selectedState);
        const currentRatio = calculateCurrentRatio(stats.children.length, stats.staff);
        
        return {
          room,
          children: stats.children.length,
          staff: stats.staff,
          requiredStaff,
          ratio: currentRatio,
          requiredRatio: mostRestrictiveRatio,
          isCompliant,
          state: selectedState,
          ageGroups: [...new Set(stats.children.map(c => c.ageGroup))]
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
      const success = await emailService.sendEmail({
        to,
        subject,
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

  const httpServer = createServer(app);
  return httpServer;
}
