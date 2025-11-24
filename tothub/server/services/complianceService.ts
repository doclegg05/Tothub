import { EncryptionService } from './encryptionService';

export interface ComplianceRequirement {
  regulation: 'COPPA' | 'GDPR' | 'CCPA' | 'FERPA' | 'HIPAA';
  description: string;
  dataTypes: string[];
  retentionPeriod: number; // in days
  consentRequired: boolean;
  rightToDelete: boolean;
  dataPortability: boolean;
}

export class ComplianceService {
  private static readonly COMPLIANCE_RULES: ComplianceRequirement[] = [
    {
      regulation: 'COPPA',
      description: 'Children\'s Online Privacy Protection Act (US)',
      dataTypes: ['child_pii', 'photos', 'videos', 'biometric_data'],
      retentionPeriod: 365,
      consentRequired: true,
      rightToDelete: true,
      dataPortability: false,
    },
    {
      regulation: 'GDPR',
      description: 'General Data Protection Regulation (EU)',
      dataTypes: ['all_personal_data'],
      retentionPeriod: 2555, // 7 years for financial records
      consentRequired: true,
      rightToDelete: true,
      dataPortability: true,
    },
    {
      regulation: 'CCPA',
      description: 'California Consumer Privacy Act',
      dataTypes: ['personal_information'],
      retentionPeriod: 1095, // 3 years
      consentRequired: false,
      rightToDelete: true,
      dataPortability: true,
    },
    {
      regulation: 'FERPA',
      description: 'Family Educational Rights and Privacy Act',
      dataTypes: ['educational_records'],
      retentionPeriod: 1825, // 5 years
      consentRequired: true,
      rightToDelete: false,
      dataPortability: false,
    },
    {
      regulation: 'HIPAA',
      description: 'Health Insurance Portability and Accountability Act',
      dataTypes: ['health_information', 'medical_records'],
      retentionPeriod: 2190, // 6 years
      consentRequired: true,
      rightToDelete: false,
      dataPortability: false,
    },
  ];

  // Check if data collection requires consent
  static requiresConsent(dataType: string, userLocation: string): boolean {
    const applicableRules = this.getApplicableRules(userLocation);
    
    return applicableRules.some(rule => 
      rule.consentRequired && 
      (rule.dataTypes.includes(dataType) || rule.dataTypes.includes('all_personal_data'))
    );
  }

  // Get data retention period
  static getRetentionPeriod(dataType: string, userLocation: string): number {
    const applicableRules = this.getApplicableRules(userLocation);
    
    const rule = applicableRules.find(r => 
      r.dataTypes.includes(dataType) || r.dataTypes.includes('all_personal_data')
    );
    
    return rule?.retentionPeriod || 365; // Default 1 year
  }

  // Check if user has right to delete data
  static hasRightToDelete(dataType: string, userLocation: string): boolean {
    const applicableRules = this.getApplicableRules(userLocation);
    
    return applicableRules.some(rule => 
      rule.rightToDelete && 
      (rule.dataTypes.includes(dataType) || rule.dataTypes.includes('all_personal_data'))
    );
  }

  // Check if data is portable
  static hasDataPortabilityRight(dataType: string, userLocation: string): boolean {
    const applicableRules = this.getApplicableRules(userLocation);
    
    return applicableRules.some(rule => 
      rule.dataPortability && 
      (rule.dataTypes.includes(dataType) || rule.dataTypes.includes('all_personal_data'))
    );
  }

  // Get applicable regulations based on location
  private static getApplicableRules(userLocation: string): ComplianceRequirement[] {
    const rules: ComplianceRequirement[] = [];
    
    // COPPA applies to all US-based services collecting child data
    if (userLocation.startsWith('US') || userLocation === 'unknown') {
      rules.push(this.COMPLIANCE_RULES.find(r => r.regulation === 'COPPA')!);
    }
    
    // GDPR applies to EU residents
    if (this.isEULocation(userLocation)) {
      rules.push(this.COMPLIANCE_RULES.find(r => r.regulation === 'GDPR')!);
    }
    
    // CCPA applies to California residents
    if (userLocation === 'US-CA') {
      rules.push(this.COMPLIANCE_RULES.find(r => r.regulation === 'CCPA')!);
    }
    
    // FERPA applies when integrated with schools
    rules.push(this.COMPLIANCE_RULES.find(r => r.regulation === 'FERPA')!);
    
    // HIPAA applies when handling health information
    rules.push(this.COMPLIANCE_RULES.find(r => r.regulation === 'HIPAA')!);
    
    return rules;
  }

  private static isEULocation(location: string): boolean {
    const euCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ];
    return euCountries.includes(location);
  }

  // Generate consent record
  static createConsentRecord(userId: string, dataType: string, purpose: string): any {
    return {
      id: EncryptionService.generateSecureToken(),
      userId,
      dataType,
      purpose,
      consentGiven: false,
      timestamp: new Date(),
      ipAddress: null, // Will be filled by middleware
      userAgent: null,
      withdrawalDate: null,
    };
  }

  // Data breach notification requirements
  static getBreachNotificationRequirements(dataType: string, affectedUsers: number): {
    notifyWithinHours: number;
    notifyRegulator: boolean;
    notifyUsers: boolean;
    publicDisclosure: boolean;
  } {
    // GDPR: 72 hours to regulator, without undue delay to users
    // CCPA: No specific timeline, but must be "without unreasonable delay"
    // COPPA: No specific timeline, but FTC expects prompt notification
    
    return {
      notifyWithinHours: 72,
      notifyRegulator: true,
      notifyUsers: affectedUsers > 0,
      publicDisclosure: affectedUsers > 500,
    };
  }

  // Generate privacy policy sections
  static generatePrivacyPolicySection(regulation: string): string {
    const rule = this.COMPLIANCE_RULES.find(r => r.regulation === regulation);
    if (!rule) return '';

    return `
## ${rule.regulation} Compliance

${rule.description}

**Data Types Covered:** ${rule.dataTypes.join(', ')}
**Retention Period:** ${rule.retentionPeriod} days
**Consent Required:** ${rule.consentRequired ? 'Yes' : 'No'}
**Right to Delete:** ${rule.rightToDelete ? 'Yes' : 'No'}
**Data Portability:** ${rule.dataPortability ? 'Yes' : 'No'}
    `;
  }
}