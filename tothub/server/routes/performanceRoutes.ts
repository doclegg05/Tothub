import { Router, Request, Response } from 'express';
import { monitoringService } from '../services/monitoringService';
import { CachingService } from '../services/cachingService';
import { pool } from '../db';
import { memoryCache as cache } from '../services/simpleMemoryCache';

const router = Router();
// monitoringService is imported directly
const cachingService = CachingService.getInstance();

// Get comprehensive performance metrics
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    // Get API metrics from monitoring service
    const apiMetrics = {
      memory: monitoringService.getMemorySummary(),
      performance: monitoringService.getPerformanceHistory()
    };

    // Get cache metrics
    const cacheMetrics = {
      children: cache.getChildrenCacheStats(),
      staff: cache.getStaffCacheStats(),
      attendance: cache.getAttendanceCacheStats(),
      stateRatios: cache.getStateRatiosCacheStats(),
    };

    // Get database metrics
    const dbMetrics = await getDatabaseMetrics();

    res.json({
      memory: process.memoryUsage(),
      apiMetrics,
      cacheMetrics,
      databaseMetrics: dbMetrics,
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Get detailed endpoint metrics
router.get('/endpoints', async (req: Request, res: Response) => {
  try {
    const endpointMetrics = monitoringService.getPerformanceHistory();
    res.json(endpointMetrics);
  } catch (error) {
    console.error('Error fetching endpoint metrics:', error);
    res.status(500).json({ error: 'Failed to fetch endpoint metrics' });
  }
});

// Clear specific cache
router.post('/cache/clear/:cacheName', async (req: Request, res: Response) => {
  const { cacheName } = req.params;
  
  try {
    switch (cacheName) {
      case 'children':
        cache.clearChildrenCache();
        break;
      case 'staff':
        cache.clearStaffCache();
        break;
      case 'attendance':
        cache.clearAttendanceCache();
        break;
      case 'stateRatios':
        cache.clearStateRatiosCache();
        break;
      case 'all':
        cache.clearAllCaches();
        break;
      default:
        return res.status(400).json({ error: 'Invalid cache name' });
    }
    
    res.json({ message: `Cache ${cacheName} cleared successfully` });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Get slow queries
router.get('/slow-queries', async (req: Request, res: Response) => {
  try {
    const slowQueries = monitoringService.getPerformanceHistory().filter((metric: any) => metric.responseTime > 1000);
    res.json(slowQueries);
  } catch (error) {
    console.error('Error fetching slow queries:', error);
    res.status(500).json({ error: 'Failed to fetch slow queries' });
  }
});

// Helper function to get database metrics
async function getDatabaseMetrics() {
  try {
    // Get connection pool stats
    const poolStats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };

    // Get database size and connection info
    const dbSizeResult = await pool.query(`
      SELECT 
        pg_database_size(current_database()) as db_size,
        (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections
    `);

    const dbSize = dbSizeResult.rows[0]?.db_size || 0;
    const activeConnections = dbSizeResult.rows[0]?.active_connections || 0;

    // Get query statistics
    const queryStatsResult = await pool.query(`
      SELECT 
        count(*) as total_queries,
        sum(CASE WHEN mean_exec_time > 1000 THEN 1 ELSE 0 END) as slow_queries
      FROM pg_stat_statements
      WHERE query NOT LIKE '%pg_stat%'
    `).catch(() => ({ rows: [{ total_queries: 0, slow_queries: 0 }] }));

    const queryStats = queryStatsResult.rows[0] || { total_queries: 0, slow_queries: 0 };

    return {
      activeConnections,
      poolStats,
      dbSize: `${(dbSize / 1024 / 1024).toFixed(2)}MB`,
      queryCount: queryStats.total_queries,
      slowQueries: queryStats.slow_queries,
    };
  } catch (error) {
    console.error('Error getting database metrics:', error);
    return {
      activeConnections: 0,
      poolStats: { totalCount: 0, idleCount: 0, waitingCount: 0 },
      dbSize: '0MB',
      queryCount: 0,
      slowQueries: 0,
    };
  }
}

export default router;