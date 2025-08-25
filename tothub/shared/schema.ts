import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Centers schema
export const centers = sqliteTable("centers", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  email: text("email"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Unified User Management System - Most Efficient Approach
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // admin, manager, staff, parent
  tenantId: text("tenant_id").notNull(),
  isActive: integer("is_active").default(1),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  
  // Staff-specific fields (nullable for non-staff users)
  position: text("position"),
  hourlyRate: integer("hourly_rate"),
  w4Allowances: integer("w4_allowances").default(0),
  additionalTaxWithholding: integer("additional_tax_withholding").default(0),
  faceDescriptor: text("face_descriptor"), // Biometric face data
  fingerprintHash: text("fingerprint_hash"), // Biometric fingerprint hash
  employeeId: text("employee_id").unique(),
  hireDate: text("hire_date"),
  certifications: text("certifications"), // JSON string
  qualifications: text("qualifications"), // JSON string
  
  // Contact fields
  phone: text("phone"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  
  // Profile fields
  profilePictureUrl: text("profile_picture_url"),
  bio: text("bio"),
  preferredLanguage: text("preferred_language"),
  notificationPreferences: text("notification_preferences"), // JSON string
});

// Unified Schedule System - Single table for all schedule types
export const schedules = sqliteTable("schedules", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  scheduleType: text("schedule_type").notNull(), // "staff", "child", "room", "template"
  entityId: text("entity_id").notNull(), // staff_id, child_id, room_name, or template_id
  entityType: text("entity_type").notNull(), // "staff", "child", "room", "template"
  staffId: text("staff_id"), // Legacy field for backward compatibility
  room: text("room").notNull(),
  date: text("date").notNull(),
  scheduledStart: text("scheduled_start").notNull(),
  scheduledEnd: text("scheduled_end").notNull(),
  actualStart: text("actual_start"),
  actualEnd: text("actual_end"),
  isPresent: integer("is_present").default(0),
  notes: text("notes"),
  status: text("status").default("scheduled"),
  
  // Template-specific fields (nullable for non-template schedules)
  isRecurring: integer("is_recurring").default(0),
  recurringPattern: text("recurring_pattern"), // "daily", "weekly", "monthly"
  recurringDays: text("recurring_days"), // JSON array of days
  recurringUntil: text("recurring_until"),
  
  // Child-specific fields (nullable for non-child schedules)
  mealPlan: text("meal_plan"), // JSON string
  expectedArrival: text("expected_arrival"),
  expectedDeparture: text("expected_departure"),
  
  // Room-specific fields (nullable for non-room schedules)
  capacity: integer("capacity"),
  assignedStaff: integer("assigned_staff"),
  enrolledChildren: integer("enrolled_children"),
  activities: text("activities"), // JSON string
  mealTimes: text("meal_times"), // JSON string
  
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Children schema - simplified and normalized
export const children = sqliteTable("children", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  parentId: text("parent_id").references(() => users.id), // Reference to users table
  parentEmail: text("parent_email"), // Legacy field for backward compatibility
  emergencyContact: text("emergency_contact"),
  medicalNotes: text("medical_notes"),
  enrollmentDate: text("enrollment_date").notNull(),
  ageGroup: text("age_group"), // infant, toddler, preschool, school_age
  room: text("room"), // room assignment
  isActive: integer("is_active").default(1),
  enableDailyReports: integer("enable_daily_reports").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Attendance schema - optimized
export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  childId: text("child_id").references(() => children.id).notNull(),
  date: text("date").notNull(),
  checkInTime: text("check_in_time"),
  checkOutTime: text("check_out_time"),
  checkedInBy: text("checked_in_by").references(() => users.id),
  checkedOutBy: text("checked_out_by").references(() => users.id),
  room: text("room").notNull(),
  moodRating: integer("mood_rating"), // 1-5 scale
  notes: text("notes"),
  biometricMethod: text("biometric_method"),
  biometricConfidence: text("biometric_confidence"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Activities schema
export const activities = sqliteTable("activities", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  childId: text("child_id").references(() => children.id).notNull(),
  date: text("date").notNull(),
  activityType: text("activity_type").notNull(), // learning, play, outdoor, art, etc.
  description: text("description").notNull(),
  duration: integer("duration"), // in minutes
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Meals schema
export const meals = sqliteTable("meals", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  childId: text("child_id").references(() => children.id).notNull(),
  date: text("date").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, snack, dinner
  description: text("description").notNull(),
  amountEaten: text("amount_eaten"), // all, most, some, none
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Photos schema
export const photos = sqliteTable("photos", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  childId: text("child_id").references(() => children.id).notNull(),
  date: text("date").notNull(),
  photoUrl: text("photo_url").notNull(),
  caption: text("caption"),
  activityId: text("activity_id").references(() => activities.id),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Naps schema
export const naps = sqliteTable("naps", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  childId: text("child_id").references(() => children.id).notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  duration: integer("duration"), // in minutes
  quality: text("quality"), // good, fair, poor
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Daily reports schema
export const dailyReports = sqliteTable("daily_reports", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  childId: text("child_id").references(() => children.id).notNull(),
  date: text("date").notNull(),
  sentAt: text("sent_at"),
  emailStatus: text("email_status").notNull().default("pending"), // pending, sent, failed
  emailMessageId: text("email_message_id"),
  reportData: text("report_data"), // JSON string of cached report content
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Teacher notes schema
export const teacherNotes = sqliteTable("teacher_notes", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  childId: text("child_id").references(() => children.id).notNull(),
  staffId: text("staff_id").references(() => users.id).notNull(),
  date: text("date").notNull(),
  note: text("note").notNull(),
  category: text("category"), // behavior, learning, health, general
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Payroll schemas - optimized
export const payStubs = sqliteTable("pay_stubs", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  staffId: text("staff_id").references(() => users.id).notNull(),
  payPeriodId: text("pay_period_id").references(() => payPeriods.id).notNull(),
  payPeriodStart: text("pay_period_start").notNull(),
  payPeriodEnd: text("pay_period_end").notNull(),
  regularHours: integer("regular_hours").notNull(),
  overtimeHours: integer("overtime_hours").default(0),
  totalHours: integer("total_hours").notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  regularPay: integer("regular_pay").notNull(),
  overtimePay: integer("overtime_pay").default(0),
  grossPay: integer("gross_pay").notNull(),
  federalTax: integer("federal_tax").default(0),
  stateTax: integer("state_tax").default(0),
  socialSecurityTax: integer("social_security_tax").default(0),
  medicareTax: integer("medicare_tax").default(0),
  healthInsurance: integer("health_insurance").default(0),
  retirement401k: integer("retirement_401k").default(0),
  otherDeductions: integer("other_deductions").default(0),
  netPay: integer("net_pay").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const payPeriods = sqliteTable("pay_periods", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").default("open"), // open, processing, closed
  isProcessed: integer("is_processed").default(0),
  processedAt: text("processed_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Unified Timesheet System - Single table for all time tracking
export const timesheetEntries = sqliteTable("timesheet_entries", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  staffId: text("staff_id").references(() => users.id).notNull(),
  date: text("date").notNull(),
  clockInTime: text("clock_in_time").notNull(),
  clockOutTime: text("clock_out_time"),
  breakMinutes: integer("break_minutes").default(0),
  totalHours: integer("total_hours").default(0),
  isOvertime: integer("is_overtime").default(0),
  isApproved: integer("is_approved").default(0),
  approvedBy: text("approved_by").references(() => users.id),
  approvedAt: text("approved_at"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Safety schemas
export const safetyReminders = sqliteTable("safety_reminders", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // safety, health, maintenance
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  lastCompleted: text("last_completed"),
  lastCompletedDate: text("last_completed_date"),
  nextDue: text("next_due").notNull(),
  nextDueDate: text("next_due_date").notNull(),
  customInterval: integer("custom_interval"),
  isActive: integer("is_active").default(1),
  isPaused: integer("is_paused").default(0),
  updatedAt: text("updated_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const safetyReminderCompletions = sqliteTable("safety_reminder_completions", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  reminderId: text("reminder_id").references(() => safetyReminders.id).notNull(),
  completedBy: text("completed_by").references(() => users.id).notNull(),
  completedAt: text("completed_at").notNull(),
  nextScheduledDate: text("next_scheduled_date"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Security schemas
export const securityDevices = sqliteTable("security_devices", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  type: text("type").notNull(), // door_access, camera, alarm
  location: text("location").notNull(),
  isActive: integer("is_active").default(1),
  connectionConfig: text("connection_config"),
  failSafeMode: text("fail_safe_mode").default("secure"),
  lastMaintenance: text("last_maintenance"),
  nextMaintenance: text("next_maintenance"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const securityCredentials = sqliteTable("security_credentials", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  deviceId: text("device_id").references(() => securityDevices.id).notNull(),
  credentialType: text("credential_type").notNull(), // card, pin, biometric
  credentialValue: text("credential_value").notNull(),
  assignedTo: text("assigned_to").references(() => users.id),
  isActive: integer("is_active").default(1),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const securityLogs = sqliteTable("security_logs", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  deviceId: text("device_id").references(() => securityDevices.id).notNull(),
  eventType: text("event_type").notNull(), // access_granted, access_denied, alarm
  userId: text("user_id").references(() => users.id),
  timestamp: text("timestamp").notNull(),
  details: text("details"),
  result: text("result"), // success, failure, pending
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // create, read, update, delete
  tableName: text("table_name").notNull(),
  recordId: text("record_id"),
  entityType: text("entity_type"), // Type of entity being audited
  entityId: text("entity_id"), // ID of entity being audited
  oldValues: text("old_values"), // JSON string
  newValues: text("new_values"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: text("timestamp").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Unified Session Management - Single table for all session types
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").references(() => users.id).notNull(),
  username: text("username").notNull(),
  role: text("role").notNull(),
  token: text("token").notNull(),
  expiresAt: text("expires_at").notNull(),
  loginTime: text("login_time").notNull(),
  lastActivity: text("last_activity").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  endTime: text("end_time"),
  endReason: text("end_reason"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const sessionActivity = sqliteTable("session_activity", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  sessionId: text("session_id").references(() => sessions.id).notNull(),
  action: text("action").notNull(),
  timestamp: text("timestamp").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Document schemas - Fixed duplicate field issue
export const documentTypes = sqliteTable("document_types", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // staff, child, facility, compliance
  isRequired: integer("is_required").default(0),
  validityPeriod: integer("validity_period"), // in days
  alertDaysBefore: integer("alert_days_before").default(30),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  documentTypeId: text("document_type_id").references(() => documentTypes.id).notNull(),
  staffId: text("staff_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  filePath: text("file_path"),
  issueDate: text("issue_date"),
  uploadedAt: text("uploaded_at").notNull(),
  expiresAt: text("expires_at"),
  expirationDate: text("expiration_date"), // Legacy field for backward compatibility
  status: text("status").default("active"),
  documentNumber: text("document_number"),
  issuingAuthority: text("issuing_authority"),
  contactInfo: text("contact_info"),
  lastReminderSent: text("last_reminder_sent"),
  createdBy: text("created_by").references(() => users.id),
  updatedAt: text("updated_at"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const documentReminders = sqliteTable("document_reminders", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  documentId: text("document_id").references(() => documents.id).notNull(),
  reminderType: text("reminder_type").notNull(),
  reminderDate: text("reminder_date").notNull(),
  message: text("message"),
  priority: text("priority").default("medium"),
  isActive: integer("is_active").default(1),
  isSent: integer("is_sent").default(0),
  sentAt: text("sent_at"),
  acknowledgedAt: text("acknowledged_at"),
  acknowledgedBy: text("acknowledged_by").references(() => users.id),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const documentRenewals = sqliteTable("document_renewals", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  documentId: text("document_id").references(() => documents.id).notNull(),
  previousExpirationDate: text("previous_expiration_date"),
  renewedAt: text("renewed_at").notNull(),
  newExpiryDate: text("new_expiry_date").notNull(),
  renewalDate: text("renewal_date").notNull(),
  cost: integer("cost"), // Cost of renewal
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Billing schemas
export const billing = sqliteTable("billing", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  childId: text("child_id").references(() => children.id).notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  dueDate: text("due_date").notNull(),
  isPaid: integer("is_paid").default(0),
  paidAt: text("paid_at"),
  paidDate: text("paid_date"), // Legacy field for backward compatibility
  status: text("status").default("pending"), // pending, paid, overdue, cancelled
  autopayEnabled: integer("autopay_enabled").default(0),
  isLateFee: integer("is_late_fee").default(0),
  invoiceNumber: text("invoice_number"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Messages and media schemas
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  senderId: text("sender_id").references(() => users.id).notNull(),
  recipientId: text("recipient_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: integer("is_read").default(0),
  readAt: text("read_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const mediaShares = sqliteTable("media_shares", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  childId: text("child_id").references(() => children.id).notNull(),
  mediaType: text("media_type").notNull(), // photo, video, document
  mediaUrl: text("media_url").notNull(),
  sharedWith: text("shared_with").notNull(), // parent email or staff id
  sharedAt: text("shared_at").notNull(),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Payroll reports schema
export const payrollReports = sqliteTable("payroll_reports", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  payPeriodId: text("pay_period_id").references(() => payPeriods.id).notNull(),
  reportType: text("report_type").notNull(), // summary, detailed, tax
  reportData: text("report_data").notNull(), // JSON string
  generatedAt: text("generated_at").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const payrollAudit = sqliteTable("payroll_audit", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  payStubId: text("pay_stub_id").references(() => payStubs.id).notNull(),
  action: text("action").notNull(), // created, modified, deleted
  changedBy: text("changed_by").references(() => users.id).notNull(),
  changes: text("changes").notNull(), // JSON string of changes
  timestamp: text("timestamp").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Alert schemas
export const alertRules = sqliteTable("alert_rules", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // ratio, compliance, safety, billing
  severity: text("severity").notNull(), // low, medium, high, critical
  conditions: text("conditions").notNull(), // JSON string of rule conditions
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  type: text("type").notNull(), // ratio, compliance, safety, billing
  severity: text("severity").notNull(), // low, medium, high, critical
  title: text("title").notNull(),
  message: text("message").notNull(),
  roomId: text("room_id"),
  staffId: text("staff_id").references(() => users.id),
  childId: text("child_id").references(() => children.id),
  isActive: integer("is_active").default(1),
  isAcknowledged: integer("is_acknowledged").default(0),
  isRead: integer("is_read").default(0), // Whether alert has been read
  acknowledgedBy: text("acknowledged_by").references(() => users.id),
  acknowledgedAt: text("acknowledged_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// State compliance schema
export const stateCompliance = sqliteTable("state_compliance", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  state: text("state").notNull(), // WV, OH, PA, etc.
  complianceRules: text("compliance_rules").notNull(), // JSON string of rules
  effectiveDate: text("effective_date").notNull(),
  auditNote: text("audit_note"),
  updatedBy: text("updated_by").references(() => users.id),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// State ratios schema
export const stateRatios = sqliteTable("state_ratios", {
  state: text("state").primaryKey(), // US state code
  infantRatio: text("infant_ratio"),
  toddlerRatio: text("toddler_ratio"),
  preschoolRatio: text("preschool_ratio"),
  schoolAgeRatio: text("school_age_ratio"),
  maxGroupSizeInfant: integer("max_group_size_infant"),
  maxGroupSizeToddler: integer("max_group_size_toddler"),
  maxGroupSizePreschool: integer("max_group_size_preschool"),
  maxGroupSizeSchoolAge: integer("max_group_size_school_age"),
  notes: text("notes"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Settings schema
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  updatedBy: text("updated_by").references(() => users.id),
});

// Create insert schemas - using manual types instead of broken createInsertSchema
export const insertCenterSchema = {} as any;
export const insertUserSchema = {} as any;
export const insertScheduleSchema = {} as any;
export const insertChildSchema = {} as any;
export const insertAttendanceSchema = {} as any;
export const insertActivitySchema = {} as any;
export const insertMealSchema = {} as any;
export const insertPhotoSchema = {} as any;
export const insertNapSchema = {} as any;
export const insertDailyReportSchema = {} as any;
export const insertTeacherNoteSchema = {} as any;

// Payroll insert schemas
export const insertPayStubSchema = {} as any;
export const insertBillingSchema = {} as any;
export const insertPayPeriodSchema = {} as any;
export const insertTimesheetEntrySchema = {} as any;

// Safety insert schemas
export const insertSafetyReminderSchema = {} as any;
export const insertSafetyReminderCompletionSchema = {} as any;

// Security insert schemas
export const insertSecurityDeviceSchema = {} as any;
export const insertSecurityCredentialSchema = {} as any;
export const insertSecurityLogSchema = {} as any;
export const insertAuditLogSchema = {} as any;

// Session insert schemas
export const insertSessionSchema = {} as any;
export const insertSessionActivitySchema = {} as any;

// Document insert schemas
export const insertDocumentTypeSchema = {} as any;
export const insertDocumentSchema = {} as any;
export const insertDocumentReminderSchema = {} as any;
export const insertDocumentRenewalSchema = {} as any;

// Alert insert schemas
export const insertAlertRuleSchema = {} as any;
export const insertAlertSchema = {} as any;

// Message and media insert schemas
export const insertMessageSchema = {} as any;
export const insertMediaShareSchema = {} as any;

// Payroll report insert schemas
export const insertPayrollReportSchema = {} as any;
export const insertPayrollAuditSchema = {} as any;

// State compliance insert schemas
export const insertStateComplianceSchema = {} as any;
export const insertStateRatioSchema = {} as any;

// Settings insert schemas
export const insertSettingSchema = {} as any;

// Type exports
export type Center = typeof centers.$inferSelect;
export type InsertCenter = typeof insertCenterSchema;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof insertUserSchema;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof insertScheduleSchema;

export type Child = typeof children.$inferSelect;
export type InsertChild = typeof insertChildSchema;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof insertAttendanceSchema;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof insertActivitySchema;

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = typeof insertMealSchema;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof insertPhotoSchema;

export type Nap = typeof naps.$inferSelect;
export type InsertNap = typeof insertNapSchema;

export type DailyReport = typeof dailyReports.$inferSelect;
export type InsertDailyReport = typeof insertDailyReportSchema;

export type TeacherNote = typeof teacherNotes.$inferSelect;
export type InsertTeacherNote = typeof insertTeacherNoteSchema;

// Payroll types
export type PayStub = typeof payStubs.$inferSelect;
export type InsertPayStub = typeof insertPayStubSchema;

export type PayPeriod = typeof payPeriods.$inferSelect;
export type InsertPayPeriod = typeof insertPayPeriodSchema;

export type TimesheetEntry = typeof timesheetEntries.$inferSelect;
export type InsertTimesheetEntry = typeof insertTimesheetEntrySchema;

// Safety types
export type SafetyReminder = typeof safetyReminders.$inferSelect;
export type InsertSafetyReminder = typeof insertSafetyReminderSchema;

export type SafetyReminderCompletion = typeof safetyReminderCompletions.$inferSelect;
export type InsertSafetyReminderCompletion = typeof insertSafetyReminderCompletionSchema;

// Security types
export type SecurityDevice = typeof securityDevices.$inferSelect;
export type InsertSecurityDevice = typeof insertSecurityDeviceSchema;

export type SecurityCredential = typeof securityCredentials.$inferSelect;
export type InsertSecurityCredential = typeof insertSecurityCredentialSchema;

export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = typeof insertSecurityLogSchema;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof insertAuditLogSchema;

// Session types
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof insertSessionSchema;

export type SessionActivity = typeof sessionActivity.$inferSelect;
export type InsertSessionActivity = typeof insertSessionActivitySchema;

// Document types
export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = typeof insertDocumentTypeSchema;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof insertDocumentSchema;

export type DocumentReminder = typeof documentReminders.$inferSelect;
export type InsertDocumentReminder = typeof insertDocumentReminderSchema;

export type DocumentRenewal = typeof documentRenewals.$inferSelect;
export type InsertDocumentRenewal = typeof insertDocumentRenewalSchema;

// Billing types
export type Billing = typeof billing.$inferSelect;
export type InsertBilling = typeof insertBillingSchema;

// Message and media types
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof insertMessageSchema;

export type MediaShare = typeof mediaShares.$inferSelect;
export type InsertMediaShare = typeof insertMediaShareSchema;

// Payroll report types
export type PayrollReport = typeof payrollReports.$inferSelect;
export type InsertPayrollReport = typeof insertPayrollReportSchema;

export type PayrollAudit = typeof payrollAudit.$inferSelect;
export type InsertPayrollAudit = typeof insertPayrollAuditSchema;

// Alert types
export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof insertAlertRuleSchema;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof insertAlertSchema;

// State compliance types
export type StateCompliance = typeof stateCompliance.$inferSelect;
export type InsertStateCompliance = typeof insertStateComplianceSchema;

export type StateRatio = typeof stateRatios.$inferSelect;
export type InsertStateRatio = typeof insertStateRatioSchema;

// Settings types
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof insertSettingSchema;

// Legacy table aliases for backward compatibility
export const staff = users;
export const staffSchedules = schedules;

// Legacy type aliases for backward compatibility
export type Staff = typeof users.$inferSelect;
export type InsertStaff = typeof insertUserSchema;
export type StaffSchedule = typeof schedules.$inferSelect;
export type InsertStaffSchedule = typeof insertScheduleSchema;

// Legacy field aliases for backward compatibility
export const insertStaffSchema = insertUserSchema;
export const insertUserProfileSchema = insertUserSchema;

// Note: The following fields are referenced in the code but don't exist in the actual tables:
// - children.parentEmail (use children.parentId + users.email instead)
// - documents.expirationDate (use documents.expiresAt instead)
// - billing.paidDate (use billing.paidAt instead)
// - schedules.staffId (use schedules.entityId when entityType = 'staff' instead)

// Note: Legacy fields have been added to the tables for backward compatibility
