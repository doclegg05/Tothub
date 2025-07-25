import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sessionService } from '../services/sessionService';

const router = Router();

// Apply auth middleware to all session routes
router.use(authMiddleware);

// Get current session info
router.get('/current', async (req: AuthRequest, res) => {
  try {
    const sessionId = (req as any).session?.sessionId;
    if (!sessionId) {
      return res.status(404).json({ message: 'No active session' });
    }
    
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Failed to get session info' });
  }
});

// Get session activity
router.get('/activity', async (req: AuthRequest, res) => {
  try {
    const sessionId = (req as any).session?.sessionId;
    if (!sessionId) {
      return res.status(404).json({ message: 'No active session' });
    }
    
    const limit = parseInt(req.query.limit as string) || 100;
    const activity = await sessionService.getSessionActivity(sessionId, limit);
    
    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Failed to get session activity' });
  }
});

// Get all active sessions (admin only)
router.get('/active', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'director') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const activeSessions = await sessionService.getActiveSessions();
    res.json(activeSessions);
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ message: 'Failed to get active sessions' });
  }
});

// Get user's sessions
router.get('/user/:userId', async (req: AuthRequest, res) => {
  try {
    // Users can only view their own sessions unless they're an admin
    if (req.user?.userId !== req.params.userId && req.user?.role !== 'director') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const sessions = await sessionService.getUserSessions(req.params.userId);
    res.json(sessions);
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ message: 'Failed to get user sessions' });
  }
});

// Force logout a session (admin only)
router.post('/force-logout/:sessionId', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'director') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    await sessionService.endSession(req.params.sessionId, 'forced');
    res.json({ message: 'Session forcefully ended' });
  } catch (error) {
    console.error('Force logout error:', error);
    res.status(500).json({ message: 'Failed to force logout session' });
  }
});

export default router;