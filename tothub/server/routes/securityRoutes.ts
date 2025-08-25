import { Router } from 'express';
import { MFAService } from '../services/mfaService';
import { AuditService } from '../services/auditService';
import { ComplianceService } from '../services/complianceService';
import { createRateLimit, createAuditMiddleware } from '../middleware/security';

const router = Router();

// Rate limiting for security endpoints
const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts');
const mfaRateLimit = createRateLimit(15 * 60 * 1000, 10, 'Too many MFA attempts');

// Setup MFA
router.post('/mfa/setup', mfaRateLimit, createAuditMiddleware('mfa_setup'), async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const setup = MFAService.generateTOTPSetup(userId, 'TotHub');
    
    AuditService.logAuth(userId, 'LOGIN', true, req.ip || 'unknown', req.headers['user-agent'] || 'unknown');
    
    res.json({
      secret: setup.secret,
      qrCode: setup.qrCode,
      backupCodes: setup.backupCodes,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to setup MFA' });
  }
});

// Verify MFA
router.post('/mfa/verify', mfaRateLimit, createAuditMiddleware('mfa_verify'), async (req, res) => {
  try {
    const { userId, secret, token, method } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ error: 'User ID and token required' });
    }

    let isValid = false;
    
    if (method === 'totp' && secret) {
      isValid = MFAService.verifyTOTP(secret, token);
    } else if (method === 'backup') {
      // In production, get stored backup codes from database
      const storedCodes = ['ABCD-1234', 'EFGH-5678']; // Demo codes
      const usedCodes: string[] = [];
      isValid = MFAService.verifyBackupCode(storedCodes, token, usedCodes);
    }

    if (isValid) {
      const sessionToken = MFAService.generateMFASessionToken(userId, [method]);
      AuditService.logAuth(userId, 'LOGIN', true, req.ip || 'unknown', req.headers['user-agent'] || 'unknown');
      
      res.json({ 
        success: true, 
        sessionToken,
        message: 'MFA verification successful' 
      });
    } else {
      AuditService.logAuth(userId, 'FAILED_LOGIN', false, req.ip || 'unknown', req.headers['user-agent'] || 'unknown');
      res.status(401).json({ error: 'Invalid MFA token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'MFA verification failed' });
  }
});

// Get audit logs
router.get('/audit/logs', authRateLimit, createAuditMiddleware('audit_access'), async (req, res) => {
  try {
    const { userId, action, resource, startDate, endDate, riskLevel } = req.query;
    
    const filters: any = {};
    if (userId) filters.userId = userId as string;
    if (action) filters.action = action as string;
    if (resource) filters.resource = resource as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (riskLevel) filters.riskLevel = riskLevel as string;

    const logs = AuditService.getAuditLogs(filters);
    
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// Security report
router.get('/audit/report', authRateLimit, createAuditMiddleware('security_report'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const report = AuditService.generateSecurityReport(start, end);
    const suspiciousActivity = AuditService.detectSuspiciousActivity();
    
    res.json({ 
      report,
      suspiciousActivity: suspiciousActivity.length,
      period: { start, end }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate security report' });
  }
});

// Compliance check
router.get('/compliance/check', createAuditMiddleware('compliance_check'), async (req, res) => {
  try {
    const { dataType, userLocation } = req.query;
    
    if (!dataType) {
      return res.status(400).json({ error: 'Data type required' });
    }

    const requiresConsent = ComplianceService.requiresConsent(dataType as string, userLocation as string || 'US');
    const retentionPeriod = ComplianceService.getRetentionPeriod(dataType as string, userLocation as string || 'US');
    const hasRightToDelete = ComplianceService.hasRightToDelete(dataType as string, userLocation as string || 'US');
    const hasDataPortability = ComplianceService.hasDataPortabilityRight(dataType as string, userLocation as string || 'US');

    res.json({
      dataType,
      userLocation: userLocation || 'US',
      requiresConsent,
      retentionPeriod,
      hasRightToDelete,
      hasDataPortability,
    });
  } catch (error) {
    res.status(500).json({ error: 'Compliance check failed' });
  }
});

// Data deletion request (GDPR/CCPA)
router.post('/compliance/delete-request', authRateLimit, createAuditMiddleware('data_deletion_request'), async (req, res) => {
  try {
    const { userId, dataType, reason } = req.body;
    
    if (!userId || !dataType) {
      return res.status(400).json({ error: 'User ID and data type required' });
    }

    const userLocation = 'US'; // In production, get from user profile
    const hasRightToDelete = ComplianceService.hasRightToDelete(dataType, userLocation);
    
    if (!hasRightToDelete) {
      return res.status(403).json({ error: 'Data deletion not permitted for this data type' });
    }

    // In production, implement actual data deletion process
    AuditService.logCompliance(userId, 'data_deletion_request', dataType, true, req.ip || 'unknown', req.headers['user-agent'] || 'unknown', { reason });
    
    res.json({ 
      message: 'Data deletion request received',
      requestId: `DEL-${Date.now()}`,
      estimatedCompletionDays: 30 
    });
  } catch (error) {
    res.status(500).json({ error: 'Data deletion request failed' });
  }
});

// Data export request (GDPR/CCPA)
router.post('/compliance/export-request', authRateLimit, createAuditMiddleware('data_export_request'), async (req, res) => {
  try {
    const { userId, dataTypes } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const userLocation = 'US'; // In production, get from user profile
    const exportableTypes = (dataTypes || ['all']).filter((type: string) => 
      ComplianceService.hasDataPortabilityRight(type, userLocation)
    );

    // In production, implement actual data export process
    AuditService.logCompliance(userId, 'data_export_request', exportableTypes.join(','), true, req.ip || 'unknown', req.headers['user-agent'] || 'unknown');
    
    res.json({ 
      message: 'Data export request received',
      requestId: `EXP-${Date.now()}`,
      exportableTypes,
      estimatedCompletionDays: 7 
    });
  } catch (error) {
    res.status(500).json({ error: 'Data export request failed' });
  }
});

export default router;