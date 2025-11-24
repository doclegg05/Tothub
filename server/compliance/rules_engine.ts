import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Types for compliance rules engine
 */
export interface AgeGroup {
  name: string;
  minAge: number;
  maxAge: number;
  unit: 'months' | 'years';
  description?: string;
}

export interface RatioRule {
  ageGroup: string;
  maxRatio: string;
  maxGroupSize: number;
  notes?: string;
  exceptions?: RatioException[];
}

export interface RatioException {
  condition: string;
  modifiedRatio: string;
  modifiedGroupSize: number;
}

export interface StaffQualification {
  position: string;
  requiredEducation: string;
  requiredExperience?: string;
  requiredCertifications: string[];
  notes?: string;
}

export interface ComplianceRuleset {
  state: string;
  version: string;
  effectiveDate: string;
  lastUpdated?: string;
  source?: string;
  rules: {
    ageGroups: AgeGroup[];
    ratios: RatioRule[];
    staffQualifications: StaffQualification[];
    facilityRequirements?: any;
    operatingHours?: any;
    specialNeeds?: any;
  };
  metadata?: {
    createdBy?: string;
    reviewedBy?: string;
    approvalStatus?: string;
    tags?: string[];
    notes?: string;
  };
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  roomId: string;
  tenantId: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  qualifications: string[];
  certifications: string[];
  experienceYears: number;
  roomId: string;
  tenantId: string;
}

export interface Room {
  id: string;
  name: string;
  tenantId: string;
}

export interface ComplianceCheckResult {
  isCompliant: boolean;
  score: number;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  recommendations: string[];
}

export interface ComplianceViolation {
  type: 'ratio' | 'qualification' | 'facility' | 'operating_hours';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  roomId?: string;
  staffId?: string;
  childId?: string;
  details: any;
}

export interface ComplianceWarning {
  type: 'ratio_warning' | 'qualification_warning' | 'capacity_warning';
  message: string;
  roomId?: string;
  staffId?: string;
  details: any;
}

export interface RatioCheckResult {
  isCompliant: boolean;
  currentRatio: string;
  maxRatio: string;
  currentStaff: number;
  currentChildren: number;
  violations: string[];
  warnings: string[];
}

/**
 * TotHub Compliance Rules Engine
 * Evaluates real-time compliance against state-specific rules
 */
export class ComplianceRulesEngine {
  private rulesets: Map<string, ComplianceRuleset> = new Map();
  private rulesetPath: string;

  constructor(rulesetPath: string = join(__dirname, 'rulesets')) {
    this.rulesetPath = rulesetPath;
    this.loadRulesets();
  }

  /**
   * Load all available rulesets from the ruleset directory
   */
  private loadRulesets(): void {
    try {
      // Load WV ruleset as example
      const wvRuleset = this.loadRuleset('WV');
      if (wvRuleset) {
        this.rulesets.set('WV', wvRuleset);
      }
    } catch (error) {
      console.error('Error loading rulesets:', error);
    }
  }

  /**
   * Load a specific state ruleset
   */
  private loadRuleset(state: string): ComplianceRuleset | null {
    try {
      const filePath = join(this.rulesetPath, `ruleset.${state}-2025.08.json`);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as ComplianceRuleset;
      }
    } catch (error) {
      console.error(`Error loading ruleset for ${state}:`, error);
    }
    return null;
  }

  /**
   * Get available states
   */
  getAvailableStates(): string[] {
    return Array.from(this.rulesets.keys());
  }

  /**
   * Check room compliance for a specific state
   */
  checkRoomCompliance(
    state: string,
    room: Room,
    children: Child[],
    staff: Staff[]
  ): ComplianceCheckResult {
    const ruleset = this.rulesets.get(state);
    if (!ruleset) {
      throw new Error(`No ruleset found for state: ${state}`);
    }

    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    const recommendations: string[] = [];

    // Check ratios
    const ratioResult = this.checkRoomRatios(ruleset, room, children, staff);
    if (!ratioResult.isCompliant) {
      violations.push({
        type: 'ratio',
        severity: 'high',
        message: `Room ${room.name} violates staff-to-child ratio requirements`,
        roomId: room.id,
        details: ratioResult
      });
    }

    // Check staff qualifications
    const qualificationResults = this.checkStaffQualifications(ruleset, staff);
    qualificationResults.violations.forEach(violation => {
      violations.push({
        type: 'qualification',
        severity: 'medium',
        message: violation.message,
        staffId: violation.staffId,
        roomId: violation.roomId,
        details: violation
      });
    });

    // Calculate compliance score
    const score = this.calculateComplianceScore(violations, warnings, children.length, staff.length);

    // Generate recommendations
    if (ratioResult.violations.length > 0) {
      recommendations.push('Add qualified staff to maintain proper ratios');
    }
    if (qualificationResults.violations.length > 0) {
      recommendations.push('Ensure all staff meet minimum qualification requirements');
    }

    return {
      isCompliant: violations.length === 0,
      score,
      violations,
      warnings,
      recommendations
    };
  }

  /**
   * Check staff-to-child ratios for a room
   */
  private checkRoomRatios(
    ruleset: ComplianceRuleset,
    room: Room,
    children: Child[],
    staff: Staff[]
  ): RatioCheckResult {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Group children by age
    const childrenByAge = this.groupChildrenByAge(ruleset, children);
    
    // Check ratios for each age group
    for (const [ageGroup, childrenInGroup] of childrenByAge) {
      const ratioRule = ruleset.rules.ratios.find(r => r.ageGroup === ageGroup);
      if (!ratioRule) continue;

      const requiredStaff = this.calculateRequiredStaff(ratioRule.maxRatio, childrenInGroup.length);
      
      if (staff.length < requiredStaff) {
        violations.push(
          `${ageGroup} group needs ${requiredStaff} staff, but only ${staff.length} present`
        );
      } else if (staff.length === requiredStaff) {
        warnings.push(
          `${ageGroup} group is at minimum staffing level`
        );
      }
    }

    // Check overall room capacity
    const totalChildren = children.length;
    const maxGroupSize = Math.max(...ruleset.rules.ratios.map(r => r.maxGroupSize));
    
    if (totalChildren > maxGroupSize) {
      violations.push(`Room exceeds maximum group size of ${maxGroupSize}`);
    }

    const currentRatio = `${staff.length}:${totalChildren}`;
    const isCompliant = violations.length === 0;

    return {
      isCompliant,
      currentRatio,
      maxRatio: 'varies by age group',
      currentStaff: staff.length,
      currentChildren: totalChildren,
      violations,
      warnings
    };
  }

  /**
   * Check staff qualifications against state requirements
   */
  private checkStaffQualifications(
    ruleset: ComplianceRuleset,
    staff: Staff[]
  ): { violations: any[]; warnings: any[] } {
    const violations: any[] = [];
    const warnings: any[] = [];

    for (const staffMember of staff) {
      const requirement = ruleset.rules.staffQualifications.find(
        r => r.position === staffMember.position
      );

      if (!requirement) {
        warnings.push({
          message: `No qualification requirements defined for position: ${staffMember.position}`,
          staffId: staffMember.id,
          roomId: staffMember.roomId
        });
        continue;
      }

      // Check education level (simplified check)
      if (requirement.requiredEducation && !this.meetsEducationRequirement(staffMember, requirement)) {
        violations.push({
          message: `${staffMember.firstName} ${staffMember.lastName} does not meet education requirements for ${staffMember.position}`,
          staffId: staffMember.id,
          roomId: staffMember.roomId,
          details: {
            required: requirement.requiredEducation,
            current: staffMember.qualifications
          }
        });
      }

      // Check certifications
      const missingCertifications = requirement.requiredCertifications.filter(
        cert => !staffMember.certifications.includes(cert)
      );

      if (missingCertifications.length > 0) {
        violations.push({
          message: `${staffMember.firstName} ${staffMember.lastName} missing required certifications: ${missingCertifications.join(', ')}`,
          staffId: staffMember.id,
          roomId: staffMember.roomId,
          details: {
            missing: missingCertifications,
            current: staffMember.certifications
          }
        });
      }

      // Check experience
      if (requirement.requiredExperience && staffMember.experienceYears < this.parseExperienceRequirement(requirement.requiredExperience)) {
        violations.push({
          message: `${staffMember.firstName} ${staffMember.lastName} does not meet experience requirements for ${staffMember.position}`,
          staffId: staffMember.id,
          roomId: staffMember.roomId,
          details: {
            required: requirement.requiredExperience,
            current: `${staffMember.experienceYears} years`
          }
        });
      }
    }

    return { violations, warnings };
  }

  /**
   * Group children by age based on ruleset age groups
   */
  private groupChildrenByAge(ruleset: ComplianceRuleset, children: Child[]): Map<string, Child[]> {
    const groups = new Map<string, Child[]>();
    
    for (const child of children) {
      const ageInMonths = this.calculateAgeInMonths(child.dateOfBirth);
      const ageGroup = this.findAgeGroup(ruleset, ageInMonths);
      
      if (ageGroup) {
        if (!groups.has(ageGroup.name)) {
          groups.set(ageGroup.name, []);
        }
        groups.get(ageGroup.name)!.push(child);
      }
    }

    return groups;
  }

  /**
   * Calculate age in months from date of birth
   */
  private calculateAgeInMonths(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.44); // Approximate months
  }

  /**
   * Find age group for a given age in months
   */
  private findAgeGroup(ruleset: ComplianceRuleset, ageInMonths: number): AgeGroup | null {
    for (const ageGroup of ruleset.rules.ageGroups) {
      if (ageGroup.unit === 'months') {
        if (ageInMonths >= ageGroup.minAge && ageInMonths < ageGroup.maxAge) {
          return ageGroup;
        }
      } else if (ageGroup.unit === 'years') {
        const ageInYears = ageInMonths / 12;
        if (ageInYears >= ageGroup.minAge && ageInYears < ageGroup.maxAge) {
          return ageGroup;
        }
      }
    }
    return null;
  }

  /**
   * Calculate required staff based on ratio string (e.g., "1:4")
   */
  private calculateRequiredStaff(ratio: string, childCount: number): number {
    const [staff, children] = ratio.split(':').map(Number);
    return Math.ceil(childCount / children) * staff;
  }

  /**
   * Check if staff member meets education requirements
   */
  private meetsEducationRequirement(staff: Staff, requirement: StaffQualification): boolean {
    // Simplified education check - in practice, this would be more sophisticated
    const staffEducation = staff.qualifications.join(' ').toLowerCase();
    const requiredEducation = requirement.requiredEducation.toLowerCase();
    
    if (requiredEducation.includes('bachelor') && !staffEducation.includes('bachelor')) {
      return false;
    }
    if (requiredEducation.includes('associate') && !staffEducation.includes('associate')) {
      return false;
    }
    
    return true;
  }

  /**
   * Parse experience requirement string to number of years
   */
  private parseExperienceRequirement(experience: string): number {
    const match = experience.match(/(\d+)\s*year/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Calculate compliance score (0-100)
   */
  private calculateComplianceScore(
    violations: ComplianceViolation[],
    warnings: ComplianceWarning[],
    childCount: number,
    staffCount: number
  ): number {
    let score = 100;

    // Deduct points for violations
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    // Deduct points for warnings
    score -= warnings.length * 2;

    // Bonus for good ratios
    if (staffCount > 0 && childCount > 0) {
      const ratio = childCount / staffCount;
      if (ratio <= 4) score += 5; // Excellent ratio
      else if (ratio <= 6) score += 3; // Good ratio
      else if (ratio <= 8) score += 1; // Acceptable ratio
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get compliance summary for multiple rooms
   */
  getComplianceSummary(
    state: string,
    rooms: Room[],
    children: Child[],
    staff: Staff[]
  ): {
    overallScore: number;
    compliantRooms: number;
    totalRooms: number;
    criticalViolations: number;
    roomResults: Map<string, ComplianceCheckResult>;
  } {
    const roomResults = new Map<string, ComplianceCheckResult>();
    let totalScore = 0;
    let compliantRooms = 0;
    let criticalViolations = 0;

    for (const room of rooms) {
      const roomChildren = children.filter(c => c.roomId === room.id);
      const roomStaff = staff.filter(s => s.roomId === room.id);
      
      const result = this.checkRoomCompliance(state, room, roomChildren, roomStaff);
      roomResults.set(room.id, result);
      
      totalScore += result.score;
      if (result.isCompliant) compliantRooms++;
      
      criticalViolations += result.violations.filter(v => v.severity === 'critical').length;
    }

    const overallScore = rooms.length > 0 ? totalScore / rooms.length : 0;

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      compliantRooms,
      totalRooms: rooms.length,
      criticalViolations,
      roomResults
    };
  }

  /**
   * Validate a ruleset against the schema
   */
  validateRuleset(ruleset: ComplianceRuleset): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!ruleset.state || !/^[A-Z]{2}$/.test(ruleset.state)) {
      errors.push('Invalid state code');
    }

    if (!ruleset.version || !/^\d{4}\.\d{2}$/.test(ruleset.version)) {
      errors.push('Invalid version format (expected YYYY.MM)');
    }

    if (!ruleset.effectiveDate) {
      errors.push('Missing effective date');
    }

    if (!ruleset.rules) {
      errors.push('Missing rules object');
    } else {
      if (!ruleset.rules.ageGroups || ruleset.rules.ageGroups.length === 0) {
        errors.push('Missing or empty age groups');
      }

      if (!ruleset.rules.ratios || ruleset.rules.ratios.length === 0) {
        errors.push('Missing or empty ratios');
      }

      if (!ruleset.rules.staffQualifications || ruleset.rules.staffQualifications.length === 0) {
        errors.push('Missing or empty staff qualifications');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ComplianceRulesEngine;

