import compression from 'compression';
import { Request, Response } from 'express';

// Configure compression middleware
export const compressionMiddleware = compression({
  // Enable compression for all responses
  filter: (req: Request, res: Response) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Use compression for JSON, text, and other compressible types
    return compression.filter(req, res);
  },
  // Compression level (0-9, where 9 is maximum compression)
  level: 6,
  // Minimum response size to compress (in bytes)
  threshold: 1024,
  // Memory level (1-9, where 9 uses maximum memory)
  memLevel: 8,
});