import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

// Extend Express Request type to include session
declare module "express-serve-static-core" {
  interface Request {
    session?: {
      csrfToken?: string;
      userId?: string;
      [key: string]: any;
    };
  }
}

// Rate limiting middleware
export const createRateLimit = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Input validation and sanitization
export const validateInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Sanitize all string inputs to prevent XSS
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === "string") {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

// CSRF protection
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === "GET") {
    return next();
  }

  const token = req.headers["x-csrf-token"] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  next();
};

// Generate CSRF token
export const generateCSRFToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session) {
    req.session = {};
  }
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Security headers - COMPLETELY DISABLED FOR DEBUGGING
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Disable CSP entirely
  hsts: false, // Disable HSTS for development
  crossOriginEmbedderPolicy: false,
});

// API key validation
export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  // Validate API key format and against database
  if (typeof apiKey !== "string" || apiKey.length < 32) {
    return res.status(401).json({ error: "Invalid API key format" });
  }

  // TODO: Validate against database of valid API keys
  next();
};

// Biometric data encryption utilities
export class BiometricSecurity {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16; // 128 bits - standard for GCM

  static encryptBiometricData(
    data: string,
    key: Buffer
  ): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from("biometric-data"));

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  static decryptBiometricData(
    encryptedData: { encrypted: string; iv: string; tag: string },
    key: Buffer
  ): string {
    const iv = Buffer.from(encryptedData.iv, "hex");
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv, {
      authTagLength: this.AUTH_TAG_LENGTH,
    });
    decipher.setAAD(Buffer.from("biometric-data"));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));

    let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  static hashBiometricTemplate(template: Float32Array): string {
    const buffer = Buffer.from(template.buffer);
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }
}

// Audit logging
export const auditLog = (action: string, userId?: string, details?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    ip: "request-ip", // Will be filled by middleware
    userAgent: "request-user-agent",
  };

  // TODO: Store in secure audit log database
  console.log("[AUDIT]", JSON.stringify(logEntry));
};

// Audit middleware
export const createAuditMiddleware = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    res.json = function (body: any) {
      auditLog(action, req.session?.userId, {
        path: req.path,
        method: req.method,
        success: res.statusCode < 400,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
      return originalSend.call(this, body);
    };
    next();
  };
};
