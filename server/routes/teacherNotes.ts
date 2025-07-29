import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";
import { insertTeacherNoteSchema } from "@shared/schema";
import { z } from "zod";

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    staffId?: string;
  };
}

const teacherNotesRouter = Router();

// Add a teacher note
teacherNotesRouter.post("/teacher-notes", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user || !user.staffId) {
      return res.status(403).json({ error: "Only staff members can add teacher notes" });
    }

    const schema = insertTeacherNoteSchema.extend({
      childId: z.string(),
      note: z.string().min(1).max(1000),
      category: z.enum(['behavior', 'learning', 'health', 'general']).optional(),
    });

    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error.errors });
    }

    const noteData = {
      ...validationResult.data,
      staffId: user.staffId,
      date: new Date()
    };

    const newNote = await storage.addTeacherNote(noteData);
    res.json(newNote);
  } catch (error) {
    next(error);
  }
});

// Get teacher notes for a child on a specific date
teacherNotesRouter.get("/teacher-notes/:childId/:date", authMiddleware, async (req, res, next) => {
  try {
    const { childId, date } = req.params;
    const notes = await storage.getTeacherNotes(childId, new Date(date));
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// Manual report sending
teacherNotesRouter.post("/daily-reports/send", authMiddleware, async (req, res, next) => {
  try {
    const { childId, date } = req.body;
    
    if (!childId || !date) {
      return res.status(400).json({ error: "childId and date are required" });
    }
    
    const { DailyReportService } = await import("../services/dailyReportService");
    await DailyReportService.sendDailyReport(childId, new Date(date));
    
    res.json({ success: true, message: "Daily report sent successfully" });
  } catch (error) {
    next(error);
  }
});

// Get report status
teacherNotesRouter.get("/daily-reports/:childId/:date", authMiddleware, async (req, res, next) => {
  try {
    const { childId, date } = req.params;
    const report = await storage.getDailyReport(childId, new Date(date));
    res.json(report || { status: "not_generated" });
  } catch (error) {
    next(error);
  }
});

// Send all daily reports (admin only)
teacherNotesRouter.post("/daily-reports/send-all", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can send all daily reports" });
    }
    
    const { date } = req.body;
    const { DailyReportService } = await import("../services/dailyReportService");
    
    // Run in background
    DailyReportService.sendAllDailyReports(date ? new Date(date) : new Date())
      .catch(err => console.error("Error sending all daily reports:", err));
    
    res.json({ success: true, message: "Daily reports generation started" });
  } catch (error) {
    next(error);
  }
});

export { teacherNotesRouter };