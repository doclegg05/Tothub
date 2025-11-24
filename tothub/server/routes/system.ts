import { Router, Request, Response } from "express";
import { memoryCache } from "../services/simpleMemoryCache";
import { autoRestartService } from "../services/autoRestartService";
import { monitoringService } from "../services/monitoringService";
import { memoryLeakDetector } from "../services/memoryLeakDetector";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Memory monitoring endpoint
router.get("/memory-stats", auth, async (_req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };
  
  const memorySummary = monitoringService.getMemorySummary();
  
  res.json({
    memory: {
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
      rss: formatBytes(memUsage.rss),
      external: formatBytes(memUsage.external),
      arrayBuffers: formatBytes(memUsage.arrayBuffers),
    },
    cache: memoryCache.getCacheStats(),
    monitoring: memorySummary,
    uptime: process.uptime(),
  });
});

// Detailed memory monitoring endpoint
router.get("/memory-details", auth, async (_req: Request, res: Response) => {
  try {
    const memoryHistory = monitoringService.getMemoryHistory();
    const performanceHistory = monitoringService.getPerformanceHistory();
    const memorySummary = monitoringService.getMemorySummary();
    
    res.json({
      summary: memorySummary,
      history: {
        memory: memoryHistory.slice(-20), // Last 20 measurements
        performance: performanceHistory.slice(-50) // Last 50 requests
      },
      trends: monitoringService.getMemoryTrends(),
      cacheStats: memoryCache.getCacheStats()
    });
  } catch (error) {
    console.error('Error getting memory details:', error);
    res.status(500).json({ message: "Failed to get memory details" });
  }
});

// Memory optimization endpoint
router.post("/memory/optimize", auth, async (_req: Request, res: Response) => {
  try {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('✅ Manual garbage collection completed');
    }
    
    // Clear all caches
    memoryCache.clearAllCaches();
    
    // Get updated memory stats
    const memUsage = process.memoryUsage();
    const formatBytes = (bytes: number) => {
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };
    
    res.json({
      message: "Memory optimization completed",
      memory: {
        heapUsed: formatBytes(memUsage.heapUsed),
        heapTotal: formatBytes(memUsage.heapTotal),
        rss: formatBytes(memUsage.rss),
      }
    });
  } catch (error) {
    console.error('Error optimizing memory:', error);
    res.status(500).json({ message: "Failed to optimize memory" });
  }
});

// Auto-restart service endpoints
router.get("/auto-restart/status", auth, async (_req: Request, res: Response) => {
  try {
    const status = autoRestartService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Auto-restart status error:', error);
    res.status(500).json({ message: "Failed to get auto-restart status" });
  }
});

router.post("/auto-restart/config", auth, async (req: Request, res: Response) => {
  try {
    const { memoryThreshold, checkInterval, cooldownPeriod, enabled } = req.body;
    
    const config: any = {};
    if (typeof memoryThreshold === 'number') config.memoryThreshold = memoryThreshold;
    if (typeof checkInterval === 'number') config.checkInterval = checkInterval;
    if (typeof cooldownPeriod === 'number') config.cooldownPeriod = cooldownPeriod;
    if (typeof enabled === 'boolean') config.enabled = enabled;
    
    autoRestartService.updateConfig(config);
    res.json({ message: "Auto-restart configuration updated", status: autoRestartService.getStatus() });
  } catch (error) {
    console.error('Auto-restart config error:', error);
    res.status(500).json({ message: "Failed to update auto-restart configuration" });
  }
});

router.post("/auto-restart/restart", auth, async (_req: Request, res: Response) => {
  try {
    autoRestartService.forceRestart();
    res.json({ message: "Manual restart initiated" });
  } catch (error) {
    console.error('Manual restart error:', error);
    res.status(500).json({ message: "Failed to initiate manual restart" });
  }
});

// Memory leak detection endpoint
router.get("/memory/leak-analysis", auth, async (_req: Request, res: Response) => {
  try {
    const leakAnalysis = memoryLeakDetector.analyzeLeaks();
    const growthRate = memoryLeakDetector.getMemoryGrowthRate();
    const patterns = memoryLeakDetector.getMemoryPatterns();
    
    res.json({
      leakAnalysis,
      growthRate,
      patterns,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing memory leaks:', error);
    res.status(500).json({ message: "Failed to analyze memory leaks" });
  }
});

// Memory leak detection endpoint
router.post("/memory/leak-analysis", auth, async (_req: Request, res: Response) => {
  try {
    const leakAnalysis = memoryLeakDetector.analyzeLeaks();
    const growthRate = memoryLeakDetector.getMemoryGrowthRate();
    const patterns = memoryLeakDetector.getMemoryPatterns();
    
    res.json({
      leakAnalysis,
      growthRate,
      patterns,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing memory leaks:', error);
    res.status(500).json({ message: "Failed to analyze memory leaks" });
  }
});

export default router;