import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import { performanceMiddleware, memoryCheckMiddleware } from "./middleware/performance";
import { monitoringService } from "./services/monitoringService";
import { memoryLeakDetector } from "./services/memoryLeakDetector";

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Performance monitoring middleware
app.use(performanceMiddleware);

// Memory check middleware for critical endpoints
app.use(memoryCheckMiddleware);

// Session middleware (required by auth routes)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only when behind HTTPS
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Memory monitoring event handlers
monitoringService.on('memory-warning', (data) => {
  console.warn(`⚠️ Memory warning: ${data.level} - ${(data.usage * 100).toFixed(1)}% usage`);
});

monitoringService.on('memory-optimization-needed', async (data) => {
  console.log(`🔧 Proactive memory optimization needed: ${(data.usage * 100).toFixed(1)}% usage`);
  
  try {
    // Clear caches
    const { memoryCache } = await import('./services/simpleMemoryCache');
    memoryCache.clearAllCaches();
    console.log('✅ Caches cleared during proactive optimization');
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('✅ Garbage collection completed during proactive optimization');
    }
    
    // Small delay to allow cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const memUsage = process.memoryUsage();
    const newUsage = memUsage.heapUsed / memUsage.heapTotal;
    console.log(`📊 Memory after proactive optimization: ${(newUsage * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Proactive memory optimization failed:', error);
  }
});

monitoringService.on('performance-warning', (data) => {
  console.warn(`🐌 Performance warning: ${data.method} ${data.endpoint} - ${data.responseTime}ms`);
});

// Memory leak detection event handlers
memoryLeakDetector.on('leak-detected', (data) => {
  console.error(`🚨 MEMORY LEAK DETECTED: ${data.level.toUpperCase()} - ${data.changePercent.toFixed(1)}% increase`);
  console.error(`📊 Confidence: ${data.confidence.toFixed(1)}%`);
  console.error(`💡 Recommendations:`, data.recommendations);
  
  // If critical leak, consider triggering auto-restart
  if (data.level === 'critical' && data.changePercent > 20) {
    console.error(`🚨 Critical memory leak - consider immediate restart`);
  }
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite in development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    log(`📊 Memory monitoring active`);
    log(`🔄 Auto-restart service: ${process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled'}`);
  });
})();
