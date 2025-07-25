import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ageGroupEnum = pgEnum('age_group', [
  'infant', // 0-16 months
  'young_toddler', // 16 months - 2 years
  'toddler', // 2 years
  'preschool', // 3-5 years
  'school_age', // 5-8 years
  'older_school_age' // 9-12 years
]);

export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  ageGroup: ageGroupEnum("age_group").notNull(),
  room: text("room").notNull(),
  parentName: text("parent_name").notNull(),
  parentEmail: text("parent_email"),
  parentPhone: text("parent_phone"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  // Enhanced profile fields from competitor research
  allergies: text("allergies").array().default(sql`'{}'::text[]`),
  medicalNotes: text("medical_notes"),
  immunizations: text("immunizations").array().default(sql`'{}'::text[]`),
  // Comprehensive Health Information
  medicalConditions: text("medical_conditions").array().default(sql`'{}'::text[]`),
  currentMedications: text("current_medications"), // JSON string for complex medication data
  dietaryRestrictions: text("dietary_restrictions").array().default(sql`'{}'::text[]`),
  foodAllergies: text("food_allergies").array().default(sql`'{}'::text[]`),
  specialCareInstructions: text("special_care_instructions"),
  physicalLimitations: text("physical_limitations"),
  bloodType: text("blood_type"),
  // Healthcare Provider Information
  primaryPhysician: text("primary_physician"),
  physicianPhone: text("physician_phone"),
  pediatricianName: text("pediatrician_name"),
  pediatricianPhone: text("pediatrician_phone"),
  preferredHospital: text("preferred_hospital"),
  insuranceProvider: text("insurance_provider"),
  insurancePolicyNumber: text("insurance_policy_number"),
  insuranceGroupNumber: text("insurance_group_number"),
  // Emergency Medical Information
  emergencyMedicalAuthorization: boolean("emergency_medical_authorization").default(false),
  medicalActionPlan: text("medical_action_plan"), // For conditions like asthma, allergies
  epiPenRequired: boolean("epi_pen_required").default(false),
  inhalerRequired: boolean("inhaler_required").default(false),
  // Immunization Details
  immunizationRecords: text("immunization_records"), // JSON string for detailed records
  immunizationExemptions: text("immunization_exemptions").array().default(sql`'{}'::text[]`),
  nextImmunizationDue: timestamp("next_immunization_due"),
  // Daily Health Monitoring
  lastHealthCheck: timestamp("last_health_check"),
  healthCheckNotes: text("health_check_notes"),
  profilePhotoUrl: text("profile_photo_url"),
  enrollmentDate: timestamp("enrollment_date").default(sql`now()`),
  tuitionRate: integer("tuition_rate"), // Monthly rate in cents
  isActive: boolean("is_active").default(true),
  // Biometric authentication data
  faceDescriptor: text("face_descriptor"), // Serialized face encoding
  fingerprintHash: text("fingerprint_hash"), // WebAuthn credential ID
  biometricEnrolledAt: timestamp("biometric_enrolled_at"),
  biometricEnabled: boolean("biometric_enabled").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  position: text("position").notNull(),
  isActive: boolean("is_active").default(true),
  // Payroll Information
  employeeNumber: text("employee_number").unique(),
  hourlyRate: integer("hourly_rate"), // in cents per hour
  salaryAmount: integer("salary_amount"), // annual salary in cents (for salaried employees)
  payType: text("pay_type").default("hourly"), // "hourly", "salary"
  taxFilingStatus: text("tax_filing_status").default("single"), // "single", "married_jointly", "married_separately", "head_of_household"
  w4Allowances: integer("w4_allowances").default(0),
  additionalTaxWithholding: integer("additional_tax_withholding").default(0), // in cents
  directDepositAccount: text("direct_deposit_account"),
  directDepositRouting: text("direct_deposit_routing"),
  // Biometric authentication data
  faceDescriptor: text("face_descriptor"), // Serialized face encoding
  fingerprintHash: text("fingerprint_hash"), // WebAuthn credential ID
  biometricEnrolledAt: timestamp("biometric_enrolled_at"),
  biometricEnabled: boolean("biometric_enabled").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  checkInTime: timestamp("check_in_time").notNull(),
  checkOutTime: timestamp("check_out_time"),
  checkInBy: text("checked_in_by").notNull(), // Parent/guardian name
  checkOutBy: text("checked_out_by"),
  room: text("room").notNull(),
  date: timestamp("date").notNull(),
  // Enhanced attendance features from competitor research
  checkInPhotoUrl: text("check_in_photo_url"),
  checkOutPhotoUrl: text("check_out_photo_url"),
  notes: text("notes"), // Daily notes for parents
  moodRating: integer("mood_rating"), // 1-5 scale
  activitiesCompleted: text("activities_completed").array().default(sql`'{}'::text[]`),
  // Biometric authentication data
  biometricMethod: text("biometric_method"), // 'face', 'fingerprint', 'manual'
  biometricConfidence: text("biometric_confidence"), // Confidence score as string
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const staffSchedules = pgTable("staff_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  room: text("room").notNull(),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  date: timestamp("date").notNull(),
  isPresent: boolean("is_present").default(false),
  scheduleType: text("schedule_type").default("regular"), // "regular", "substitute", "overtime", "training"
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // "daily", "weekly", "biweekly", "monthly"
  recurringUntil: timestamp("recurring_until"),
  notes: text("notes"),
  approvedBy: varchar("approved_by").references(() => staff.id),
  status: text("status").default("scheduled"), // "scheduled", "confirmed", "cancelled", "completed"
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Enhanced Student/Child Scheduling
export const childSchedules = pgTable("child_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  room: text("room").notNull(),
  date: timestamp("date").notNull(),
  scheduledArrival: timestamp("scheduled_arrival").notNull(),
  scheduledDeparture: timestamp("scheduled_departure").notNull(),
  actualArrival: timestamp("actual_arrival"),
  actualDeparture: timestamp("actual_departure"),
  isPresent: boolean("is_present").default(false),
  scheduleType: text("schedule_type").default("regular"), // "regular", "parttime", "dropin", "field_trip"
  isRecurring: boolean("is_recurring").default(true),
  recurringPattern: text("recurring_pattern").default("weekly"), // "daily", "weekly", "custom"
  recurringDays: text("recurring_days").array().default(sql`'{}'::text[]`), // ["monday", "tuesday", etc.]
  recurringUntil: timestamp("recurring_until"),
  mealPlan: text("meal_plan").array().default(sql`'{}'::text[]`), // ["breakfast", "lunch", "snack"]
  napTime: text("nap_time"), // "early", "regular", "late", "none"
  specialNeeds: text("special_needs"),
  notes: text("notes"),
  parentApproved: boolean("parent_approved").default(false),
  status: text("status").default("scheduled"), // "scheduled", "confirmed", "cancelled", "completed"
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Schedule Templates for recurring schedules
export const scheduleTemplates = pgTable("schedule_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  entityType: text("entity_type").notNull(), // "staff", "child"
  templateData: text("template_data").notNull(), // JSON with schedule details
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => staff.id).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Room capacity and scheduling
export const roomSchedules = pgTable("room_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  room: text("room").notNull(),
  date: timestamp("date").notNull(),
  timeSlot: text("time_slot").notNull(), // "6:00-7:00", "7:00-8:00", etc.
  maxCapacity: integer("max_capacity").notNull(),
  currentOccupancy: integer("current_occupancy").default(0),
  staffRequired: integer("staff_required").notNull(),
  staffAssigned: integer("staff_assigned").default(0),
  isAvailable: boolean("is_available").default(true),
  activities: text("activities").array().default(sql`'{}'::text[]`),
  specialRequirements: text("special_requirements"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// State Compliance Settings for Dynamic US State Support
export const stateCompliance = pgTable("state_compliance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  state: text("state").notNull().default("West Virginia"),
  ratiosData: text("ratios_data").notNull(), // JSON string of ratios
  federalCompliance: text("federal_compliance").array().default(sql`'{"COPPA","HIPAA","FERPA"}'::text[]`),
  additionalRules: text("additional_rules"), // JSON for extra state rules
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
  auditLog: text("audit_log").array().default(sql`'{}'::text[]`), // Track state changes
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'staffing', 'ratio_violation', 'general'
  message: text("message").notNull(),
  room: text("room"),
  severity: text("severity").notNull(), // 'low', 'medium', 'high'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const stateRatios = pgTable("state_ratios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  state: text("state").notNull().unique(),
  sixWeeks: text("six_weeks").notNull(), // 6 weeks old
  nineMonths: text("nine_months").notNull(), // 9 months old
  eighteenMonths: text("eighteen_months").notNull(), // 18 months old
  twentySevenMonths: text("twenty_seven_months").notNull(), // 27 months old
  threeYears: text("three_years").notNull(), // 3 years old
  fourYears: text("four_years").notNull(), // 4 years old
  fiveYears: text("five_years").notNull(), // 5 years old
  sixYears: text("six_years").notNull(), // 6 years old
  sevenYears: text("seven_years").notNull(), // 7 years old
  eightNineYears: text("eight_nine_years").notNull(), // 8-9 years old
  tenPlusYears: text("ten_plus_years").notNull(), // 10+ years old
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Parent Communication System (like Brightwheel/Lillio)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => staff.id).notNull(),
  recipientType: text("recipient_type").notNull(), // "parent", "staff", "broadcast"
  recipientId: varchar("recipient_id"), // childId for parent messages
  subject: text("subject"),
  content: text("content").notNull(),
  attachmentUrls: text("attachment_urls").array().default(sql`'{}'::text[]`),
  isRead: boolean("is_read").default(false),
  priority: text("priority").default("normal"), // "low", "normal", "high", "urgent"
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Photo/Video Sharing (like Brightwheel)
export const mediaShares = pgTable("media_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(), // "photo", "video"
  caption: text("caption"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Billing System (QuickBooks integration ready)
export const billing = pgTable("billing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  attendanceDays: integer("attendance_days").notNull(),
  tuitionAmount: integer("tuition_amount").notNull(), // in cents
  extraFees: integer("extra_fees").default(0), // in cents
  totalAmount: integer("total_amount").notNull(), // in cents
  status: text("status").default("pending"), // "pending", "sent", "paid", "overdue"
  quickbooksId: text("quickbooks_id"), // For QB integration
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Daily Reports (automated like Brightwheel)
export const dailyReports = pgTable("daily_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  date: timestamp("date").notNull(),
  attendanceStatus: text("attendance_status").notNull(), // "present", "absent", "late"
  meals: text("meals").array().default(sql`'{}'::text[]`), // ["breakfast", "lunch", "snack"]
  naps: text("nap_notes"),
  activities: text("activities").array().default(sql`'{}'::text[]`),
  behaviorNotes: text("behavior_notes"),
  photoUrls: text("photo_urls").array().default(sql`'{}'::text[]`),
  isGenerated: boolean("is_generated").default(false),
  sentToParent: boolean("sent_to_parent").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Role-based Access Control
export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  role: text("role").notNull(), // "admin", "teacher", "assistant", "parent"
  permissions: text("permissions").array().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Payroll System Tables
export const timesheetEntries = pgTable("timesheet_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  breakMinutes: integer("break_minutes").default(0),
  regularHours: integer("regular_hours").default(0), // in minutes
  overtimeHours: integer("overtime_hours").default(0), // in minutes
  totalHours: integer("total_hours").default(0), // in minutes
  date: timestamp("date").notNull(),
  notes: text("notes"),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => staff.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const payPeriods = pgTable("pay_periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  payDate: timestamp("pay_date").notNull(),
  status: text("status").default("open"), // "open", "processing", "paid", "closed"
  totalGrossPay: integer("total_gross_pay").default(0), // in cents
  totalNetPay: integer("total_net_pay").default(0), // in cents
  totalTaxes: integer("total_taxes").default(0), // in cents
  processedBy: varchar("processed_by").references(() => staff.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const payStubs = pgTable("pay_stubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  payPeriodId: varchar("pay_period_id").references(() => payPeriods.id).notNull(),
  grossPay: integer("gross_pay").notNull(), // in cents
  regularPay: integer("regular_pay").notNull(), // in cents
  overtimePay: integer("overtime_pay").default(0), // in cents
  federalTax: integer("federal_tax").default(0), // in cents
  stateTax: integer("state_tax").default(0), // in cents
  socialSecurityTax: integer("social_security_tax").default(0), // in cents
  medicareTax: integer("medicare_tax").default(0), // in cents
  healthInsurance: integer("health_insurance").default(0), // in cents
  retirement401k: integer("retirement_401k").default(0), // in cents
  otherDeductions: integer("other_deductions").default(0), // in cents
  netPay: integer("net_pay").notNull(), // in cents
  regularHours: integer("regular_hours").notNull(), // in minutes
  overtimeHours: integer("overtime_hours").default(0), // in minutes
  totalHours: integer("total_hours").notNull(), // in minutes
  payStubPdfUrl: text("pay_stub_pdf_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const payrollReports = pgTable("payroll_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payPeriodId: varchar("pay_period_id").references(() => payPeriods.id).notNull(),
  reportType: text("report_type").notNull(), // "summary", "tax_report", "detailed"
  reportData: text("report_data").notNull(), // JSON string with report details
  generatedBy: varchar("generated_by").references(() => staff.id).notNull(),
  reportPdfUrl: text("report_pdf_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const payrollAudit = pgTable("payroll_audit", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(), // "timesheet_edit", "payroll_processed", "rate_change"
  entityId: varchar("entity_id").notNull(), // ID of the affected record
  entityType: text("entity_type").notNull(), // "timesheet", "pay_stub", "staff"
  oldValues: text("old_values"), // JSON string of previous values
  newValues: text("new_values"), // JSON string of new values
  performedBy: varchar("performed_by").references(() => staff.id).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Relations
export const childrenRelations = relations(children, ({ many }) => ({
  attendance: many(attendance),
  mediaShares: many(mediaShares),
  billing: many(billing),
  dailyReports: many(dailyReports),
  schedules: many(childSchedules),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  schedules: many(staffSchedules),
  messages: many(messages),
  mediaShares: many(mediaShares),
  userRoles: many(userRoles),
  timesheetEntries: many(timesheetEntries),
  payStubs: many(payStubs),
}));

export const childScheduleRelations = relations(childSchedules, ({ one }) => ({
  child: one(children, {
    fields: [childSchedules.childId],
    references: [children.id],
  }),
}));

export const scheduleTemplateRelations = relations(scheduleTemplates, ({ one }) => ({
  creator: one(staff, {
    fields: [scheduleTemplates.createdBy],
    references: [staff.id],
  }),
}));

export const timesheetRelations = relations(timesheetEntries, ({ one }) => ({
  staff: one(staff, {
    fields: [timesheetEntries.staffId],
    references: [staff.id],
  }),
  approver: one(staff, {
    fields: [timesheetEntries.approvedBy],
    references: [staff.id],
  }),
}));

export const payPeriodRelations = relations(payPeriods, ({ many, one }) => ({
  payStubs: many(payStubs),
  reports: many(payrollReports),
  processor: one(staff, {
    fields: [payPeriods.processedBy],
    references: [staff.id],
  }),
}));

export const payStubRelations = relations(payStubs, ({ one }) => ({
  staff: one(staff, {
    fields: [payStubs.staffId],
    references: [staff.id],
  }),
  payPeriod: one(payPeriods, {
    fields: [payStubs.payPeriodId],
    references: [payPeriods.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  child: one(children, {
    fields: [attendance.childId],
    references: [children.id],
  }),
}));

export const staffSchedulesRelations = relations(staffSchedules, ({ one }) => ({
  staff: one(staff, {
    fields: [staffSchedules.staffId],
    references: [staff.id],
  }),
}));

// Insert schemas
export const insertChildSchema = createInsertSchema(children).omit({
  id: true,
  createdAt: true,
  enrollmentDate: true,
  faceDescriptor: true,
  fingerprintHash: true,
  biometricEnrolledAt: true,
  biometricEnabled: true,
  lastHealthCheck: true,
}).extend({
  // Enhanced validation for health information
  bloodType: z.string().optional().refine((val) => 
    !val || ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(val), 
    { message: "Invalid blood type" }
  ),
  currentMedications: z.string().optional().refine((val) => {
    if (!val) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Current medications must be valid JSON" }),
  immunizationRecords: z.string().optional().refine((val) => {
    if (!val) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Immunization records must be valid JSON" }),
  physicianPhone: z.string().optional().refine((val) => 
    !val || /^\(\d{3}\) \d{3}-\d{4}$/.test(val), 
    { message: "Phone number must be in format (XXX) XXX-XXXX" }
  ),
  pediatricianPhone: z.string().optional().refine((val) => 
    !val || /^\(\d{3}\) \d{3}-\d{4}$/.test(val), 
    { message: "Phone number must be in format (XXX) XXX-XXXX" }
  ),
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertStaffScheduleSchema = createInsertSchema(staffSchedules).omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertStateRatioSchema = createInsertSchema(stateRatios).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertMediaShareSchema = createInsertSchema(mediaShares).omit({
  id: true,
  createdAt: true,
});

export const insertBillingSchema = createInsertSchema(billing).omit({
  id: true,
  createdAt: true,
});

export const insertDailyReportSchema = createInsertSchema(dailyReports).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

export const insertStateComplianceSchema = createInsertSchema(stateCompliance).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertTimesheetEntrySchema = createInsertSchema(timesheetEntries).omit({
  id: true,
  createdAt: true,
});

export const insertPayPeriodSchema = createInsertSchema(payPeriods).omit({
  id: true,
  createdAt: true,
});

export const insertPayStubSchema = createInsertSchema(payStubs).omit({
  id: true,
  createdAt: true,
});

export const insertPayrollReportSchema = createInsertSchema(payrollReports).omit({
  id: true,
  createdAt: true,
});

export const insertPayrollAuditSchema = createInsertSchema(payrollAudit).omit({
  id: true,
  createdAt: true,
});

// Types
export type Child = typeof children.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

// Health Information Types
export interface MedicationRecord {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface ImmunizationRecord {
  vaccine: string;
  dateAdministered: string;
  nextDueDate?: string;
  provider: string;
  lotNumber?: string;
  site?: string;
  notes?: string;
}

export interface HealthCheckRecord {
  date: string;
  temperature?: number;
  symptoms?: string[];
  checkedBy: string;
  cleared: boolean;
  notes?: string;
}
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type StaffSchedule = typeof staffSchedules.$inferSelect;
export type InsertStaffSchedule = z.infer<typeof insertStaffScheduleSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type StateRatio = typeof stateRatios.$inferSelect;
export type InsertStateRatio = z.infer<typeof insertStateRatioSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MediaShare = typeof mediaShares.$inferSelect;
export type InsertMediaShare = z.infer<typeof insertMediaShareSchema>;
export type Billing = typeof billing.$inferSelect;
export type InsertBilling = z.infer<typeof insertBillingSchema>;
export type DailyReport = typeof dailyReports.$inferSelect;
export type InsertDailyReport = z.infer<typeof insertDailyReportSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type StateCompliance = typeof stateCompliance.$inferSelect;
export type InsertStateCompliance = z.infer<typeof insertStateComplianceSchema>;
export type TimesheetEntry = typeof timesheetEntries.$inferSelect;
export type InsertTimesheetEntry = z.infer<typeof insertTimesheetEntrySchema>;
export type PayPeriod = typeof payPeriods.$inferSelect;
export type InsertPayPeriod = z.infer<typeof insertPayPeriodSchema>;
export type PayStub = typeof payStubs.$inferSelect;
export type InsertPayStub = z.infer<typeof insertPayStubSchema>;
export type PayrollReport = typeof payrollReports.$inferSelect;
export type InsertPayrollReport = z.infer<typeof insertPayrollReportSchema>;
export type PayrollAudit = typeof payrollAudit.$inferSelect;
export type InsertPayrollAudit = z.infer<typeof insertPayrollAuditSchema>;

// Physical Security System Tables
export const securityDevices = pgTable("security_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // keypad, rfid, biometric, mobile, intercom, magnetic
  location: text("location").notNull(), // main_entrance, classroom_a, etc.
  connectionType: text("connection_type").notNull(), // serial, network, bluetooth, gpio
  connectionConfig: text("connection_config").notNull(), // JSON config (encrypted)
  isEnabled: boolean("is_enabled").default(true),
  unlockDuration: integer("unlock_duration").default(5), // seconds
  failSafeMode: text("fail_safe_mode").default("secure"), // secure, unlock
  lastPing: timestamp("last_ping"),
  status: text("status").default("offline"), // online, offline, error
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const securityCredentials = pgTable("security_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // links to parent/staff
  deviceId: varchar("device_id").references(() => securityDevices.id).notNull(),
  credentialType: text("credential_type").notNull(), // pin, rfid, biometric, mobile
  credentialData: text("credential_data").notNull(), // encrypted data
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // for temporary access
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const securityLogs = pgTable("security_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => securityDevices.id).notNull(),
  userId: text("user_id"), // null for failed attempts
  action: text("action").notNull(), // unlock, lock, attempt_failed, system_error
  method: text("method"), // pin, rfid, biometric, mobile, manual
  success: boolean("success").notNull(),
  details: text("details"), // additional info, error messages
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const securityZones = pgTable("security_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  deviceIds: text("device_ids").array().default(sql`'{}'::text[]`), // devices in this zone
  accessRules: text("access_rules").notNull(), // JSON rules
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Security Schemas
export const insertSecurityDeviceSchema = createInsertSchema(securityDevices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastPing: true,
  status: true,
});
export type InsertSecurityDevice = z.infer<typeof insertSecurityDeviceSchema>;
export type SecurityDevice = typeof securityDevices.$inferSelect;

export const insertSecurityCredentialSchema = createInsertSchema(securityCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSecurityCredential = z.infer<typeof insertSecurityCredentialSchema>;
export type SecurityCredential = typeof securityCredentials.$inferSelect;

export const insertSecurityLogSchema = createInsertSchema(securityLogs).omit({
  id: true,
  timestamp: true,
});
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;
export type SecurityLog = typeof securityLogs.$inferSelect;

export const insertSecurityZoneSchema = createInsertSchema(securityZones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSecurityZone = z.infer<typeof insertSecurityZoneSchema>;
export type SecurityZone = typeof securityZones.$inferSelect;

// Safety Reminders and Alerts System
export const safetyReminders = pgTable('safety_reminders', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'fire_safety', 'equipment', 'drills', 'maintenance', 'inspection'
  priority: text('priority').notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  frequency: text('frequency').notNull(), // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'
  customInterval: integer('custom_interval'), // For custom frequency (in days)
  nextDueDate: timestamp('next_due_date').notNull(),
  lastCompletedDate: timestamp('last_completed_date'),
  isActive: boolean('is_active').default(true).notNull(),
  isPaused: boolean('is_paused').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: text('created_by').notNull(),
  assignedTo: text('assigned_to'), // Staff member responsible
  completionNotes: text('completion_notes'),
  alertDaysBefore: integer('alert_days_before').default(3).notNull(), // Alert X days before due
});

export const safetyReminderCompletions = pgTable('safety_reminder_completions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  reminderId: text('reminder_id').notNull().references(() => safetyReminders.id),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
  completedBy: text('completed_by').notNull(),
  notes: text('notes'),
  nextScheduledDate: timestamp('next_scheduled_date'),
  attachments: text('attachments').array().default(sql`'{}'::text[]`), // File paths for completion evidence
});

// Safety reminder relations
export const safetyReminderRelations = relations(safetyReminders, ({ many }) => ({
  completions: many(safetyReminderCompletions),
}));

export const safetyReminderCompletionRelations = relations(safetyReminderCompletions, ({ one }) => ({
  reminder: one(safetyReminders, {
    fields: [safetyReminderCompletions.reminderId],
    references: [safetyReminders.id],
  }),
}));

// Safety reminder schemas
export const insertSafetyReminderSchema = createInsertSchema(safetyReminders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  category: z.enum(['fire_safety', 'equipment', 'drills', 'maintenance', 'inspection']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  customInterval: z.number().min(1).optional(),
  alertDaysBefore: z.number().min(0).max(30),
});

export const insertSafetyReminderCompletionSchema = createInsertSchema(safetyReminderCompletions).omit({
  id: true,
  completedAt: true,
});

export type SafetyReminder = typeof safetyReminders.$inferSelect;
export type InsertSafetyReminder = z.infer<typeof insertSafetyReminderSchema>;
export type SafetyReminderCompletion = typeof safetyReminderCompletions.$inferSelect;
export type InsertSafetyReminderCompletion = z.infer<typeof insertSafetyReminderCompletionSchema>;
