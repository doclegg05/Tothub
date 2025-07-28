import { Router } from "express";
import { memoryCache } from "../services/simpleMemoryCache";
import { autoRestartService } from "../services/autoRestartService";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Memory monitoring endpoint
router.get("/memory-stats", auth, async (_req, res) => {
  const memUsage = process.memoryUsage();
  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };
  
  res.json({
    memory: {
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
      rss: formatBytes(memUsage.rss),
      external: formatBytes(memUsage.external),
      arrayBuffers: formatBytes(memUsage.arrayBuffers),
    },
    cache: memoryCache.getCacheStats(),
    uptime: process.uptime(),
  });
});

// Auto-restart service endpoints
router.get("/auto-restart/status", auth, async (_req, res) => {
  try {
    const status = autoRestartService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Auto-restart status error:', error);
    res.status(500).json({ message: "Failed to get auto-restart status" });
  }
});

router.post("/auto-restart/config", auth, async (req, res) => {
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

router.post("/auto-restart/restart", auth, async (_req, res) => {
  try {
    autoRestartService.forceRestart();
    res.json({ message: "Manual restart initiated" });
  } catch (error) {
    console.error('Manual restart error:', error);
    res.status(500).json({ message: "Failed to initiate manual restart" });
  }
});

export default router;