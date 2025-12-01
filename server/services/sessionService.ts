import crypto from "crypto";

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
  private sessions: Map<string, any> = new Map();
  private activityLog: any[] = [];

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
    const sessionId = crypto.randomBytes(32).toString("hex");
    const now = new Date();

    const session = {
      id: sessionId,
      userId: data.userId,
      username: data.username,
      role: data.role,
      loginTime: now,
      lastActivity: now,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      isActive: true,
    };

    this.sessions.set(sessionId, session);
    console.log(`✅ Session created (in-memory): ${sessionId}`);

    // Log initial activity
    await this.trackActivity(sessionId, "login", "/api/auth/login");

    return sessionId;
  }

  // Get active session
  public async getSession(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);

    if (!session || !session.isActive) return null;

    // Check if session has expired (8 hours)
    const expirationTime = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const sessionAge = Date.now() - new Date(session.loginTime).getTime();

    if (sessionAge > expirationTime) {
      await this.endSession(sessionId, "expired");
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
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  // Track specific activity
  public async trackActivity(
    sessionId: string,
    action: string,
    path: string,
    details?: any
  ): Promise<void> {
    this.activityLog.push({
      sessionId,
      action,
      path,
      details: details ? JSON.stringify(details) : null,
      timestamp: new Date(),
    });

    // Update last activity time
    await this.updateActivity(sessionId);
  }

  // End session
  public async endSession(
    sessionId: string,
    reason: "logout" | "expired" | "forced" = "logout"
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.endTime = new Date();
      session.endReason = reason;
      this.sessions.set(sessionId, session);
    }

    // Log logout activity
    await this.trackActivity(sessionId, "logout", "/api/auth/logout", {
      reason,
    });
  }

  // Get active sessions for a user
  public async getUserSessions(userId: string): Promise<any[]> {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId && s.isActive)
      .sort((a, b) => b.loginTime.getTime() - a.loginTime.getTime());
  }

  // Get session activity
  public async getSessionActivity(
    sessionId: string,
    limit: number = 100
  ): Promise<any[]> {
    return this.activityLog
      .filter((a) => a.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get all active sessions (for admin dashboard)
  public async getActiveSessions(): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    return Array.from(this.sessions.values())
      .filter((s) => s.isActive && s.lastActivity >= cutoffTime)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  // Clean up expired sessions
  public async cleanupExpiredSessions(): Promise<number> {
    const expirationTime = new Date(Date.now() - 8 * 60 * 60 * 1000); // 8 hours ago

    let cleaned = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (session.isActive && session.loginTime < expirationTime) {
        await this.endSession(id, "expired");
        cleaned++;
      }
    }

    return cleaned;
  }
}

export const sessionService = SessionService.getInstance();
