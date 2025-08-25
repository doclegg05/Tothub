// Manual type definitions for the consolidated schema

export interface InsertCenter {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  isActive?: number | boolean;
  createdAt?: string;
}

export interface InsertUser {
  id?: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string; // admin, manager, staff, parent
  tenantId: string;
  isActive?: number | boolean;
  lastLoginAt?: string | Date;
  createdAt?: string;
  
  // Staff-specific fields (nullable for non-staff users)
  position?: string;
  hourlyRate?: number;
  w4Allowances?: number;
  additionalTaxWithholding?: number;
  faceDescriptor?: string;
  fingerprintHash?: string;
  employeeId?: string;
  hireDate?: string | Date;
  certifications?: string; // JSON string
  qualifications?: string; // JSON string
  
  // Contact fields
  phone?: string;
  address?: string;
  emergencyContact?: string;
  
  // Profile fields
  profilePictureUrl?: string;
  bio?: string;
  preferredLanguage?: string;
  notificationPreferences?: string; // JSON string
}

export interface InsertSchedule {
  id?: string;
  scheduleType: string; // "staff", "child", "room", "template"
  entityId: string; // staff_id, child_id, room_name, or template_id
  entityType: string; // "staff", "child", "room", "template"
  room: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  isPresent?: number;
  notes?: string;
  status?: string;
  
  // Template-specific fields
  isRecurring?: number | boolean;
  recurringPattern?: string;
  recurringDays?: string; // JSON array
  recurringUntil?: string;
  
  // Child-specific fields
  mealPlan?: string; // JSON string
  expectedArrival?: string;
  expectedDeparture?: string;
  
  // Room-specific fields
  capacity?: number;
  assignedStaff?: number;
  enrolledChildren?: number;
  activities?: string; // JSON string
  mealTimes?: string; // JSON string
  
  createdAt?: string;
}

export interface InsertChild {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  parentId?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  enrollmentDate: string | Date;
  ageGroup?: string;
  room?: string;
  isActive?: number | boolean;
  enableDailyReports?: number | boolean;
  createdAt?: string;
}

export interface InsertAttendance {
  id?: string;
  childId: string;
  date: string | Date;
  checkInTime?: string | Date;
  checkOutTime?: string | Date;
  checkedInBy?: string;
  checkedOutBy?: string;
  room: string;
  moodRating?: number;
  notes?: string;
  biometricMethod?: string;
  biometricConfidence?: string;
  createdAt?: string;
}

export interface InsertTimesheetEntry {
  id?: string;
  staffId: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  breakMinutes?: number;
  totalHours?: number;
  isOvertime?: number;
  isApproved?: number;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt?: string;
}

export interface InsertDocument {
  id?: string;
  documentTypeId: string;
  staffId: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  filePath?: string;
  issueDate?: string | Date;
  uploadedAt: string | Date;
  expiresAt?: string | Date;
  status?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  contactInfo?: string;
  lastReminderSent?: string | Date;
  createdBy?: string;
  updatedAt?: string | Date;
  isActive?: number | boolean;
  createdAt?: string;
}

export interface InsertDocumentType {
  id?: string;
  name: string;
  description?: string;
  category: string; // staff, child, facility, compliance
  isRequired?: number | boolean;
  validityPeriod?: number; // in days
  alertDaysBefore?: number;
  createdAt?: string;
}

export interface InsertDocumentReminder {
  id?: string;
  documentId: string;
  reminderType: string;
  reminderDate: string | Date;
  message?: string;
  priority?: string;
  isActive?: number | boolean;
  isSent?: number | boolean;
  sentAt?: string | Date;
  acknowledgedAt?: string | Date;
  acknowledgedBy?: string;
  createdAt?: string;
}

export interface InsertDocumentRenewal {
  id?: string;
  documentId: string;
  previousExpirationDate?: string | Date;
  renewedAt: string | Date;
  newExpiryDate: string | Date;
  renewalDate: string | Date;
  cost?: number;
  notes?: string;
  createdAt?: string;
}

export interface InsertPayStub {
  id?: string;
  staffId: string;
  payPeriodId: string;
  payPeriodStart: string | Date;
  payPeriodEnd: string | Date;
  regularHours: number;
  overtimeHours?: number;
  totalHours: number;
  hourlyRate: number;
  regularPay: number;
  overtimePay?: number;
  grossPay: number;
  federalTax?: number;
  stateTax?: number;
  socialSecurityTax?: number;
  medicareTax?: number;
  healthInsurance?: number;
  retirement401k?: number;
  otherDeductions?: number;
  netPay: number;
  createdAt?: string;
}

export interface InsertPayPeriod {
  id?: string;
  startDate: string | Date;
  endDate: string | Date;
  status?: string;
  isProcessed?: number | boolean;
  processedAt?: string | Date;
  createdAt?: string;
}

export interface InsertBilling {
  id?: string;
  childId: string;
  amount: number;
  description: string;
  dueDate: string | Date;
  isPaid?: number | boolean;
  paidAt?: string | Date;
  status?: string;
  autopayEnabled?: number | boolean;
  isLateFee?: number | boolean;
  invoiceNumber?: string;
  notes?: string;
  createdAt?: string;
}

export interface InsertSafetyReminder {
  id?: string;
  title: string;
  description: string;
  category: string; // safety, health, maintenance
  frequency: string; // daily, weekly, monthly
  lastCompleted?: string;
  lastCompletedDate?: string | Date;
  nextDue: string;
  nextDueDate: string | Date;
  customInterval?: number;
  isActive?: number | boolean;
  isPaused?: number | boolean;
  updatedAt?: string | Date;
  createdAt?: string;
}

export interface InsertSafetyReminderCompletion {
  id?: string;
  reminderId: string;
  completedBy: string;
  completedAt: string | Date;
  nextScheduledDate?: string | Date;
  notes?: string;
  createdAt?: string;
}

export interface InsertSecurityDevice {
  id?: string;
  name: string;
  type: string; // door_access, camera, alarm
  location: string;
  isActive?: number | boolean;
  connectionConfig?: string;
  failSafeMode?: string;
  lastMaintenance?: string | Date;
  nextMaintenance?: string | Date;
  createdAt?: string;
}

export interface InsertSecurityCredential {
  id?: string;
  deviceId: string;
  credentialType: string; // card, pin, biometric
  credentialValue: string;
  assignedTo?: string;
  isActive?: number | boolean;
  expiresAt?: string | Date;
  createdAt?: string;
}

export interface InsertSecurityLog {
  id?: string;
  deviceId: string;
  eventType: string; // access_granted, access_denied, alarm
  userId?: string;
  timestamp: string | Date;
  details?: string;
  result?: string; // success, failure, pending
  createdAt?: string;
}

export interface InsertAuditLog {
  id?: string;
  userId: string;
  action: string; // create, read, update, delete
  tableName: string;
  recordId?: string;
  entityType?: string;
  entityId?: string;
  oldValues?: string; // JSON string
  newValues?: string; // JSON string
  ipAddress?: string;
  userAgent?: string;
  timestamp: string | Date;
  createdAt?: string;
}

export interface InsertSession {
  id?: string;
  userId: string;
  username: string;
  role: string;
  token: string;
  expiresAt: string | Date;
  loginTime: string | Date;
  lastActivity: string | Date;
  ipAddress?: string;
  userAgent?: string;
  endTime?: string | Date;
  endReason?: string;
  isActive?: number | boolean;
  createdAt?: string;
}

export interface InsertSessionActivity {
  id?: string;
  sessionId: string;
  action: string;
  timestamp: string | Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
}

export interface InsertMessage {
  id?: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  isRead?: number | boolean;
  readAt?: string | Date;
  createdAt?: string;
}

export interface InsertMediaShare {
  id?: string;
  childId: string;
  mediaType: string; // photo, video, document
  mediaUrl: string;
  sharedWith: string; // parent email or staff id
  sharedAt: string | Date;
  expiresAt?: string | Date;
  createdAt?: string;
}

export interface InsertPayrollReport {
  id?: string;
  payPeriodId: string;
  reportType: string; // summary, detailed, tax
  reportData: string; // JSON string
  generatedAt: string | Date;
  createdAt?: string;
}

export interface InsertPayrollAudit {
  id?: string;
  payStubId: string;
  action: string; // created, modified, deleted
  changedBy: string;
  changes: string; // JSON string of changes
  timestamp: string | Date;
  createdAt?: string;
}

export interface InsertAlertRule {
  id?: string;
  name: string;
  description?: string;
  type: string; // ratio, compliance, safety, billing
  severity: string; // low, medium, high, critical
  conditions: string; // JSON string of rule conditions
  isActive?: number | boolean;
  createdAt?: string;
}

export interface InsertAlert {
  id?: string;
  type: string; // ratio, compliance, safety, billing
  severity: string; // low, medium, high, critical
  title: string;
  message: string;
  roomId?: string;
  staffId?: string;
  childId?: string;
  isActive?: number | boolean;
  isAcknowledged?: number | boolean;
  isRead?: number | boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string | Date;
  createdAt?: string;
}

export interface InsertStateCompliance {
  id?: string;
  state: string; // WV, OH, PA, etc.
  complianceRules: string; // JSON string of rules
  effectiveDate: string | Date;
  auditNote?: string;
  updatedBy?: string;
  updatedAt?: string | Date;
  createdAt?: string;
}

export interface InsertStateRatio {
  state: string; // US state code
  infantRatio?: string;
  toddlerRatio?: string;
  preschoolRatio?: string;
  schoolAgeRatio?: string;
  maxGroupSizeInfant?: number;
  maxGroupSizeToddler?: number;
  maxGroupSizePreschool?: number;
  maxGroupSizeSchoolAge?: number;
  notes?: string;
  updatedAt?: string | Date;
}

export interface InsertSetting {
  key: string;
  value: string;
  description?: string;
  updatedAt?: string | Date;
  updatedBy?: string;
}

// Legacy type aliases for backward compatibility
export type InsertStaff = InsertUser;
export type InsertStaffSchedule = InsertSchedule;
export type InsertUserProfile = InsertUser;
