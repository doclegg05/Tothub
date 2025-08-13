import type { Express } from "express";
import { createServer, type Server } from "http";
import { DatabaseStorage } from "./storage";
import { insertStaffScheduleSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const auth = authMiddleware;
  const storage = new DatabaseStorage();
  
  // Staff routes
  app.get("/api/staff", auth, async (req, res) => {
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

  app.get("/api/staff/:id", auth, async (req, res) => {
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

  app.post("/api/staff", auth, async (req, res) => {
    try {
      const newStaff = await storage.createStaff(req.body);
      res.status(201).json(newStaff);
    } catch (error) {
      console.error('Error creating staff:', error);
      res.status(500).json({ message: "Failed to create staff" });
    }
  });

  // Staff schedules routes
  app.get("/api/schedules", auth, async (req, res) => {
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

  app.post("/api/schedules", auth, async (req, res) => {
    try {
      // Validate input
      const validatedData = insertStaffScheduleSchema.parse(req.body);
      
      // Create schedule
      const newSchedule = await storage.createStaffSchedule(validatedData);
      res.status(201).json(newSchedule);
    } catch (error) {
      console.error('Schedule creation error:', error);
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      // Handle specific validation errors from storage layer
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes("Cannot schedule staff for a time in the past") ||
            errorMessage.includes("End time must be after start time")) {
          return res.status(400).json({ message: errorMessage });
        }
      }
      res.status(500).json({ message: "Failed to create staff schedule" });
    }
  });

  app.put("/api/schedules/:id", auth, async (req, res) => {
    try {
      const updatedSchedule = await storage.updateStaffSchedule(req.params.id, req.body);
      res.json(updatedSchedule);
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({ message: "Failed to update schedule" });
    }
  });

  app.post("/api/schedules/:id/present", auth, async (req, res) => {
    try {
      const { actualStart } = req.body;
      const updatedSchedule = await storage.markStaffPresent(req.params.id, new Date(actualStart));
      res.json(updatedSchedule);
    } catch (error) {
      console.error('Error marking staff present:', error);
      res.status(500).json({ message: "Failed to mark staff present" });
    }
  });

  app.post("/api/schedules/:id/end", auth, async (req, res) => {
    try {
      const { actualEnd } = req.body;
      const updatedSchedule = await storage.markStaffEnd(req.params.id, new Date(actualEnd));
      res.json(updatedSchedule);
    } catch (error) {
      console.error('Error marking staff end:', error);
      res.status(500).json({ message: "Failed to mark staff end" });
    }
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  const server = createServer(app);
  return server;
}
