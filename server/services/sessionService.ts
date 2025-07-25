import { db } from '../db';
import { sessions, sessionActivity } from '@shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import crypto from 'crypto';

export interface SessionData {
  userId: string;
  username: string;
  role: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionService {
  private static instance: SessionService;
  
  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // Create a new session
  public async createSession(data: {
    userId: string;
    username: string;
    role: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    
    await db.insert(sessions).values({
      id: sessionId,
      userId: data.userId,
      username: data.username,
      role: data.role,
      loginTime: now,
      lastActivity: now,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      isActive: true,
    });
    
    // Log initial activity
    await this.trackActivity(sessionId, 'login', '/api/auth/login');
    
    return sessionId;
  }

  // Get active session
  public async getSession(sessionId: string): Promise<SessionData | null> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.id, sessionId),
        eq(sessions.isActive, true)
      ));
    
    if (!session) return null;
    
    // Check if session has expired (8 hours)
    const expirationTime = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const sessionAge = Date.now() - new Date(session.loginTime).getTime();
    
    if (sessionAge > expirationTime) {
      await this.endSession(sessionId, 'expired');
      return null;
    }
    
    return {
      userId: session.userId,
      username: session.username,
      role: session.role,
      loginTime: new Date(session.loginTime),
      lastActivity: new Date(session.lastActivity),
      ipAddress: session.ipAddress || undefined,
      userAgent: session.userAgent || undefined,
    };
  }

  // Update session activity
  public async updateActivity(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ lastActivity: new Date() })
      .where(eq(sessions.id, sessionId));
  }

  // Track specific activity
  public async trackActivity(
    sessionId: string,
    action: string,
    path: string,
    details?: any
  ): Promise<void> {
    await db.insert(sessionActivity).values({
      sessionId,
      action,
      path,
      details: details ? JSON.stringify(details) : null,
    });
    
    // Update last activity time
    await this.updateActivity(sessionId);
  }

  // End session
  public async endSession(sessionId: string, reason: 'logout' | 'expired' | 'forced' = 'logout'): Promise<void> {
    await db
      .update(sessions)
      .set({ 
        isActive: false,
        endTime: new Date(),
        endReason: reason,
      })
      .where(eq(sessions.id, sessionId));
    
    // Log logout activity
    await this.trackActivity(sessionId, 'logout', '/api/auth/logout', { reason });
  }

  // Get active sessions for a user
  public async getUserSessions(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.userId, userId),
        eq(sessions.isActive, true)
      ))
      .orderBy(desc(sessions.loginTime));
  }

  // Get session activity
  public async getSessionActivity(sessionId: string, limit: number = 100): Promise<any[]> {
    return await db
      .select()
      .from(sessionActivity)
      .where(eq(sessionActivity.sessionId, sessionId))
      .orderBy(desc(sessionActivity.timestamp))
      .limit(limit);
  }

  // Get all active sessions (for admin dashboard)
  public async getActiveSessions(): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    
    return await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.isActive, true),
        gte(sessions.lastActivity, cutoffTime)
      ))
      .orderBy(desc(sessions.lastActivity));
  }

  // Clean up expired sessions
  public async cleanupExpiredSessions(): Promise<number> {
    const expirationTime = new Date(Date.now() - 8 * 60 * 60 * 1000); // 8 hours ago
    
    const expiredSessions = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.isActive, true),
        gte(sessions.loginTime, expirationTime)
      ));
    
    let cleaned = 0;
    for (const session of expiredSessions) {
      await this.endSession(session.id, 'expired');
      cleaned++;
    }
    
    return cleaned;
  }
}

export const sessionService = SessionService.getInstance();