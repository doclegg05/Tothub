import { AuditService } from './auditService';

export interface StateRegulation {
  state: string;
  licenseType: string;
  ratios: {
    [ageGroup: string]: {
      childToStaff: number;
      maxGroupSize: number;
      qualifications: string[];
    };
  };
  backgroundCheckRequirements: string[];
  trainingRequirements: string[];
  physicalRequirements: string[];
  reportingRequirements: string[];
}

export interface NAEYCStandards {
  accreditationLevel: string;
  ratios: {
    [ageGroup: string]: {
      childToStaff: number;
      maxGroupSize: number;
    };
  };
  qualityIndicators: string[];
}

export class RegulatoryComplianceService {
  // NAEYC (National Association for the Education of Young Children) Standards
  private static readonly NAEYC_STANDARDS: NAEYCStandards = {
    accreditationLevel: 'Full Accreditation',
    ratios: {
      'infant': { childToStaff: 4, maxGroupSize: 8 },
      'young_toddler': { childToStaff: 4, maxGroupSize: 8 },
      'toddler': { childToStaff: 6, maxGroupSize: 12 },
      'preschool': { childToStaff: 10, maxGroupSize: 20 },
      'school_age': { childToStaff: 15, maxGroupSize: 30 },
    },
    qualityIndicators: [
      'Positive teacher-child relationships',
      'Effective curriculum implementation',
      'Systematic assessment of child progress',
      'Health and safety practices',
      'Teacher qualifications and professional development'
    ],
  };

  // State-specific regulations (sample states)
  private static readonly STATE_REGULATIONS: { [state: string]: StateRegulation } = {
    'CA': {
      state: 'California',
      licenseType: 'Community Care Licensing',
      ratios: {
        'infant': { childToStaff: 4, maxGroupSize: 12, qualifications: ['Infant/Toddler Certificate'] },
        'toddler': { childToStaff: 6, maxGroupSize: 12, qualifications: ['Early Childhood Units'] },
        'preschool': { childToStaff: 12, maxGroupSize: 24, qualifications: ['Teacher Permit'] },
        'school_age': { childToStaff: 14, maxGroupSize: 28, qualifications: ['School Age Permit'] },
      },
      backgroundCheckRequirements: [
        'DOJ fingerprint clearance',
        'FBI background check',
        'Child Abuse Central Index check',
        'Tuberculosis testing',
      ],
      trainingRequirements: [
        '15 hours annual continuing education',
        'CPR/First Aid certification',
        'Health and safety training',
        'Mandated reporter training',
      ],
      physicalRequirements: [
        '35 square feet indoor space per child',
        '75 square feet outdoor space per child',
        'Separate sick child area',
        'Age-appropriate equipment',
      ],
      reportingRequirements: [
        'Monthly attendance reports',
        'Incident reports within 24 hours',
        'Annual self-evaluation',
        'Financial audits',
      ],
    },
    'NY': {
      state: 'New York',
      licenseType: 'Office of Children and Family Services',
      ratios: {
        'infant': { childToStaff: 4, maxGroupSize: 8, qualifications: ['CDA or equivalent'] },
        'toddler': { childToStaff: 5, maxGroupSize: 10, qualifications: ['CDA or equivalent'] },
        'preschool': { childToStaff: 8, maxGroupSize: 16, qualifications: ['Teaching Certificate'] },
        'school_age': { childToStaff: 10, maxGroupSize: 20, qualifications: ['School Age Credential'] },
      },
      backgroundCheckRequirements: [
        'NYS criminal background check',
        'National criminal background check',
        'Statewide Central Register check',
        'Medical examination',
      ],
      trainingRequirements: [
        '30 hours annual training',
        'CPR/First Aid certification',
        'Child abuse recognition',
        'Emergency procedures',
      ],
      physicalRequirements: [
        '30 square feet indoor space per child',
        '60 square feet outdoor space per child',
        'Handwashing facilities',
        'Safety equipment',
      ],
      reportingRequirements: [
        'Quarterly reports to OCFS',
        'Immediate reporting of serious incidents',
        'Annual compliance review',
        'Parent complaint procedures',
      ],
    },
    'TX': {
      state: 'Texas',
      licenseType: 'Department of Family and Protective Services',
      ratios: {
        'infant': { childToStaff: 4, maxGroupSize: 11, qualifications: ['High school diploma'] },
        'toddler': { childToStaff: 9, maxGroupSize: 18, qualifications: ['CDA preferred'] },
        'preschool': { childToStaff: 15, maxGroupSize: 22, qualifications: ['CDA or degree'] },
        'school_age': { childToStaff: 26, maxGroupSize: 26, qualifications: ['High school diploma'] },
      },
      backgroundCheckRequirements: [
        'DPS fingerprint check',
        'FBI national check',
        'Central Registry check',
        'Previous employer verification',
      ],
      trainingRequirements: [
        '24 hours annual training',
        'CPR/First Aid certification',
        'Communicable disease training',
        'Gang-free zone training',
      ],
      physicalRequirements: [
        '25 square feet indoor space per child',
        '50 square feet outdoor space per child',
        'Secure building access',
        'Emergency exits',
      ],
      reportingRequirements: [
        'Monthly operational reports',
        'Injury reports within 24 hours',
        'Annual inspection compliance',
        'Parent notification procedures',
      ],
    },
  };

  // FLSA (Fair Labor Standards Act) Compliance
  static validateFLSACompliance(hoursWorked: number, hourlyRate: number, state: string): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Federal minimum wage (update as needed)
    const federalMinWage = 7.25;
    const stateMinWages: { [state: string]: number } = {
      'CA': 16.00,
      'NY': 15.00,
      'TX': 7.25,
    };

    const applicableMinWage = Math.max(federalMinWage, stateMinWages[state] || federalMinWage);

    // Check minimum wage compliance
    if (hourlyRate < applicableMinWage) {
      violations.push(`Hourly rate $${hourlyRate} below minimum wage $${applicableMinWage}`);
    }

    // Check overtime compliance (over 40 hours per week)
    if (hoursWorked > 40) {
      const overtimeRate = hourlyRate * 1.5;
      recommendations.push(`Overtime rate should be $${overtimeRate.toFixed(2)} for hours over 40`);
    }

    // Check maximum hours (childcare-specific)
    if (hoursWorked > 60) {
      violations.push('Excessive hours may violate state childcare regulations');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  // UL 294 Physical Security Standards Compliance
  static validatePhysicalSecurityCompliance(deviceConfig: any): {
    compliant: boolean;
    violations: string[];
    certificationLevel: string;
  } {
    const violations: string[] = [];

    // UL 294 Standard requirements
    const ul294Requirements = {
      encryption: 'AES-256 minimum',
      authentication: 'Multi-factor required',
      auditLogging: 'Comprehensive event logging',
      failSafe: 'Fail-safe or fail-secure mode',
      tamperResistance: 'Tamper detection required',
      powerBackup: 'Battery backup required',
      communicationSecurity: 'Encrypted communication',
    };

    // Check encryption standard
    if (!deviceConfig.encryption || !deviceConfig.encryption.includes('AES-256')) {
      violations.push('Encryption does not meet UL 294 AES-256 requirement');
    }

    // Check authentication
    if (!deviceConfig.multiFactorAuth) {
      violations.push('Multi-factor authentication not configured');
    }

    // Check audit logging
    if (!deviceConfig.auditLogging) {
      violations.push('Comprehensive audit logging not enabled');
    }

    // Check fail-safe mode
    if (!deviceConfig.failSafeMode && !deviceConfig.failSecureMode) {
      violations.push('Neither fail-safe nor fail-secure mode configured');
    }

    // Check tamper resistance
    if (!deviceConfig.tamperDetection) {
      violations.push('Tamper detection not configured');
    }

    const certificationLevel = violations.length === 0 ? 'UL 294 Compliant' : 
                              violations.length <= 2 ? 'Partial Compliance' : 'Non-Compliant';

    return {
      compliant: violations.length === 0,
      violations,
      certificationLevel,
    };
  }

  // Check ratio compliance for specific state
  static checkRatioCompliance(state: string, ageGroup: string, childCount: number, staffCount: number): {
    compliant: boolean;
    requiredStaff: number;
    maxChildren: number;
    standard: 'State' | 'NAEYC';
    violations: string[];
  } {
    const violations: string[] = [];
    const stateRegs = this.STATE_REGULATIONS[state];
    const naeyc = this.NAEYC_STANDARDS.ratios[ageGroup];

    let applicableRatio;
    let maxGroupSize;
    let standard: 'State' | 'NAEYC';

    if (stateRegs && stateRegs.ratios[ageGroup]) {
      applicableRatio = stateRegs.ratios[ageGroup].childToStaff;
      maxGroupSize = stateRegs.ratios[ageGroup].maxGroupSize;
      standard = 'State';
    } else if (naeyc) {
      applicableRatio = naeyc.childToStaff;
      maxGroupSize = naeyc.maxGroupSize;
      standard = 'NAEYC';
    } else {
      violations.push(`No regulations found for age group: ${ageGroup}`);
      return {
        compliant: false,
        requiredStaff: 1,
        maxChildren: 1,
        standard: 'State',
        violations,
      };
    }

    const requiredStaff = Math.ceil(childCount / applicableRatio);

    // Check staff ratio
    if (staffCount < requiredStaff) {
      violations.push(`Insufficient staff: ${staffCount} current, ${requiredStaff} required for ${childCount} children`);
    }

    // Check maximum group size
    if (childCount > maxGroupSize) {
      violations.push(`Group size exceeds maximum: ${childCount} children, ${maxGroupSize} maximum allowed`);
    }

    return {
      compliant: violations.length === 0,
      requiredStaff,
      maxChildren: maxGroupSize,
      standard,
      violations,
    };
  }

  // Get staff qualification requirements
  static getQualificationRequirements(state: string, ageGroup: string): {
    required: string[];
    preferred: string[];
    continuing_education: string;
  } {
    const stateRegs = this.STATE_REGULATIONS[state];
    
    if (stateRegs && stateRegs.ratios[ageGroup]) {
      return {
        required: stateRegs.ratios[ageGroup].qualifications,
        preferred: stateRegs.trainingRequirements,
        continuing_education: stateRegs.trainingRequirements.find(req => req.includes('hours')) || 'Annual training required',
      };
    }

    // Default requirements
    return {
      required: ['High school diploma or equivalent'],
      preferred: ['Child Development Associate (CDA)', 'Early Childhood Education units'],
      continuing_education: '15 hours annually',
    };
  }

  // Validate background check completion
  static validateBackgroundChecks(state: string, staffMember: any): {
    compliant: boolean;
    missing: string[];
    expiring: string[];
  } {
    const stateRegs = this.STATE_REGULATIONS[state];
    const required = stateRegs?.backgroundCheckRequirements || [
      'Criminal background check',
      'Child abuse registry check',
      'Reference verification',
    ];

    const missing: string[] = [];
    const expiring: string[] = [];

    required.forEach(requirement => {
      const checkName = requirement.toLowerCase().replace(/\s+/g, '_');
      const check = staffMember.backgroundChecks?.[checkName];
      
      if (!check || !check.completed) {
        missing.push(requirement);
      } else if (check.expiresAt && new Date(check.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
        expiring.push(requirement);
      }
    });

    return {
      compliant: missing.length === 0,
      missing,
      expiring,
    };
  }

  // Generate compliance report
  static generateComplianceReport(facilityData: any): {
    overallCompliance: number;
    ratioCompliance: any[];
    staffCompliance: any[];
    physicalCompliance: any[];
    recommendations: string[];
  } {
    const ratioCompliance: any[] = [];
    const staffCompliance: any[] = [];
    const physicalCompliance: any[] = [];
    const recommendations: string[] = [];

    // Check ratio compliance for each room
    facilityData.rooms?.forEach((room: any) => {
      const compliance = this.checkRatioCompliance(
        facilityData.state,
        room.ageGroup,
        room.childCount,
        room.staffCount
      );
      ratioCompliance.push({ room: room.name, ...compliance });
      
      if (!compliance.compliant) {
        recommendations.push(`Room ${room.name}: ${compliance.violations.join(', ')}`);
      }
    });

    // Check staff compliance
    facilityData.staff?.forEach((staff: any) => {
      const bgCheck = this.validateBackgroundChecks(facilityData.state, staff);
      const qualReqs = this.getQualificationRequirements(facilityData.state, staff.primaryAgeGroup);
      
      staffCompliance.push({
        name: staff.name,
        backgroundCheck: bgCheck,
        qualifications: qualReqs,
      });

      if (!bgCheck.compliant) {
        recommendations.push(`${staff.name}: Missing background checks - ${bgCheck.missing.join(', ')}`);
      }
    });

    // Check physical security compliance
    facilityData.securityDevices?.forEach((device: any) => {
      const compliance = this.validatePhysicalSecurityCompliance(device);
      physicalCompliance.push({ device: device.name, ...compliance });
      
      if (!compliance.compliant) {
        recommendations.push(`${device.name}: ${compliance.violations.join(', ')}`);
      }
    });

    // Calculate overall compliance percentage
    const totalChecks = ratioCompliance.length + staffCompliance.length + physicalCompliance.length;
    const passedChecks = ratioCompliance.filter(r => r.compliant).length +
                        staffCompliance.filter(s => s.backgroundCheck.compliant).length +
                        physicalCompliance.filter(p => p.compliant).length;

    const overallCompliance = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;

    AuditService.logCompliance(
      facilityData.managerId || 'system',
      'compliance_report_generated',
      'facility_wide',
      true,
      'system',
      'regulatory-service',
      { overallCompliance, totalChecks, passedChecks }
    );

    return {
      overallCompliance,
      ratioCompliance,
      staffCompliance,
      physicalCompliance,
      recommendations,
    };
  }

  // Get emergency procedures based on state requirements
  static getEmergencyProcedures(state: string): {
    evacuation: string[];
    lockdown: string[];
    medical: string[];
    weatherRelated: string[];
    reportingRequirements: string[];
  } {
    const stateRegs = this.STATE_REGULATIONS[state];
    
    return {
      evacuation: [
        'Sound evacuation alarm',
        'Execute evacuation routes',
        'Conduct roll call at designated assembly area',
        'Contact emergency services if needed',
        'Notify parents/guardians',
        'Document incident',
      ],
      lockdown: [
        'Secure all entrances and exits',
        'Move children away from windows and doors',
        'Maintain silence and calm',
        'Contact law enforcement',
        'Follow law enforcement instructions',
        'Account for all children and staff',
      ],
      medical: [
        'Assess severity of medical emergency',
        'Administer first aid if trained',
        'Call 911 for serious emergencies',
        'Contact parents/guardians',
        'Document incident thoroughly',
        'Follow up with medical professionals',
      ],
      weatherRelated: [
        'Monitor weather alerts continuously',
        'Move to designated shelter area',
        'Account for all children and staff',
        'Maintain emergency supplies',
        'Communicate with parents about pickup procedures',
        'Document weather-related incidents',
      ],
      reportingRequirements: stateRegs?.reportingRequirements || [
        'Report to licensing agency within 24 hours',
        'Notify parents within 4 hours',
        'Submit written report within 48 hours',
        'Maintain incident documentation',
      ],
    };
  }
}