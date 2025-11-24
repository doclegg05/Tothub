import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { memoryCache } from "../services/simpleMemoryCache";
import { insertChildSchema } from "@shared/schema";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Get all children (paginated)
router.get("/", auth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Cap at 100 for memory safety
    
    // Check cache first
    const cacheKey = `children_page_${page}_limit_${limit}`;
    const cachedResult = memoryCache.getChildrenCache(cacheKey);
    
    if (cachedResult) {
      console.log(`📋 Serving children from cache - page: ${page}, limit: ${limit}`);
      return res.json(cachedResult);
    }

    // Fetch from database with proper pagination
    const result = await storage.getActiveChildren({ page, limit });
    
    // Get total count for pagination
    const totalResult = await storage.getChildrenCount();
    const total = totalResult || 0;
    const totalPages = Math.ceil(total / limit);
    
    const response = {
      data: result,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    // Cache the result (short TTL for frequently changing data)
    memoryCache.setChildrenCache(cacheKey, response, 2 * 60 * 1000); // 2 minutes
    
    console.log(`📋 Fetched children - page: ${page}, limit: ${limit}, total: ${total}, fetched: ${result.length}`);
    res.json(response);
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({ message: "Failed to fetch children" });
  }
});

// Get single child
router.get("/:id", auth, async (req: Request, res: Response) => {
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

// Create new child
router.post("/", auth, async (req: Request, res: Response) => {
  try {
    console.log("Creating child with data:", JSON.stringify(req.body, null, 2));
    const validatedData = insertChildSchema.parse(req.body);
    const child = await storage.createChild(validatedData);
    console.log("Child created successfully:", child.id);
    
    // Clear children cache after creating
    memoryCache.clearChildrenCache();
    
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

// Update child
router.put("/:id", auth, async (req: Request, res: Response) => {
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

export default router;