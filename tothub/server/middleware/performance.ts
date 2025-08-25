import { Request, Response, NextFunction } from 'express';
import { monitoringService } from '../services/monitoringService';

export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Override end method to capture metrics
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): any {
    const responseTime = Date.now() - startTime;
    
    // Record performance metrics
    monitoringService.recordPerformanceMetrics(
      req.path,
      req.method,
      responseTime,
      res.statusCode
    );

    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
    }

    // Log very slow requests
    if (responseTime > 5000) {
      console.error(`🚨 Very slow request: ${req.method} ${req.path} - ${responseTime}ms`);
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
}

// Memory usage middleware for critical endpoints
export function memoryCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  const memUsage = process.memoryUsage();
  const heapUsagePercent = memUsage.heapUsed / memUsage.heapTotal;
  
  // Log memory usage for memory-intensive operations
  if (req.path.includes('/children') || req.path.includes('/attendance') || req.path.includes('/reports')) {
    console.log(`📊 Memory before ${req.method} ${req.path}: ${(heapUsagePercent * 100).toFixed(1)}% heap`);
    
    // Add memory usage to response headers for monitoring
    res.set('X-Memory-Usage', `${(heapUsagePercent * 100).toFixed(1)}%`);
  }
  
  next();
}
