import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { stateCompliance } from "@shared/schema";
import { desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Get all settings
router.get("/", auth, async (req, res) => {
  try {
    const settings = await storage.getAllSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Update or create a setting
router.put("/:key", auth, async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await storage.createOrUpdateSetting(req.params.key, value);
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: "Failed to update setting" });
  }
});

// State compliance routes
router.get("/state-compliance", auth, async (req, res) => {
  try {
    const compliance = await storage.getStateCompliance();
    res.json(compliance || { currentState: "WV" });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch state compliance" });
  }
});

router.put("/state-compliance", auth, async (req, res) => {
  try {
    const { state, auditNote } = req.body;
    if (!state) {
      return res.status(400).json({ message: "State is required" });
    }
    const compliance = await storage.updateStateCompliance(state, auditNote);
    res.json(compliance);
  } catch (error) {
    res.status(500).json({ message: "Failed to update state compliance" });
  }
});

router.get("/state-compliance/history", auth, async (req, res) => {
  try {
    const history = await db.select()
      .from(stateCompliance)
      .orderBy(desc(stateCompliance.updatedAt))
      .limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch compliance history" });
  }
});

export default router;