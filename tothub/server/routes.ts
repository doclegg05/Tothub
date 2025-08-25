import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { DatabaseStorage } from "./storage";
import { insertScheduleSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "./middleware/auth";
import authRoutes from "./routes/authRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  const auth = authMiddleware;
  const storage = new DatabaseStorage();
  
  // Auth routes
  app.use("/api/auth", authRoutes);
  
  // Schedule routes
  app.use("/api/schedule", scheduleRoutes);
  
  // Simple health check route that works with both SQLite and PostgreSQL
  app.get("/api/health", (_req: Request, res: Response) => {
    const isSQLite = process.env.DATABASE_URL?.startsWith('sqlite:') || !process.env.DATABASE_URL;
    
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isSQLite ? "sqlite" : "postgresql",
      environment: process.env.NODE_ENV || "development",
      message: "Server is running"
    });
  });
  
  // Staff routes
  app.get("/api/staff", auth, async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await storage.getAllStaff({ 
        page: Number(page), 
        limit: Number(limit) 
      });
      res.json(result);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", auth, async (req: Request, res: Response) => {
    try {
      const staff = await storage.getStaff(req.params.id);
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // Basic validation for staff creation
  const insertStaffBodySchema = z.object({
    firstName: z.string().min(1, 'firstName is required'),
    lastName: z.string().min(1, 'lastName is required'),
    position: z.string().min(1, 'position is required'),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    hourlyRate: z.number().nonnegative().optional(),
    w4Allowances: z.number().int().min(0).optional(),
    additionalTaxWithholding: z.number().int().min(0).optional(),
    faceDescriptor: z.string().optional(),
    fingerprintHash: z.string().optional(),
    biometricEnrolledAt: z.union([z.string(), z.date()]).optional(),
    biometricEnabled: z.boolean().optional(),
    isActive: z.union([z.boolean(), z.number()]).optional(),
  });

  app.post("/api/staff", auth, async (req: Request, res: Response) => {
    try {
      console.log('POST /api/staff content-type:', req.headers['content-type']);
      console.log('POST /api/staff raw body:', req.body);
      const body = insertStaffBodySchema.parse(req.body);
      const insert = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email && body.email.length > 0 ? body.email : undefined,
        phone: body.phone,
        position: body.position,
        hourlyRate: body.hourlyRate ?? 0,
        w4Allowances: body.w4Allowances ?? 0,
        additionalTaxWithholding: body.additionalTaxWithholding ?? 0,
        faceDescriptor: body.faceDescriptor,
        fingerprintHash: body.fingerprintHash,
        // booleans stored as integers in SQLite
        isActive: typeof body.isActive === 'boolean' ? (body.isActive ? 1 : 0) : (body.isActive ?? 1),
      } as any;

      // Create staff
      let created;
      try {
        created = await storage.createStaff(insert);
      } catch (e: any) {
        // Handle unique email constraint for SQLite
        if (typeof e?.message === 'string' && e.message.includes('UNIQUE constraint failed: staff.email')) {
          return res.status(400).json({ message: "A staff member with this email already exists" });
        }
        throw e;
      }
      console.log('POST /api/staff created:', created?.id);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('Error creating staff:', error);
      res.status(500).json({ message: "Failed to create staff" });
    }
  });

  // Staff schedules routes
  app.get("/api/schedules", auth, async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      let schedules;
      
      if (date) {
        schedules = await storage.getStaffSchedulesByDate(new Date(date as string));
      } else {
        schedules = await storage.getTodaysStaffSchedules();
      }
      
      res.json(schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  // Convenience endpoint used by client to fetch today's schedules
  app.get("/api/schedules/today", auth, async (_req: Request, res: Response) => {
    try {
      const schedules = await storage.getTodaysStaffSchedules();
      res.json(schedules);
    } catch (error) {
      console.error('Error fetching today\'s schedules:', error);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", auth, async (req: Request, res: Response) => {
    try {
      // Inline validator (the shared insertStaffScheduleSchema is a stub)
      const scheduleBodySchema = z.object({
        staffId: z.string().min(1, 'staffId is required'),
        room: z.string().min(1, 'room is required'),
        date: z.union([z.string(), z.date()]),
        scheduledStart: z.union([z.string(), z.date()]),
        scheduledEnd: z.union([z.string(), z.date()]),
        notes: z.string().optional(),
        scheduleType: z.string().optional(),
      });

      const parsed = scheduleBodySchema.parse(req.body);

      const toDate = (v: string | Date): Date => (v instanceof Date ? v : new Date(v));
      const startDate = toDate(parsed.scheduledStart);
      const endDate = toDate(parsed.scheduledEnd);

      // Normalize date-only field to YYYY-MM-DD (local or UTC-invariant)
      const dateOnly = ((): string => {
        const d = toDate(parsed.date);
        return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
          .toISOString()
          .split('T')[0];
      })();

      // Construct payload in the format expected by storage
      const payload = {
        staffId: parsed.staffId,
        room: parsed.room,
        date: dateOnly,
        scheduledStart: startDate.toISOString(),
        scheduledEnd: endDate.toISOString(),
        notes: parsed.notes,
        scheduleType: parsed.scheduleType,
      } as any;

      // Create schedule (storage re-validates times and throws consistent messages)
      const newSchedule = await storage.createStaffSchedule(payload);
      res.status(201).json(newSchedule);
    } catch (error) {
      console.error('Schedule creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (
          errorMessage.includes("Cannot schedule staff for a time in the past") ||
          errorMessage.includes("End time must be after start time")
        ) {
          return res.status(400).json({ message: errorMessage });
        }
      }
      res.status(500).json({ message: "Failed to create staff schedule" });
    }
  });

  app.put("/api/schedules/:id", auth, async (req: Request, res: Response) => {
    try {
      const updatedSchedule = await storage.updateStaffSchedule(req.params.id, req.body);
      res.json(updatedSchedule);
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({ message: "Failed to update schedule" });
    }
  });

  app.post("/api/schedules/:id/present", auth, async (req: Request, res: Response) => {
    try {
      const { actualStart } = req.body;
      const updatedSchedule = await storage.markStaffPresent(req.params.id, new Date(actualStart));
      res.json(updatedSchedule);
    } catch (error) {
      console.error('Error marking staff present:', error);
      res.status(500).json({ message: "Failed to mark staff present" });
    }
  });

  // Alias endpoint used by client: mark-present
  app.post("/api/schedules/:id/mark-present", auth, async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const updatedSchedule = await storage.markStaffPresent(req.params.id, now);
      res.json(updatedSchedule);
    } catch (error) {
      console.error('Error marking staff present:', error);
      res.status(500).json({ message: "Failed to mark staff present" });
    }
  });

  app.post("/api/schedules/:id/end", auth, async (req: Request, res: Response) => {
    try {
      const { actualEnd } = req.body;
      const updatedSchedule = await storage.markStaffEnd(req.params.id, new Date(actualEnd));
      res.json(updatedSchedule);
    } catch (error) {
      console.error('Error marking staff end:', error);
      res.status(500).json({ message: "Failed to mark staff end" });
    }
  });

  const server = createServer(app);
  return server;
}
