import { Router, Request, Response } from 'express';
import { RegulatoryComplianceService } from '../services/regulatoryComplianceService';
import { AccessibilityService } from '../services/accessibilityService';
import { AuditService } from '../services/auditService';
import { createRateLimit, createAuditMiddleware } from '../middleware/security';
import { ComplianceRulesEngine } from '../compliance/rules_engine';
import type { paths } from '../../shared/openapi-types';

const router = Router();

// Rate limiting for compliance endpoints
const complianceRateLimit = createRateLimit(15 * 60 * 1000, 10, 'Too many compliance requests');

// Check state ratio compliance
router.get('/ratios/check', complianceRateLimit, createAuditMiddleware('ratio_compliance_check'), async (req: Request, res: Response) => {
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
router.get('/qualifications/:state/:ageGroup', complianceRateLimit, async (req: Request, res: Response) => {
  try {
    const { state, ageGroup } = req.params;
    
    const requirements = await RegulatoryComplianceService.getQualificationRequirements(state, ageGroup);
    
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get qualification requirements' });
  }
});

// Validate FLSA compliance for payroll
router.post('/flsa/validate', complianceRateLimit, createAuditMiddleware('flsa_validation'), async (req: Request, res: Response) => {
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
router.post('/physical-security/validate', complianceRateLimit, createAuditMiddleware('ul294_validation'), async (req: Request, res: Response) => {
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
router.post('/background-checks/validate', complianceRateLimit, createAuditMiddleware('background_check_validation'), async (req: Request, res: Response) => {
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
router.post('/report/generate', complianceRateLimit, createAuditMiddleware('compliance_report_generation'), async (req: Request, res: Response) => {
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
router.get('/emergency-procedures/:state', complianceRateLimit, async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    
    const procedures = RegulatoryComplianceService.getEmergencyProcedures(state);
    
    res.json(procedures);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get emergency procedures' });
  }
});

// Accessibility audit
router.post('/accessibility/audit', complianceRateLimit, createAuditMiddleware('accessibility_audit'), async (req: Request, res: Response) => {
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
router.post('/accessibility/color-contrast', complianceRateLimit, async (req: Request, res: Response) => {
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
router.get('/accessibility/recommendations', complianceRateLimit, async (req: Request, res: Response) => {
  try {
    const recommendations = AccessibilityService.getDaycareAccessibilityRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get accessibility recommendations' });
  }
});

// Generate accessibility testing checklist
router.get('/accessibility/testing-checklist', complianceRateLimit, async (req: Request, res: Response) => {
  try {
    const checklist = AccessibilityService.generateTestingChecklist();
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate testing checklist' });
  }
});

// Get state-specific regulations summary
router.get('/regulations/:state', complianceRateLimit, async (req: Request, res: Response) => {
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

// Initialize the compliance rules engine
const rulesEngine = new ComplianceRulesEngine();

// Type definitions based on your OpenAPI spec
type ComplianceRoomRequest = paths['/compliance/check']['post']['requestBody']['content']['application/json'];
type ComplianceRoomResponse = paths['/compliance/check']['post']['responses']['200']['content']['application/json'];

/**
 * Check room compliance with state regulations using the rules engine
 * POST /v1/compliance/check
 */
router.post('/v1/compliance/check', complianceRateLimit, createAuditMiddleware('room_compliance_check'), async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      state: string;
      room: {
        id: string;
        staffCount: number;
        children: Array<{ childId: string; birthDate: string }>;
      };
      children: Array<{ childId: string; birthDate: string }>;
      staff: Array<{
        id: string;
        position: string;
        education: string;
        experience: string;
        certifications: string[];
      }>;
    };
    
    // Validate required fields
    if (!body.state || !body.room || !body.children || !body.staff) {
      return res.status(400).json({
        error: "Missing required fields: state, room, children, staff"
      });
    }

    // Check if ruleset exists for the state
    const availableStates = rulesEngine.getAvailableStates();
    if (!availableStates.includes(body.state)) {
      return res.status(400).json({
        error: `No compliance ruleset found for state: ${body.state}`,
        availableStates
      });
    }

    // Evaluate room compliance
    const result = rulesEngine.checkRoomCompliance(
      body.state,
      {
        ...body.room,
        name: `Room ${body.room.id}`,
        tenantId: 'tenant-1'
      },
      body.children.map(child => ({
        id: child.childId,
        firstName: 'Child',
        lastName: child.childId,
        dateOfBirth: child.birthDate,
        roomId: 'default',
        tenantId: 'tenant-1',
        isActive: true,
        enrollmentDate: new Date().toISOString().split('T')[0]
      })),
      body.staff.map(staffMember => ({
        id: staffMember.id,
        firstName: 'Staff',
        lastName: staffMember.id,
        position: staffMember.position,
        qualifications: [staffMember.education],
        experienceYears: parseInt(staffMember.experience) || 0,
        certifications: staffMember.certifications,
        roomId: 'default',
        tenantId: 'tenant-1',
        isActive: true
      }))
    );

    const response: ComplianceRoomResponse = {
      roomId: body.room.id,
      state: body.state,
      compliant: result.isCompliant,
      violations: result.violations.map(v => ({
        type: v.type === 'operating_hours' ? 'facility' : v.type,
        severity: v.severity,
        message: v.message,
        roomId: v.roomId,
        staffId: v.staffId,
        details: v.details || {}
      })),
      warnings: result.warnings.map(w => ({
        type: w.type === 'capacity_warning' ? 'facility_warning' : w.type,
        message: w.message,
        roomId: w.roomId,
        staffId: w.staffId,
        details: w.details || {}
      })),
      complianceScore: result.score,
      recommendations: result.recommendations || [],
      timestamp: new Date().toISOString()
    };

    // Audit the compliance check
    AuditService.logCompliance(
      req.session?.userId || 'system',
      'room_compliance_check',
      `${body.state}_${body.room.id}`,
      result.isCompliant,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
      { state: body.state, roomId: body.room.id, complianceScore: result.score }
    );

    res.json(response);
  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(500).json({
      error: "Internal server error during compliance check",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Get available states with compliance rulesets
 * GET /v1/compliance/states
 */
router.get('/v1/compliance/states', complianceRateLimit, async (req: Request, res: Response) => {
  try {
    const states = rulesEngine.getAvailableStates();
    res.json({
      states,
      count: states.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting available states:', error);
    res.status(500).json({
      error: "Internal server error while fetching states"
    });
  }
});

/**
 * Get compliance summary for multiple rooms
 * POST /v1/compliance/summary
 */
router.post('/v1/compliance/summary', complianceRateLimit, createAuditMiddleware('compliance_summary'), async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      state: string;
      rooms: Array<{
        id: string;
        staffCount: number;
        children: Array<{ childId: string; birthDate: string }>;
      }>;
      children: Array<{ childId: string; birthDate: string }>;
      staff: Array<{
        id: string;
        position: string;
        education: string;
        experience: string;
        certifications: string[];
      }>;
    };

    if (!body.state || !body.rooms || !body.staff) {
      return res.status(400).json({
        error: "Missing required fields: state, rooms, staff"
      });
    }

    // Check if ruleset exists for the state
    const availableStates = rulesEngine.getAvailableStates();
    if (!availableStates.includes(body.state)) {
      return res.status(400).json({
        error: `No compliance ruleset found for state: ${body.state}`,
        availableStates
      });
    }

    // Get overall compliance summary
    const summary = rulesEngine.getComplianceSummary(
      body.state,
      body.rooms.map(room => ({
        id: room.id,
        name: `Room ${room.id}`,
        tenantId: 'tenant-1'
      })),
      body.children.map(child => ({
        id: child.childId,
        firstName: 'Child',
        lastName: child.childId,
        dateOfBirth: child.birthDate,
        roomId: 'default',
        tenantId: 'tenant-1',
        isActive: true,
        enrollmentDate: new Date().toISOString().split('T')[0]
      })),
      body.staff.map(staffMember => ({
        id: staffMember.id,
        firstName: 'Staff',
        lastName: staffMember.id,
        position: staffMember.position,
        qualifications: [staffMember.education],
        experienceYears: parseInt(staffMember.experience) || 0,
        certifications: staffMember.certifications,
        roomId: 'default',
        tenantId: 'tenant-1',
        isActive: true
      }))
    );

    // Audit the compliance summary request
    AuditService.logCompliance(
      req.session?.userId || 'system',
      'compliance_summary_requested',
      body.state,
      summary.overallScore >= 80,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
      { 
        state: body.state, 
        roomCount: body.rooms.length,
        overallScore: summary.overallScore 
      }
    );

    res.json({
      state: body.state,
      overallScore: summary.overallScore,
      compliantRooms: summary.compliantRooms,
      totalRooms: summary.totalRooms,
      criticalViolations: summary.criticalViolations,
      roomResults: Object.fromEntries(summary.roomResults),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Compliance summary error:', error);
    res.status(500).json({
      error: "Internal server error during compliance summary generation",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Validate a compliance ruleset
 * POST /v1/compliance/validate-ruleset
 */
router.post('/v1/compliance/validate-ruleset', complianceRateLimit, createAuditMiddleware('ruleset_validation'), async (req: Request, res: Response) => {
  try {
    const ruleset = req.body;
    
    if (!ruleset || typeof ruleset !== 'object') {
      return res.status(400).json({
        error: "Invalid ruleset data"
      });
    }

    const validation = rulesEngine.validateRuleset(ruleset);
    
    // Audit the ruleset validation
    AuditService.logCompliance(
      req.session?.userId || 'system',
      'ruleset_validation',
      'compliance_ruleset',
      validation.isValid,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
      { 
        isValid: validation.isValid, 
        errorCount: validation.errors.length 
      }
    );

    res.json({
      isValid: validation.isValid,
      errors: validation.errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ruleset validation error:', error);
    res.status(500).json({
      error: "Internal server error during ruleset validation",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;