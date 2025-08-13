// Manual type definitions to replace broken createInsertSchema types

export interface InsertStaff {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  hourlyRate?: number;
  w4Allowances?: number;
  additionalTaxWithholding?: number;
  faceDescriptor?: string;
  fingerprintHash?: string;
  biometricEnrolledAt?: string | Date; // When biometric data was enrolled
  biometricEnabled?: boolean; // Whether biometric authentication is enabled
  isActive?: number | boolean;
  createdAt?: string;
}

export interface InsertStaffSchedule {
  id?: string;
  staffId: string;
  room: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  date: string;
  isPresent?: number;
  scheduleType?: string;
  notes?: string;
  status?: string;
  createdAt?: string;
}

export interface InsertChild {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  parentId?: string;
  parentName?: string; // Name of the parent/guardian
  parentEmail?: string;
  parentPhone?: string;
  emergencyContact?: string;
  emergencyContactName?: string; // Name of emergency contact
  emergencyContactPhone?: string; // Phone number of emergency contact
  medicalNotes?: string;
  allergies?: string[]; // List of allergies
  immunizations?: string[]; // List of immunizations
  enrollmentDate?: string; // Made optional since it's not always provided
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
  checkInBy?: string; // Who checked in the child
  checkOutBy?: string;
  room?: string; // Room where child is checked in
  moodRating?: number;
  notes?: string;
  createdAt?: string;
}

export interface InsertTimesheetEntry {
  id?: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime?: string;
  clockInTime: string;
  clockOutTime?: string;
  hours?: number;
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
  typeId: string;
  documentTypeId: string;
  staffId: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  filePath?: string;
  issueDate?: string;
  uploadedAt: string;
  expiresAt?: string;
  expirationDate?: string;
  status?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  contactInfo?: string;
  lastReminderSent?: string;
  createdBy?: string;
  updatedAt?: string;
  isActive?: number;
  createdAt?: string;
}

export interface InsertDocumentType {
  id?: string;
  name: string;
  description?: string;
  category: string;
  isRequired?: number;
  required?: number;
  validityPeriod?: number;
  alertDaysBefore?: number;
  createdAt?: string;
}

export interface InsertSafetyReminder {
  id?: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  lastCompleted?: string;
  lastCompletedDate?: string;
  nextDue: string;
  nextDueDate: string;
  customInterval?: number;
  isActive?: number;
  isPaused?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface InsertSafetyReminderCompletion {
  id?: string;
  reminderId: string;
  completedBy: string;
  completedAt: string;
  nextScheduledDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface InsertSecurityDevice {
  id?: string;
  name: string;
  type: string;
  location: string;
  isActive?: number;
  isEnabled?: boolean; // Whether the device is enabled
  connectionType?: string; // serial, network, bluetooth, gpio
  connectionConfig?: string;
  failSafeMode?: string;
  unlockDuration?: number; // Duration in seconds before auto-lock
  lastMaintenance?: string;
  nextMaintenance?: string;
  createdAt?: string;
}

export interface InsertAlert {
  id?: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  roomId?: string;
  staffId?: string;
  childId?: string;
  isActive?: number;
  isAcknowledged?: number;
  isRead?: number;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt?: string;
}

export interface InsertAlertRule {
  id?: string;
  name: string;
  description?: string;
  type: string;
  severity: string;
  conditions: string;
  isActive?: number;
  createdAt?: string;
}

export interface InsertBilling {
  id?: string;
  childId: string;
  amount: number;
  description: string;
  dueDate: string;
  isPaid?: number;
  paidAt?: string;
  paidDate?: string;
  status?: string;
  autopayEnabled?: number;
  isLateFee?: number;
  invoiceNumber?: string;
  notes?: string;
  createdAt?: string;
}

export interface InsertPayStub {
  id?: string;
  staffId: string;
  payPeriodId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
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
  startDate: string;
  endDate: string;
  status?: string;
  isProcessed?: number;
  processedAt?: string;
  createdAt?: string;
}

export interface InsertDocumentRenewal {
  id?: string;
  documentId: string;
  previousExpirationDate?: string;
  renewedAt: string;
  newExpiryDate: string;
  renewalDate: string;
  cost?: number;
  notes?: string;
  processedBy?: string; // Who processed the renewal
  createdAt?: string;
}
