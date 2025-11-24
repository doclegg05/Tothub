import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Basic health check
router.get('/health', async (_req: Request, res: Response) => {
  // If using SQLite (no pool), consider app healthy for dev
  if (!pool) {
    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'sqlite',
      environment: process.env.NODE_ENV || 'development',
    });
  }

  try {
    await pool.query('SELECT 1');
    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

// Detailed health check
router.get('/health/detailed', async (_req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();
    let dbLatency = null as null | number;
    if (pool) {
      const dbStart = Date.now();
      await pool.query('SELECT 1');
      dbLatency = Date.now() - dbStart;
    }
    
    // Check environment variables
    const envCheck = {
      database: !!process.env.DATABASE_URL,
      jwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    };
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      database: pool
        ? { status: 'connected', latency: `${dbLatency}ms` }
        : { status: 'sqlite', latency: null },
      environment: envCheck,
      version: process.version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Readiness probe for Kubernetes/container deployments
router.get('/ready', async (_req: Request, res: Response) => {
  if (!pool) {
    // In dev with SQLite, treat as ready
    return res.json({ status: 'ready', timestamp: new Date().toISOString() });
  }
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    return res.status(503).json({ status: 'not ready', reason: 'Database not available' });
  }
});

export { router as healthRoutes };