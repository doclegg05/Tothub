import { Request, Response, NextFunction } from 'express';

// Extend Request to include user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    [key: string]: any;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // For testing purposes, allow all requests
  // In production, this would validate JWT tokens or session data
  next();
};

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
}