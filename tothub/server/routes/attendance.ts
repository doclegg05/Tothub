import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertAttendanceSchema } from "@shared/schema";
import { zapierService } from "../services/zapierService";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Get today's attendance
router.get("/today", auth, async (req: Request, res: Response) => {
  try {
    const attendance = await storage.getTodaysAttendance();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch today's attendance" });
  }
});

// Get currently present children
router.get("/present", auth, async (req: Request, res: Response) => {
  try {
    const present = await storage.getCurrentlyPresentChildren();
    res.json(present);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch present children" });
  }
});

// Check in a child
router.post("/check-in", auth, async (req: Request, res: Response) => {
  try {
    const schema = insertAttendanceSchema.omit({ checkOutTime: true, checkOutBy: true });
    const validatedData = schema.parse({
      ...req.body,
      date: new Date(),
      checkInTime: new Date(),
    });
    const attendance = await storage.createAttendance(validatedData);
    
    // Get child data for Zapier webhook
    const child = await storage.getChild(validatedData.childId);
    if (child) {
      await zapierService.triggerChildCheckin(child);
    }
    
    res.status(201).json(attendance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to check in child" });
  }
});

// Check out a child
router.post("/check-out/:id", auth, async (req: Request, res: Response) => {
  try {
    const { checkOutBy } = req.body;
    if (!checkOutBy) {
      return res.status(400).json({ message: "checkOutBy is required" });
    }
    const attendance = await storage.checkOutChild(req.params.id, checkOutBy, new Date());
    
    // Get child data for Zapier webhook
    const child = await storage.getChild(req.params.id);
    if (child) {
      await zapierService.triggerChildCheckout(child);
    }
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to check out child" });
  }
});

export default router;