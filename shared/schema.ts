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

// Relations
export const childrenRelations = relations(children, ({ many }) => ({
  attendance: many(attendance),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  schedules: many(staffSchedules),
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
