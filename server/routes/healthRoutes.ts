import { Router } from 'express';
import { MonitoringService } from '../services/monitoringService';
import { CachingService } from '../services/cachingService';
import { BackupService } from '../services/backupService';
import { IntegrationTestingService } from '../services/integrationTestingService';
import { LoadTestingService } from '../services/loadTestingService';
import { pool } from '../db';

const router = Router();

// Basic health check endpoint
router.get('/health', async (req, res) => {
  try {
    const monitoringService = MonitoringService.getInstance();
    const cachingService = CachingService.getInstance();
    
    const health = monitoringService.getHealthStatus();
    const cacheHealth = await cachingService.healthCheck();
    
    // Test database connection
    let dbHealth: { status: string; latency: number; error?: string } = { status: 'healthy', latency: 0 };
    try {
      const start = performance.now();
      await pool.query('SELECT 1');
      dbHealth.latency = performance.now() - start;
    } catch (error) {
      dbHealth = { 
        status: 'unhealthy', 
        latency: 0,
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }

    const overallStatus = health.status === 'healthy' && 
                         cacheHealth.status === 'healthy' && 
                         dbHealth.status === 'healthy' 
                         ? 'healthy' : 'unhealthy';

    res.status(overallStatus === 'healthy' ? 200 : 503).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: health.uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        application: health,
        cache: cacheHealth,
        database: dbHealth,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Readiness check for Kubernetes
router.get('/ready', async (req, res) => {
  try {
    // Check critical dependencies
    const checks = await Promise.allSettled([
      pool.query('SELECT 1'),
      CachingService.getInstance().exists('app:started'),
    ]);

    const allReady = checks.every(check => check.status === 'fulfilled');
    
    res.status(allReady ? 200 : 503).json({
      ready: allReady,
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0].status === 'fulfilled',
        cache: checks[1].status === 'fulfilled',
      },
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error instanceof Error ? error.message : 'Readiness check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Liveness check for Kubernetes
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Detailed metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const monitoringService = MonitoringService.getInstance();
    const cachingService = CachingService.getInstance();
    
    const metrics = monitoringService.getCurrentMetrics();
    const cacheMetrics = cachingService.getMetrics();
    
    res.json({
      timestamp: new Date().toISOString(),
      performance: metrics.performance.slice(-10), // Last 10 requests
      system: metrics.system.slice(-10), // Last 10 system metrics
      cache: cacheMetrics,
      process: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Metrics collection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Infrastructure status dashboard
router.get('/infrastructure', async (req, res) => {
  try {
    const monitoringService = MonitoringService.getInstance();
    const cachingService = CachingService.getInstance();
    
    const health = monitoringService.getHealthStatus();
    const cacheHealth = await cachingService.healthCheck();
    const cacheMetrics = cachingService.getMetrics();
    
    // System information
    const systemInfo = {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu_usage: process.cpuUsage(),
      environment: process.env.NODE_ENV,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        application: {
          status: health.status,
          metrics: health.metrics,
        },
        cache: {
          status: cacheHealth.status,
          latency: cacheHealth.latency,
          metrics: cacheMetrics,
        },
        database: {
          status: 'healthy', // Could add more detailed DB health check
          pool_size: 10, // Would get from actual pool configuration
          active_connections: 5, // Would get from actual pool status
        },
      },
      system: systemInfo,
      deployment: {
        version: process.env.npm_package_version || '1.0.0',
        build_date: process.env.BUILD_DATE || 'unknown',
        commit_hash: process.env.GIT_COMMIT || 'unknown',
        deployed_at: process.env.DEPLOYED_AT || 'unknown',
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Infrastructure status failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Run integration tests endpoint
router.post('/tests/integration', async (req, res) => {
  try {
    const testingService = IntegrationTestingService.getInstance();
    const results = await testingService.runAllTests();
    
    // Convert Map to object for JSON serialization
    const serializedResults: Record<string, Record<string, any>> = {};
    results.forEach((suiteResults, suiteName) => {
      serializedResults[suiteName] = {};
      suiteResults.forEach((testResult, testName) => {
        serializedResults[suiteName][testName] = testResult;
      });
    });
    
    res.json({
      timestamp: new Date().toISOString(),
      results: serializedResults,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Integration tests failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Run load tests endpoint
router.post('/tests/load', async (req, res) => {
  try {
    const loadTestingService = LoadTestingService.getInstance();
    const { scenario } = req.body;
    
    let results;
    switch (scenario) {
      case 'morning-rush':
        results = await loadTestingService.runMorningRushTest();
        break;
      case 'payroll-stress':
        results = await loadTestingService.runPayrollStressTest();
        break;
      default:
        // Run custom scenario
        const config = req.body;
        results = await loadTestingService.runLoadTest(config);
    }
    
    // Convert Map to object for JSON serialization
    const serializedResults: Record<string, any> = {};
    results.forEach((result, scenarioName) => {
      serializedResults[scenarioName] = result;
    });
    
    const recommendations = loadTestingService.generateRecommendations(results);
    
    res.json({
      timestamp: new Date().toISOString(),
      results: serializedResults,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Load tests failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Backup status and operations
router.get('/backup/status', async (req, res) => {
  try {
    const backupService = BackupService.getInstance({
      schedule: '0 2 * * *',
      retention: 30,
      storageType: 'local',
      notificationChannels: ['email'],
    });
    
    const status = backupService.getBackupStatus();
    
    res.json({
      timestamp: new Date().toISOString(),
      backup_status: status,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Backup status failed',
      timestamp: new Date().toISOString(),
    });
  }
});

router.post('/backup/create', async (req, res) => {
  try {
    const backupService = BackupService.getInstance({
      schedule: '0 2 * * *',
      retention: 30,
      storageType: 'local',
      notificationChannels: ['email'],
    });
    
    const { type = 'full' } = req.body;
    
    const result = type === 'incremental' 
      ? await backupService.performIncrementalBackup()
      : await backupService.performFullBackup();
    
    res.json({
      timestamp: new Date().toISOString(),
      backup_result: result,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Backup creation failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Cache management endpoints
router.post('/cache/flush', async (req, res) => {
  try {
    const cachingService = CachingService.getInstance();
    const success = await cachingService.flush();
    
    res.json({
      timestamp: new Date().toISOString(),
      success,
      message: success ? 'Cache flushed successfully' : 'Cache flush failed',
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Cache flush failed',
      timestamp: new Date().toISOString(),
    });
  }
});

router.post('/cache/warmup', async (req, res) => {
  try {
    const cachingService = CachingService.getInstance();
    await cachingService.warmUpCache();
    
    res.json({
      timestamp: new Date().toISOString(),
      success: true,
      message: 'Cache warmed up successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Cache warmup failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Performance optimization suggestions
router.get('/optimization/suggestions', async (req, res) => {
  try {
    const monitoringService = MonitoringService.getInstance();
    const cachingService = CachingService.getInstance();
    
    const metrics = monitoringService.getCurrentMetrics();
    const cacheMetrics = cachingService.getMetrics();
    
    const suggestions = [];
    
    // Analyze cache performance
    if (cacheMetrics.hitRate < 0.8) {
      suggestions.push({
        category: 'Caching',
        priority: 'high',
        suggestion: 'Cache hit rate is low. Consider increasing TTL for stable data or adding more caching layers.',
        metric: `Hit rate: ${(cacheMetrics.hitRate * 100).toFixed(1)}%`,
      });
    }
    
    // Analyze response times
    const recentMetrics = metrics.performance.slice(-10);
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
    
    if (avgResponseTime > 1000) {
      suggestions.push({
        category: 'Performance',
        priority: 'high',
        suggestion: 'Average response time is high. Consider database query optimization and adding indexes.',
        metric: `Average response: ${avgResponseTime.toFixed(0)}ms`,
      });
    }
    
    // Analyze error rates
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = errorCount / recentMetrics.length;
    
    if (errorRate > 0.05) {
      suggestions.push({
        category: 'Reliability',
        priority: 'critical',
        suggestion: 'High error rate detected. Review application logs and fix underlying issues.',
        metric: `Error rate: ${(errorRate * 100).toFixed(1)}%`,
      });
    }
    
    // General optimization suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        {
          category: 'Optimization',
          priority: 'low',
          suggestion: 'Consider implementing database connection pooling for better resource utilization.',
          metric: 'Preventive measure',
        },
        {
          category: 'Scaling',
          priority: 'low',
          suggestion: 'Monitor traffic patterns to identify optimal scaling triggers.',
          metric: 'Preventive measure',
        },
        {
          category: 'Security',
          priority: 'medium',
          suggestion: 'Ensure SSL/TLS certificates are up to date and implement rate limiting.',
          metric: 'Security best practice',
        }
      );
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      suggestions,
      metrics_summary: {
        cache_hit_rate: cacheMetrics.hitRate,
        average_response_time: avgResponseTime,
        error_rate: errorRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Optimization analysis failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as healthRoutes };