import { Router } from "express";
import { storage } from "../storage";
import { insertAlertSchema } from "@shared/schema";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Get unread alerts
router.get("/unread", auth, async (req, res) => {
  try {
    const alerts = await storage.getUnreadAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unread alerts" });
  }
});

// Get all alerts
router.get("/", auth, async (req, res) => {
  try {
    const alerts = await storage.getAllAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
});

// Create new alert
router.post("/", auth, async (req, res) => {
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

// Mark alert as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const alert = await storage.markAlertAsRead(req.params.id);
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark alert as read" });
  }
});

// Delete alert
router.delete("/:id", auth, async (req, res) => {
  try {
    await storage.deleteAlert(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete alert" });
  }
});

export default router;