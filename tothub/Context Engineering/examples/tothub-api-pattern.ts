// Example: TotHub API Pattern
// This demonstrates the standard pattern for creating API endpoints in TotHub

import { Request, Response } from 'express';
import { z } from 'zod';
import { insertChildSchema } from '@/shared/schema';
import storage from './storage';

// Standard API endpoint pattern
export async function createChild(req: Request, res: Response) {
  try {
    // 1. Validate request body with Zod schema
    const validatedData = insertChildSchema.parse(req.body);
    
    // 2. Use storage interface for database operations
    const newChild = await storage.createChild(validatedData);
    
    // 3. Clear relevant caches
    storage.clearChildrenCache();
    
    // 4. Return consistent response format
    res.status(201).json({
      success: true,
      data: newChild,
      message: 'Child enrolled successfully'
    });
    
  } catch (error) {
    // 5. Handle errors consistently
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    } else {
      console.error('Error creating child:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

// Example: Paginated list endpoint
export async function listChildren(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    
    const { data, total } = await storage.getChildrenPaginated(page, limit);
    
    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error listing children:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch children'
    });
  }
}