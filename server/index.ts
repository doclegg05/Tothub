import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Response, type Request } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { compressionMiddleware } from "./middleware/compression";
import {
  createRateLimit,
  csrfProtection,
  generateCSRFToken,
  securityHeaders,
  validateInput,
} from "./middleware/security";
import { registerRoutes } from "./routes";
import { MonitoringService } from "./services/monitoringService";
import { log, serveStatic, setupVite } from "./vite";

const app = express();

// Trust proxy in production (needed for secure cookies behind proxies)
if (app.get("env") !== "development") {
  app.set("trust proxy", 1);
}

// CORS configuration (comma-separated list in CORS_ORIGIN)
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Security headers and compression
app.use(securityHeaders);
app.use(compressionMiddleware);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Sessions (MemoryStore for dev; use a persistent store in production)
const MemoryStore = createMemoryStore(session);
const SESSION_SECRET = process.env.SESSION_SECRET || "CHANGE_ME_SESSION_SECRET";
if (
  app.get("env") !== "development" &&
  SESSION_SECRET === "CHANGE_ME_SESSION_SECRET"
) {
  log("WARNING: SESSION_SECRET is not set in production", "security");
}
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: app.get("env") !== "development",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
    store: new MemoryStore({ checkPeriod: 1000 * 60 * 60 }),
  })
);

// Input sanitization
app.use(validateInput);

// CSRF token generation for GETs; protection for modifying requests
app.use(generateCSRFToken);
app.use("/api", csrfProtection);

// Global API rate limit
app.use("/api", createRateLimit(15 * 60 * 1000, 300, "Too many requests"));

// Performance monitoring middleware
app.use(MonitoringService.getInstance().performanceMiddleware());

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

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();

// Optional periodic memory logger for diagnostics (disabled by default)
if (process.env.MEMORY_LOG_INTERVAL_MS) {
  const every = parseInt(process.env.MEMORY_LOG_INTERVAL_MS, 10);
  if (!Number.isNaN(every) && every > 0) {
    setInterval(() => {
      const used = process.memoryUsage();
      log(
        `heapUsed=${Math.round(
          used.heapUsed / 1024 / 1024
        )}MB heapTotal=${Math.round(
          used.heapTotal / 1024 / 1024
        )}MB rss=${Math.round(used.rss / 1024 / 1024)}MB`,
        "memory"
      );
    }, every).unref();
  }
}
