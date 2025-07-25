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
  profilePhotoUrl: text("profile_photo_url"),
  enrollmentDate: timestamp("enrollment_date").default(sql`now()`),
  tuitionRate: integer("tuition_rate"), // Monthly rate in cents
  isActive: boolean("is_active").default(true),
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
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`),
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

// Relations
export const childrenRelations = relations(children, ({ many }) => ({
  attendance: many(attendance),
  mediaShares: many(mediaShares),
  billing: many(billing),
  dailyReports: many(dailyReports),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  schedules: many(staffSchedules),
  messages: many(messages),
  mediaShares: many(mediaShares),
  userRoles: many(userRoles),
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

// Types
export type Child = typeof children.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
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
