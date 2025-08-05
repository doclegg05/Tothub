import { Request, Response, Router } from "express";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";
import { insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";

// Extend Express Request type
interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

const router = Router();

// Get current user's profile
router.get("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let profile = await storage.getUserProfile(userId);
    
    // If profile doesn't exist, create a basic one
    if (!profile) {
      profile = await storage.createUserProfile({
        userId,
        username: req.user!.username,
        role: req.user!.role,
        firstName: req.user!.username, // Default to username
        lastName: "",
        email: "",
        childrenIds: [], // Required field
      });
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Update current user's profile
router.patch("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Validate input
    const updateData = insertUserProfileSchema.partial().parse(req.body);
    
    // Ensure user can only update their own profile
    const profile = await storage.updateUserProfile(userId, updateData);
    
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid input", errors: error.errors });
    } else {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  }
});

// Get profile by username (for admin users)
router.get("/profile/:username", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Only directors can view other profiles
    if (req.user!.role !== 'director') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const profile = await storage.getUserProfileByUsername(req.params.username);
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Upload profile picture
router.post("/profile/picture", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }
    
    const profile = await storage.updateUserProfile(userId, {
      profilePictureUrl: imageUrl
    });
    
    res.json(profile);
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Error updating profile picture" });
  }
});

export default router;