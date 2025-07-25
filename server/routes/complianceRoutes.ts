import { Router } from 'express';
import { RegulatoryComplianceService } from '../services/regulatoryComplianceService';
import { AccessibilityService } from '../services/accessibilityService';
import { AuditService } from '../services/auditService';
import { createRateLimit, createAuditMiddleware } from '../middleware/security';

const router = Router();

// Rate limiting for compliance endpoints
const complianceRateLimit = createRateLimit(15 * 60 * 1000, 10, 'Too many compliance requests');

// Check state ratio compliance
router.get('/ratios/check', complianceRateLimit, createAuditMiddleware('ratio_compliance_check'), async (req, res) => {
  try {
    const { state, ageGroup, childCount, staffCount } = req.query;
    
    if (!state || !ageGroup || !childCount || !staffCount) {
      return res.status(400).json({ 
        error: 'State, age group, child count, and staff count required' 
      });
    }

    const compliance = RegulatoryComplianceService.checkRatioCompliance(
      state as string,
      ageGroup as string,
      parseInt(childCount as string),
      parseInt(staffCount as string)
    );

    AuditService.logCompliance(
      req.session?.userId || 'anonymous',
      'ratio_compliance_check',
      `${state}_${ageGroup}`,
      compliance.compliant,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
      { ...compliance }
    );

    res.json(compliance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check ratio compliance' });
  }
});

// Get qualification requirements for state/age group
router.get('/qualifications/:state/:ageGroup', complianceRateLimit, async (req, res) => {
  try {
    const { state, ageGroup } = req.params;
    
    const requirements = RegulatoryComplianceService.getQualificationRequirements(state, ageGroup);
    
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get qualification requirements' });
  }
});

// Validate FLSA compliance for payroll
router.post('/flsa/validate', complianceRateLimit, createAuditMiddleware('flsa_validation'), async (req, res) => {
  try {
    const { hoursWorked, hourlyRate, state } = req.body;
    
    if (!hoursWorked || !hourlyRate || !state) {
      return res.status(400).json({ 
        error: 'Hours worked, hourly rate, and state required' 
      });
    }

    const compliance = RegulatoryComplianceService.validateFLSACompliance(
      hoursWorked,
      hourlyRate,
      state
    );

    AuditService.logCompliance(
      req.session?.userId || 'system',
      'flsa_compliance_check',
      'payroll',
      compliance.compliant,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
      { hoursWorked, hourlyRate, state, ...compliance }
    );

    res.json(compliance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate FLSA compliance' });
  }
});

// Validate physical security UL 294 compliance
router.post('/physical-security/validate', complianceRateLimit, createAuditMiddleware('ul294_validation'), async (req, res) => {
  try {
    const { deviceConfig } = req.body;
    
    if (!deviceConfig) {
      return res.status(400).json({ error: 'Device configuration required' });
    }

    const compliance = RegulatoryComplianceService.validatePhysicalSecurityCompliance(deviceConfig);

    AuditService.logCompliance(
      req.session?.userId || 'system',
      'ul294_compliance_check',
      'physical_security',
      compliance.compliant,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
      { deviceId: deviceConfig.id, ...compliance }
    );

    res.json(compliance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate physical security compliance' });
  }
});

// Validate background checks
router.post('/background-checks/validate', complianceRateLimit, createAuditMiddleware('background_check_validation'), async (req, res) => {
  try {
    const { state, staffMember } = req.body;
    
    if (!state || !staffMember) {
      return res.status(400).json({ error: 'State and staff member data required' });
    }

    const validation = RegulatoryComplianceService.validateBackgroundChecks(state, staffMember);

    AuditService.logCompliance(
      req.session?.userId || 'system',
      'background_check_validation',
      'staff_compliance',
      validation.compliant,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
      { staffId: staffMember.id, state, ...validation }
    );

    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate background checks' });
  }
});

// Generate comprehensive compliance report
router.post('/report/generate', complianceRateLimit, createAuditMiddleware('compliance_report_generation'), async (req, res) => {
  try {
    const { facilityData } = req.body;
    
    if (!facilityData) {
      return res.status(400).json({ error: 'Facility data required' });
    }

    const report = RegulatoryComplianceService.generateComplianceReport(facilityData);

    AuditService.logCompliance(
      req.session?.userId || 'system',
      'compliance_report_generated',
      'facility_wide',
      true,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
      { facilityId: facilityData.id, overallCompliance: report.overallCompliance }
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
});

// Get emergency procedures for state
router.get('/emergency-procedures/:state', complianceRateLimit, async (req, res) => {
  try {
    const { state } = req.params;
    
    const procedures = RegulatoryComplianceService.getEmergencyProcedures(state);
    
    res.json(procedures);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get emergency procedures' });
  }
});

// Accessibility audit
router.post('/accessibility/audit', complianceRateLimit, createAuditMiddleware('accessibility_audit'), async (req, res) => {
  try {
    const { applicationData } = req.body;
    
    if (!applicationData) {
      return res.status(400).json({ error: 'Application data required for audit' });
    }

    const audit = AccessibilityService.performAccessibilityAudit(applicationData);

    AuditService.logCompliance(
      req.session?.userId || 'system',
      'accessibility_audit_performed',
      'wcag_compliance',
      audit.compliant,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
      { wcagLevel: audit.wcagLevel, violationCount: audit.violations.length }
    );

    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform accessibility audit' });
  }
});

// Check color contrast compliance
router.post('/accessibility/color-contrast', complianceRateLimit, async (req, res) => {
  try {
    const { foreground, background, fontSize, isBold } = req.body;
    
    if (!foreground || !background || fontSize === undefined) {
      return res.status(400).json({ 
        error: 'Foreground color, background color, and font size required' 
      });
    }

    const contrast = AccessibilityService.checkColorContrast(
      foreground,
      background,
      fontSize,
      isBold || false
    );

    res.json(contrast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check color contrast' });
  }
});

// Get accessibility recommendations
router.get('/accessibility/recommendations', complianceRateLimit, async (req, res) => {
  try {
    const recommendations = AccessibilityService.getDaycareAccessibilityRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get accessibility recommendations' });
  }
});

// Generate accessibility testing checklist
router.get('/accessibility/testing-checklist', complianceRateLimit, async (req, res) => {
  try {
    const checklist = AccessibilityService.generateTestingChecklist();
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate testing checklist' });
  }
});

// Get state-specific regulations summary
router.get('/regulations/:state', complianceRateLimit, async (req, res) => {
  try {
    const { state } = req.params;
    
    // This would typically pull from a comprehensive state regulations database
    const regulations = {
      state,
      lastUpdated: new Date().toISOString(),
      ratioRequirements: RegulatoryComplianceService.checkRatioCompliance(state, 'infant', 4, 1),
      emergencyProcedures: RegulatoryComplianceService.getEmergencyProcedures(state),
      qualificationSample: RegulatoryComplianceService.getQualificationRequirements(state, 'preschool'),
    };

    res.json(regulations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get state regulations' });
  }
});

export default router;