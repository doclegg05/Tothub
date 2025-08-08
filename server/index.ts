import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import securityRoutes from "./routes/securityRoutes";
import complianceRoutes from "./routes/complianceRoutes";
import safetyRoutes from "./routes/safetyRoutes";
import documentRoutes from "./routes/documentRoutes";
import { healthRoutes } from "./routes/healthRoutes";
import { securityHeaders, validateInput, generateCSRFToken } from "./middleware/security";
import { MonitoringService } from "./services/monitoringService";
import { CachingService } from "./services/cachingService";

const app = express();

// Initialize monitoring and caching services
const monitoringService = MonitoringService.getInstance();
const cachingService = CachingService.getInstance();

// Monitoring middleware
app.use(monitoringService.performanceMiddleware());

// Security middleware
app.use(securityHeaders);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(validateInput);
// Note: CSRF protection temporarily disabled until session middleware is properly configured

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
  // Health and infrastructure routes
  app.use('/api', healthRoutes);
  
  // Security and compliance routes
  app.use('/api/security', securityRoutes);
  app.use('/api/compliance', complianceRoutes);
  app.use('/api/safety', safetyRoutes);
  app.use('/api/documents', documentRoutes);
  
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
