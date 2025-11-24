export interface MigrationJob {
  id: string;
  daycareCenter: string;
  sourceSystem: string;
  status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number; // 0-100
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  errors: MigrationError[];
  warnings: MigrationWarning[];
  dataTypes: MigrationDataType[];
  backupPath?: string;
}

export interface MigrationDataType {
  type: 'children' | 'staff' | 'parents' | 'attendance' | 'schedules' | 'financials' | 'medical' | 'emergency_contacts';
  sourceCount: number;
  mappedCount: number;
  ignoredCount: number;
  errorCount: number;
}

export interface MigrationError {
  recordId: string;
  dataType: string;
  field: string;
  error: string;
  originalValue: any;
  suggestedFix?: string;
}

export interface MigrationWarning {
  recordId: string;
  dataType: string;
  field: string;
  warning: string;
  originalValue: any;
  mappedValue: any;
}

export interface SourceDataMapping {
  sourceSystem: string;
  fieldMappings: Record<string, FieldMapping>;
  transformations: DataTransformation[];
  validationRules: ValidationRule[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
  defaultValue?: any;
  transformation?: string;
}

export interface DataTransformation {
  field: string;
  operation: 'format_phone' | 'format_date' | 'normalize_name' | 'validate_email' | 'custom';
  parameters?: Record<string, any>;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'phone' | 'date' | 'numeric' | 'custom';
  parameters?: Record<string, any>;
  errorMessage: string;
}

export interface MigrationResult {
  success: boolean;
  jobId: string;
  summary: {
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    warnings: number;
  };
  dataBreakdown: Record<string, { success: number; failed: number; warnings: number }>;
  errors: MigrationError[];
  warnings: MigrationWarning[];
  recommendedActions: string[];
}

export class DataMigrationService {
  private static instance: DataMigrationService;
  private migrationJobs: Map<string, MigrationJob> = new Map();
  private backupDirectory: string = './backups/migrations';

  public static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService();
    }
    return DataMigrationService.instance;
  }

  // Start data migration from external system
  public async startMigration(
    daycareCenter: string, 
    sourceSystem: string, 
    sourceData: any,
    mapping?: SourceDataMapping
  ): Promise<string> {
    const jobId = `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: MigrationJob = {
      id: jobId,
      daycareCenter,
      sourceSystem,
      status: 'pending',
      createdAt: new Date(),
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
      dataTypes: [],
    };

    this.migrationJobs.set(jobId, job);
    console.log(`📦 Migration job ${jobId} created for ${daycareCenter} from ${sourceSystem}`);

    // Start migration process asynchronously
    this.processMigration(jobId, sourceData, mapping).catch(error => {
      console.error(`Migration job ${jobId} failed:`, error);
      job.status = 'failed';
      job.errors.push({
        recordId: 'SYSTEM',
        dataType: 'migration',
        field: 'process',
        error: error.message,
        originalValue: null,
      });
    });

    return jobId;
  }

  // Process migration job
  private async processMigration(
    jobId: string, 
    sourceData: any, 
    mapping?: SourceDataMapping
  ): Promise<void> {
    const job = this.migrationJobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'validating';
      job.startedAt = new Date();

      // Step 1: Validate source data
      console.log(`🔍 Validating source data for job ${jobId}...`);
      const validationResult = await this.validateSourceData(sourceData, mapping);
      
      if (validationResult.errors.length > 0) {
        job.errors.push(...validationResult.errors);
      }
      job.warnings.push(...validationResult.warnings);

      // Step 2: Create backup
      console.log(`💾 Creating backup for job ${jobId}...`);
      job.backupPath = await this.createBackup(jobId);

      // Step 3: Count records
      job.totalRecords = this.countRecords(sourceData);
      job.dataTypes = this.analyzeDataTypes(sourceData);

      // Step 4: Process data
      job.status = 'processing';
      console.log(`⚡ Processing ${job.totalRecords} records for job ${jobId}...`);

      const migrationResult = await this.processDataTypes(job, sourceData, mapping);
      
      // Step 5: Update final status
      job.processedRecords = migrationResult.processedRecords;
      job.failedRecords = migrationResult.failedRecords;
      job.progress = 100;
      job.status = migrationResult.success ? 'completed' : 'failed';
      job.completedAt = new Date();

      console.log(`✅ Migration job ${jobId} completed. Success: ${migrationResult.success}`);

    } catch (error) {
      job.status = 'failed';
      job.errors.push({
        recordId: 'SYSTEM',
        dataType: 'migration',
        field: 'process',
        error: error instanceof Error ? error.message : String(error),
        originalValue: null,
      });
      console.error(`❌ Migration job ${jobId} failed:`, error);
    }
  }

  // Validate source data
  private async validateSourceData(
    sourceData: any, 
    mapping?: SourceDataMapping
  ): Promise<{ errors: MigrationError[]; warnings: MigrationWarning[] }> {
    const errors: MigrationError[] = [];
    const warnings: MigrationWarning[] = [];

    // Check data structure
    if (!sourceData || typeof sourceData !== 'object') {
      errors.push({
        recordId: 'ROOT',
        dataType: 'structure',
        field: 'data',
        error: 'Invalid data structure. Expected object with data arrays.',
        originalValue: sourceData,
      });
      return { errors, warnings };
    }

    // Validate each data type
    const expectedTypes = ['children', 'staff', 'parents', 'attendance'];
    
    for (const dataType of expectedTypes) {
      if (sourceData[dataType] && !Array.isArray(sourceData[dataType])) {
        errors.push({
          recordId: 'ROOT',
          dataType,
          field: 'structure',
          error: `${dataType} data must be an array`,
          originalValue: sourceData[dataType],
        });
      }
    }

    // Validate required fields based on mapping
    if (mapping) {
      await this.validateFieldMappings(sourceData, mapping, errors, warnings);
    }

    return { errors, warnings };
  }

  // Validate field mappings
  private async validateFieldMappings(
    sourceData: any,
    mapping: SourceDataMapping,
    errors: MigrationError[],
    warnings: MigrationWarning[]
  ): Promise<void> {
    for (const [dataType, records] of Object.entries(sourceData)) {
      if (!Array.isArray(records)) continue;

      records.forEach((record: any, index: number) => {
        const recordId = record.id || `${dataType}_${index}`;

        Object.entries(mapping.fieldMappings).forEach(([targetField, fieldMapping]) => {
          const sourceValue = record[fieldMapping.sourceField];

          // Check required fields
          if (fieldMapping.required && (sourceValue === undefined || sourceValue === null || sourceValue === '')) {
            errors.push({
              recordId,
              dataType,
              field: fieldMapping.sourceField,
              error: `Required field '${fieldMapping.sourceField}' is missing or empty`,
              originalValue: sourceValue,
              suggestedFix: fieldMapping.defaultValue ? `Use default value: ${fieldMapping.defaultValue}` : 'Provide value manually',
            });
          }

          // Data type validation
          if (sourceValue !== undefined && !this.validateDataType(sourceValue, fieldMapping.dataType)) {
            warnings.push({
              recordId,
              dataType,
              field: fieldMapping.sourceField,
              warning: `Data type mismatch. Expected ${fieldMapping.dataType}, got ${typeof sourceValue}`,
              originalValue: sourceValue,
              mappedValue: this.convertDataType(sourceValue, fieldMapping.dataType),
            });
          }
        });
      });
    }
  }

  // Validate data type
  private validateDataType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' || !isNaN(Number(value));
      case 'date':
        return !isNaN(Date.parse(value));
      case 'boolean':
        return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0;
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return typeof value === 'string' && /^[\d\s\-\(\)\+\.]{10,}$/.test(value);
      default:
        return true;
    }
  }

  // Convert data type
  private convertDataType(value: any, targetType: string): any {
    switch (targetType) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'date':
        return new Date(value).toISOString();
      case 'boolean':
        return value === 'true' || value === 1 || value === true;
      case 'email':
        return String(value).toLowerCase().trim();
      case 'phone':
        return String(value).replace(/\D/g, '');
      default:
        return value;
    }
  }

  // Create backup
  private async createBackup(jobId: string): Promise<string> {
    // In a real implementation, this would create a full database backup
    const backupPath = `${this.backupDirectory}/${jobId}_backup_${Date.now()}.sql`;
    
    // Simulate backup creation
    console.log(`💾 Backup created at ${backupPath}`);
    
    return backupPath;
  }

  // Count total records
  private countRecords(sourceData: any): number {
    let total = 0;
    for (const [key, value] of Object.entries(sourceData)) {
      if (Array.isArray(value)) {
        total += value.length;
      }
    }
    return total;
  }

  // Analyze data types
  private analyzeDataTypes(sourceData: any): MigrationDataType[] {
    const dataTypes: MigrationDataType[] = [];

    const typeMapping = {
      children: 'children',
      staff: 'staff', 
      employees: 'staff',
      parents: 'parents',
      guardians: 'parents',
      attendance: 'attendance',
      checkins: 'attendance',
      schedules: 'schedules',
      billing: 'financials',
      medical: 'medical',
      emergency: 'emergency_contacts',
    };

    for (const [sourceKey, records] of Object.entries(sourceData)) {
      if (Array.isArray(records)) {
        const mappedType = typeMapping[sourceKey as keyof typeof typeMapping] || sourceKey;
        
        dataTypes.push({
          type: mappedType as any,
          sourceCount: records.length,
          mappedCount: 0,
          ignoredCount: 0,
          errorCount: 0,
        });
      }
    }

    return dataTypes;
  }

  // Process all data types
  private async processDataTypes(
    job: MigrationJob, 
    sourceData: any, 
    mapping?: SourceDataMapping
  ): Promise<{ success: boolean; processedRecords: number; failedRecords: number }> {
    let processedRecords = 0;
    let failedRecords = 0;

    for (const dataType of job.dataTypes) {
      const sourceRecords = sourceData[dataType.type] || [];
      
      console.log(`📋 Processing ${sourceRecords.length} ${dataType.type} records...`);
      
      for (const [index, record] of sourceRecords.entries()) {
        try {
          await this.processRecord(job, dataType.type, record, index, mapping);
          dataType.mappedCount++;
          processedRecords++;
        } catch (error) {
          dataType.errorCount++;
          failedRecords++;
          
          job.errors.push({
            recordId: record.id || `${dataType.type}_${index}`,
            dataType: dataType.type,
            field: 'record',
            error: error instanceof Error ? error.message : String(error),
            originalValue: record,
          });
        }

        // Update progress
        job.progress = Math.round((processedRecords + failedRecords) / job.totalRecords * 100);
      }
    }

    return {
      success: failedRecords === 0,
      processedRecords,
      failedRecords,
    };
  }

  // Process individual record
  private async processRecord(
    job: MigrationJob,
    dataType: string,
    record: any,
    index: number,
    mapping?: SourceDataMapping
  ): Promise<void> {
    // Apply field mappings and transformations
    const mappedRecord = mapping ? this.applyMapping(record, mapping) : record;
    
    // Apply data transformations
    const transformedRecord = await this.applyTransformations(mappedRecord, mapping?.transformations || []);
    
    // Validate the transformed record
    const validationErrors = this.validateRecord(transformedRecord, dataType, mapping?.validationRules || []);
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => job.errors.push(error));
      throw new Error(`Validation failed: ${validationErrors.map(e => e.error).join(', ')}`);
    }

    // In a real implementation, save to database
    await this.saveRecord(dataType, transformedRecord);
  }

  // Apply field mapping
  private applyMapping(record: any, mapping: SourceDataMapping): any {
    const mappedRecord: any = {};

    Object.entries(mapping.fieldMappings).forEach(([targetField, fieldMapping]) => {
      const sourceValue = record[fieldMapping.sourceField];
      
      if (sourceValue !== undefined) {
        mappedRecord[targetField] = this.convertDataType(sourceValue, fieldMapping.dataType);
      } else if (fieldMapping.defaultValue !== undefined) {
        mappedRecord[targetField] = fieldMapping.defaultValue;
      }
    });

    return mappedRecord;
  }

  // Apply data transformations
  private async applyTransformations(record: any, transformations: DataTransformation[]): Promise<any> {
    const transformedRecord = { ...record };

    for (const transformation of transformations) {
      const value = transformedRecord[transformation.field];
      if (value !== undefined) {
        transformedRecord[transformation.field] = await this.applyTransformation(
          value, 
          transformation.operation, 
          transformation.parameters
        );
      }
    }

    return transformedRecord;
  }

  // Apply individual transformation
  private async applyTransformation(value: any, operation: string, parameters?: Record<string, any>): Promise<any> {
    switch (operation) {
      case 'format_phone':
        return this.formatPhoneNumber(value);
      case 'format_date':
        return this.formatDate(value, parameters?.format);
      case 'normalize_name':
        return this.normalizeName(value);
      case 'validate_email':
        return this.validateAndFormatEmail(value);
      case 'custom':
        return this.applyCustomTransformation(value, parameters);
      default:
        return value;
    }
  }

  // Transformation utilities
  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  private formatDate(date: any, format?: string): string {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }
    return dateObj.toISOString();
  }

  private normalizeName(name: string): string {
    return name.trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private validateAndFormatEmail(email: string): string {
    const normalized = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    return normalized;
  }

  private applyCustomTransformation(value: any, parameters?: Record<string, any>): any {
    // Implement custom transformation logic based on parameters
    return value;
  }

  // Validate record
  private validateRecord(record: any, dataType: string, rules: ValidationRule[]): MigrationError[] {
    const errors: MigrationError[] = [];

    rules.forEach(rule => {
      const value = record[rule.field];
      let isValid = true;

      switch (rule.rule) {
        case 'required':
          isValid = value !== undefined && value !== null && value !== '';
          break;
        case 'email':
          isValid = !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          break;
        case 'phone':
          isValid = !value || /^[\d\s\-\(\)\+\.]{10,}$/.test(value);
          break;
        case 'date':
          isValid = !value || !isNaN(Date.parse(value));
          break;
        case 'numeric':
          isValid = !value || !isNaN(Number(value));
          break;
      }

      if (!isValid) {
        errors.push({
          recordId: record.id || 'unknown',
          dataType,
          field: rule.field,
          error: rule.errorMessage,
          originalValue: value,
        });
      }
    });

    return errors;
  }

  // Save record to database
  private async saveRecord(dataType: string, record: any): Promise<void> {
    // In a real implementation, this would save to the actual database
    console.log(`💾 Saving ${dataType} record:`, record.id || 'new_record');
  }

  // Get migration job status
  public getMigrationStatus(jobId: string): MigrationJob | undefined {
    return this.migrationJobs.get(jobId);
  }

  // Get all migration jobs
  public getAllMigrationJobs(): MigrationJob[] {
    return Array.from(this.migrationJobs.values());
  }

  // Rollback migration
  public async rollbackMigration(jobId: string): Promise<boolean> {
    const job = this.migrationJobs.get(jobId);
    if (!job || !job.backupPath) {
      console.error(`Cannot rollback migration ${jobId}: Job not found or no backup available`);
      return false;
    }

    try {
      console.log(`🔄 Rolling back migration ${jobId} from backup ${job.backupPath}...`);
      
      // In a real implementation, restore from backup
      // await this.restoreFromBackup(job.backupPath);
      
      job.status = 'pending';
      job.progress = 0;
      job.processedRecords = 0;
      job.failedRecords = 0;
      job.errors = [];
      job.warnings = [];
      
      console.log(`✅ Migration ${jobId} rolled back successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to rollback migration ${jobId}:`, error);
      return false;
    }
  }

  // Get predefined mappings for common systems
  public static getCommonSystemMappings(): Record<string, SourceDataMapping> {
    return {
      brightwheel: {
        sourceSystem: 'Brightwheel',
        fieldMappings: {
          first_name: { sourceField: 'first_name', targetField: 'firstName', required: true, dataType: 'string' },
          last_name: { sourceField: 'last_name', targetField: 'lastName', required: true, dataType: 'string' },
          birth_date: { sourceField: 'birthday', targetField: 'birthDate', required: true, dataType: 'date' },
          parent_email: { sourceField: 'parent_email', targetField: 'parentEmail', required: false, dataType: 'email' },
          parent_phone: { sourceField: 'parent_phone', targetField: 'parentPhone', required: false, dataType: 'phone' },
        },
        transformations: [
          { field: 'firstName', operation: 'normalize_name' },
          { field: 'lastName', operation: 'normalize_name' },
          { field: 'parentPhone', operation: 'format_phone' },
          { field: 'parentEmail', operation: 'validate_email' },
        ],
        validationRules: [
          { field: 'firstName', rule: 'required', errorMessage: 'First name is required' },
          { field: 'lastName', rule: 'required', errorMessage: 'Last name is required' },
          { field: 'birthDate', rule: 'date', errorMessage: 'Valid birth date is required' },
          { field: 'parentEmail', rule: 'email', errorMessage: 'Valid email address required' },
        ],
      },
      procare: {
        sourceSystem: 'Procare',
        fieldMappings: {
          child_first_name: { sourceField: 'ChildFirstName', targetField: 'firstName', required: true, dataType: 'string' },
          child_last_name: { sourceField: 'ChildLastName', targetField: 'lastName', required: true, dataType: 'string' },
          date_of_birth: { sourceField: 'DateOfBirth', targetField: 'birthDate', required: true, dataType: 'date' },
          guardian_email: { sourceField: 'GuardianEmail', targetField: 'parentEmail', required: false, dataType: 'email' },
          guardian_phone: { sourceField: 'GuardianPhone', targetField: 'parentPhone', required: false, dataType: 'phone' },
        },
        transformations: [
          { field: 'firstName', operation: 'normalize_name' },
          { field: 'lastName', operation: 'normalize_name' },
          { field: 'parentPhone', operation: 'format_phone' },
          { field: 'parentEmail', operation: 'validate_email' },
        ],
        validationRules: [
          { field: 'firstName', rule: 'required', errorMessage: 'Child first name is required' },
          { field: 'lastName', rule: 'required', errorMessage: 'Child last name is required' },
          { field: 'birthDate', rule: 'date', errorMessage: 'Valid date of birth is required' },
        ],
      },
      lillio: {
        sourceSystem: 'Lillio',
        fieldMappings: {
          name_first: { sourceField: 'name_first', targetField: 'firstName', required: true, dataType: 'string' },
          name_last: { sourceField: 'name_last', targetField: 'lastName', required: true, dataType: 'string' },
          dob: { sourceField: 'dob', targetField: 'birthDate', required: true, dataType: 'date' },
          contact_email: { sourceField: 'primary_contact_email', targetField: 'parentEmail', required: false, dataType: 'email' },
          contact_phone: { sourceField: 'primary_contact_phone', targetField: 'parentPhone', required: false, dataType: 'phone' },
        },
        transformations: [
          { field: 'firstName', operation: 'normalize_name' },
          { field: 'lastName', operation: 'normalize_name' },
          { field: 'parentPhone', operation: 'format_phone' },
          { field: 'parentEmail', operation: 'validate_email' },
        ],
        validationRules: [
          { field: 'firstName', rule: 'required', errorMessage: 'First name is required' },
          { field: 'lastName', rule: 'required', errorMessage: 'Last name is required' },
          { field: 'birthDate', rule: 'date', errorMessage: 'Date of birth must be valid' },
        ],
      },
    };
  }

  // Generate migration report
  public generateMigrationReport(jobId: string): MigrationResult | null {
    const job = this.migrationJobs.get(jobId);
    if (!job) return null;

    const dataBreakdown = job.dataTypes.reduce((acc, dataType) => {
      acc[dataType.type] = {
        success: dataType.mappedCount,
        failed: dataType.errorCount,
        warnings: dataType.ignoredCount,
      };
      return acc;
    }, {} as Record<string, { success: number; failed: number; warnings: number }>);

    const recommendedActions: string[] = [];
    
    if (job.errors.length > 0) {
      recommendedActions.push('Review and fix data validation errors');
    }
    if (job.warnings.length > 5) {
      recommendedActions.push('Consider updating field mappings to reduce warnings');
    }
    if (job.failedRecords > job.processedRecords * 0.1) {
      recommendedActions.push('High failure rate detected - review source data quality');
    }

    return {
      success: job.status === 'completed',
      jobId,
      summary: {
        totalRecords: job.totalRecords,
        successfulRecords: job.processedRecords,
        failedRecords: job.failedRecords,
        warnings: job.warnings.length,
      },
      dataBreakdown,
      errors: job.errors,
      warnings: job.warnings,
      recommendedActions,
    };
  }
}