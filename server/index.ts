import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import securityRoutes from "./routes/securityRoutes";
import complianceRoutes from "./routes/complianceRoutes";
import safetyRoutes from "./routes/safetyRoutes";
import documentRoutes from "./routes/documentRoutes";
import authRoutes from "./routes/authRoutes";
import hardwareRoutes from "./routes/hardwareRoutes";
import { healthRoutes } from "./routes/healthRoutes";
import performanceRoutes from "./routes/performanceRoutes";
import jobRoutes from "./routes/jobRoutes";
import alertRoutes from "./routes/alertRoutes";
import { securityHeaders, validateInput, generateCSRFToken } from "./middleware/security";
import { authMiddleware } from "./middleware/auth";
import { MonitoringService } from "./services/monitoringService";
import { CachingService } from "./services/cachingService";
import { pool } from "./db";
import { compressionMiddleware } from "./middleware/compression";

const app = express();

// Initialize monitoring and caching services
const monitoringService = MonitoringService.getInstance();
const cachingService = CachingService.getInstance();

// Import memory utils
import { runGarbageCollection, getMemoryUsageReport } from "./utils/memoryUtils";

// Compression middleware (should be early in the chain)
app.use(compressionMiddleware);

// Monitoring middleware
app.use(monitoringService.performanceMiddleware());

// Memory usage endpoint
app.get('/api/memory-status', (req: Request, res: Response) => {
  const memoryReport = getMemoryUsageReport();
  res.json(memoryReport);
});

// Periodic memory cleanup
setInterval(() => {
  runGarbageCollection();
  const memoryReport = getMemoryUsageReport();
  if (parseFloat(memoryReport.percentUsed) > 70) {
    console.log('⚠️ High memory usage detected:', memoryReport);
  }
}, 60 * 1000); // Every minute

// Configure session middleware
const PgStore = pgSession(session);
app.use(session({
  store: new PgStore({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'daycare-session-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    sameSite: 'lax',
  },
  name: 'tothub.sid',
}));

// Security middleware
app.use(securityHeaders);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(validateInput);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize cron jobs
  try {
    const { initializeAllCronJobs } = await import('./services/cronJobs');
    initializeAllCronJobs();
  } catch (error) {
    console.error('Failed to initialize cron jobs:', error);
  }
  
  // Health and infrastructure routes
  app.use('/api', healthRoutes);
  
  // Authentication routes (no auth required)
  app.use('/api/auth', authRoutes);
  
  // Session routes (requires auth)
  const sessionRoutes = (await import('./routes/sessionRoutes')).default;
  app.use('/api/sessions', sessionRoutes);
  
  // Apply auth middleware to all other API routes
  app.use('/api', authMiddleware);
  
  // Security and compliance routes
  app.use('/api/security', securityRoutes);
  app.use('/api/compliance', complianceRoutes);
  app.use('/api/safety', safetyRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/hardware', hardwareRoutes);
  app.use('/api/performance', performanceRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/alerts', alertRoutes);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
