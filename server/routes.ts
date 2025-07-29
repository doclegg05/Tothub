import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { TimesheetService } from "./services/timesheetService";
import { QuickBooksExporter } from "./services/quickbooksExporter";
import { SchedulingService } from "./services/schedulingService";
import { sendEmail } from "./services/emailService";
import { insertStaffScheduleSchema, insertMessageSchema, insertMediaShareSchema, insertBillingSchema, insertDailyReportSchema, insertAttendanceSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "./middleware/auth";

// Import route modules
import childrenRoutes from "./routes/children";
import staffRoutes from "./routes/staff";
import attendanceRoutes from "./routes/attendance";
import settingsRoutes from "./routes/settings";
import alertsRoutes from "./routes/alerts";
import systemRoutes from "./routes/system";

export async function registerRoutes(app: Express): Promise<Server> {
  const auth = authMiddleware;
  
  // Register route modules
  app.use("/api/children", childrenRoutes);
  app.use("/api/staff", staffRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/alerts", alertsRoutes);
  app.use("/api/staff-schedules", (await import("./routes/schedules")).default);
  app.use("/api/dashboard", (await import("./routes/dashboard")).default);
  app.use("/api", systemRoutes);







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
  app.use("/api/compliance", (await import("./routes/compliance")).default);

  // Biometric authentication routes
  app.use("/api/biometric", (await import("./routes/biometric")).default);

  // Payroll and QuickBooks routes
  app.use("/api/payroll", (await import("./routes/payroll")).default);



  // Parent Portal API Routes
  app.use("/api/parent", (await import("./routes/parent")).default);

  // Analytics API Routes
  app.use("/api/analytics", (await import("./routes/analytics")).default);
  
  // Teacher Notes and Daily Reports Routes
  app.use("/api", (await import("./routes/teacherNotes")).teacherNotesRouter);

  const httpServer = createServer(app);
  return httpServer;
}
