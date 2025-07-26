import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sessionService } from '../services/sessionService';

const JWT_SECRET = process.env.JWT_SECRET || 'daycare-jwt-secret-2024';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // Skip auth for public routes
  const publicPaths = ['/api/auth/login', '/api/auth/logout', '/api/health'];
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  console.log(`🔐 Auth check for ${req.path} - Header: ${authHeader ? authHeader.substring(0, 30) + '...' : 'No auth header'}`);
  
  if (!token) {
    console.log(`🔐 No token found for ${req.path}`);
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    console.log(`🔐 Verifying token: ${token.substring(0, 20)}... with secret: ${JWT_SECRET.substring(0, 10)}...`);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log(`🔐 Token verified successfully. User: ${decoded.username}, Role: ${decoded.role}`);
    
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };
    
    // Track activity if session exists
    const sessionId = (req as any).session?.sessionId;
    if (sessionId) {
      await sessionService.trackActivity(
        sessionId,
        req.method.toLowerCase(),
        req.path,
        { body: req.body }
      );
    }
    
    next();
  } catch (error) {
    console.log(`🔐 Token verification failed for ${req.path}:`, error instanceof Error ? error.message : 'Unknown error');
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

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