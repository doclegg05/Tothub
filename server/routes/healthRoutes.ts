import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Basic health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed'
    });
  }
});

// Detailed health check
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();
    const dbStart = Date.now();
    
    // Test database with a more complex query
    await pool.query('SELECT COUNT(*) FROM information_schema.tables');
    const dbLatency = Date.now() - dbStart;
    
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
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`
      },
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
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    await pool.query('SELECT 1');
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      reason: 'Database not available'
    });
  }
});

export { router as healthRoutes };