import { staff, staffSchedules, children, attendance, securityDevices, securityCredentials, securityLogs, alerts, dailyReports, type Staff, type InsertStaff, type StaffSchedule, type InsertStaffSchedule } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, isNull, sql } from "drizzle-orm";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IStorage {
  // Staff
  getStaff(id: string): Promise<Staff | undefined>;
  getAllStaff(options?: PaginationOptions): Promise<PaginatedResult<Staff>>;
  getActiveStaff(options?: PaginationOptions): Promise<PaginatedResult<Staff>>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff>;
  
  // Staff Schedules
  getStaffSchedule(id: string): Promise<StaffSchedule | undefined>;
  getTodaysStaffSchedules(): Promise<(StaffSchedule & { staff: Staff })[]>;
  getStaffSchedulesByDate(date: Date): Promise<(StaffSchedule & { staff: Staff })[]>;
  createStaffSchedule(schedule: InsertStaffSchedule): Promise<StaffSchedule>;
  updateStaffSchedule(id: string, schedule: Partial<InsertStaffSchedule>): Promise<StaffSchedule>;
  markStaffPresent(scheduleId: string, actualStart: Date): Promise<StaffSchedule>;
  markStaffEnd(scheduleId: string, actualEnd: Date): Promise<StaffSchedule>;
  
  // Children
  getChild(id: string): Promise<any | undefined>;
  createChild(child: any): Promise<any>;
  clearAllChildren(): Promise<void>;
  
  // Staff
  clearAllStaff(): Promise<void>;
  
  // Attendance
  createAttendance(attendance: any): Promise<any>;
  clearAllAttendance(): Promise<void>;
  
  // Security
  createSecurityDevice(device: any): Promise<any>;
  getSecurityDevice(id: string): Promise<any>;
  getAllSecurityDevices(): Promise<any[]>;
  getSecurityDevicesForLocation(location: string): Promise<any[]>;
  updateSecurityDeviceStatus(id: string, status: string): Promise<void>;
  createSecurityCredential(credential: any): Promise<any>;
  getSecurityCredentialsForDevice(deviceId: string, type: string): Promise<any[]>;
  createSecurityLog(log: any): Promise<any>;
  getSecurityLogs(limit: number): Promise<any[]>;
  
  // Parent
  getParentChildren(parentId: string): Promise<any[]>;
  getTodaysAttendance(): Promise<any[]>;
  
  // Profile
  getUserProfile(userId: string): Promise<any>;
  createUserProfile(profile: any): Promise<any>;
  updateUserProfile(userId: string, profile: any): Promise<any>;
  getUserProfileByUsername(username: string): Promise<any>;
  
  // Settings
  getAllSettings(): Promise<any[]>;
  createOrUpdateSetting(key: string, value: any): Promise<any>;
  getStateCompliance(): Promise<any>;
  updateStateCompliance(state: string, auditNote: string): Promise<any>;
  
  // Teacher Notes
  addTeacherNote(note: any): Promise<any>;
  getTeacherNotes(childId: string, date: Date): Promise<any[]>;
  
  // Parent Management
  getAllChildren(options?: any): Promise<any[]>;
  getParentByEmail(email: string): Promise<any>;
  createParent(parent: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Staff methods
  async getStaff(id: string): Promise<Staff | undefined> {
    const result = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    return result[0];
  }

  async getAllStaff(options: PaginationOptions = {}): Promise<PaginatedResult<Staff>> {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    
    const [data, totalResult] = await Promise.all([
      db.select().from(staff).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(staff)
    ]);
    
    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);
    
    return { data, total, page, limit, totalPages };
  }

  async getActiveStaff(options: PaginationOptions = {}): Promise<PaginatedResult<Staff>> {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    
    const [data, totalResult] = await Promise.all([
      db.select().from(staff).where(eq(staff.isActive, 1)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(staff).where(eq(staff.isActive, 1))
    ]);
    
    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);
    
    return { data, total, page, limit, totalPages };
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(staffData).returning();
    return newStaff;
  }

  async updateStaff(id: string, staffData: Partial<InsertStaff>): Promise<Staff> {
    const [updatedStaff] = await db.update(staff).set(staffData).where(eq(staff.id, id)).returning();
    return updatedStaff;
  }

  // Staff Schedule methods
  async getStaffSchedule(id: string): Promise<StaffSchedule | undefined> {
    const result = await db.select().from(staffSchedules).where(eq(staffSchedules.id, id)).limit(1);
    return result[0];
  }

  async getTodaysStaffSchedules(): Promise<(StaffSchedule & { staff: Staff })[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select({
        ...staffSchedules,
        staff: staff
      })
      .from(staffSchedules)
      .innerJoin(staff, eq(staffSchedules.staffId, staff.id))
      .where(eq(staffSchedules.date, today));
  }

  async getStaffSchedulesByDate(date: Date): Promise<(StaffSchedule & { staff: Staff })[]> {
    const dateStr = date.toISOString().split('T')[0];
    return await db
      .select({
        ...staffSchedules,
        staff: staff
      })
      .from(staffSchedules)
      .innerJoin(staff, eq(staffSchedules.staffId, staff.id))
      .where(eq(staffSchedules.date, dateStr));
  }

  async createStaffSchedule(scheduleData: InsertStaffSchedule): Promise<StaffSchedule> {
    // Validate that scheduled start time is not in the past (allow brief grace period)
    const now = new Date();
    const scheduledStart = new Date(scheduleData.scheduledStart);
    const graceMs = 2 * 60 * 1000; // 2 minutes to account for client/server clock and tz serialization

    if (scheduledStart.getTime() < now.getTime() - graceMs) {
      throw new Error("Cannot schedule staff for a time in the past. Please select a start time after the current time.");
    }

    // Validate that end time is after start time
    const scheduledEnd = new Date(scheduleData.scheduledEnd);
    if (scheduledEnd <= scheduledStart) {
      throw new Error("End time must be after start time.");
    }

    const [newSchedule] = await db.insert(staffSchedules).values(scheduleData).returning();
    return newSchedule;
  }

  async updateStaffSchedule(id: string, scheduleData: Partial<InsertStaffSchedule>): Promise<StaffSchedule> {
    const [updatedSchedule] = await db.update(staffSchedules).set(scheduleData).where(eq(staffSchedules.id, id)).returning();
    return updatedSchedule;
  }

  async markStaffPresent(scheduleId: string, actualStart: Date): Promise<StaffSchedule> {
    const [updatedSchedule] = await db
      .update(staffSchedules)
      .set({ 
        actualStart: actualStart.toISOString(),
        isPresent: 1 
      })
      .where(eq(staffSchedules.id, scheduleId))
      .returning();
    return updatedSchedule;
  }

  async markStaffEnd(scheduleId: string, actualEnd: Date): Promise<StaffSchedule> {
    const [updatedSchedule] = await db
      .update(staffSchedules)
      .set({ actualEnd: actualEnd.toISOString() })
      .where(eq(staffSchedules.id, scheduleId))
      .returning();
    return updatedSchedule;
  }

  // Children methods
  async getChild(id: string): Promise<any | undefined> {
    const result = await db.select().from(children).where(eq(children.id, id)).limit(1);
    return result[0];
  }

  async createChild(childData: any): Promise<any> {
    const [newChild] = await db.insert(children).values(childData).returning();
    return newChild;
  }

  async getChildrenCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(children).where(eq(children.isActive, 1));
    return result[0]?.count || 0;
  }

  async clearAllChildren(): Promise<void> {
    await db.delete(children);
  }

  async clearAllStaff(): Promise<void> {
    await db.delete(staff);
  }

  // Attendance methods
  async createAttendance(attendanceData: any): Promise<any> {
    const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return newAttendance;
  }

  async clearAllAttendance(): Promise<void> {
    await db.delete(attendance);
  }

  // Alert methods
  async createAlert(alertData: any): Promise<any> {
    const [newAlert] = await db.insert(alerts).values(alertData).returning();
    return newAlert;
  }

  async getAttendanceByDate(date: Date): Promise<any[]> {
    return await db.select().from(attendance)
      .where(eq(attendance.date, date.toISOString().split('T')[0]));
  }

  // Security methods
  async createSecurityDevice(deviceData: any): Promise<any> {
    const [newDevice] = await db.insert(securityDevices).values(deviceData).returning();
    return newDevice;
  }

  async getSecurityDevice(id: string): Promise<any> {
    const result = await db.select().from(securityDevices).where(eq(securityDevices.id, id)).limit(1);
    return result[0];
  }

  async getAllSecurityDevices(): Promise<any[]> {
    return await db.select().from(securityDevices);
  }

  async getSecurityDevicesForLocation(location: string): Promise<any[]> {
    return await db.select().from(securityDevices).where(eq(securityDevices.location, location));
  }

  async updateSecurityDeviceStatus(id: string, status: string): Promise<void> {
    await db.update(securityDevices).set({ isActive: status === 'online' ? 1 : 0 }).where(eq(securityDevices.id, id));
  }

  async createSecurityCredential(credentialData: any): Promise<any> {
    const [newCredential] = await db.insert(securityCredentials).values(credentialData).returning();
    return newCredential;
  }

  async getSecurityCredentialsForDevice(deviceId: string, type: string): Promise<any[]> {
    return await db.select().from(securityCredentials)
      .where(and(
        eq(securityCredentials.deviceId, deviceId),
        eq(securityCredentials.credentialType, type)
      ));
  }

  async createSecurityLog(logData: any): Promise<any> {
    const [newLog] = await db.insert(securityLogs).values(logData).returning();
    return newLog;
  }

  async getSecurityLogs(limit: number): Promise<any[]> {
    return await db.select().from(securityLogs).limit(limit).orderBy(desc(securityLogs.timestamp));
  }

  // Daily report methods
  async getChildDayData(childId: string, date: Date): Promise<any> {
    const result = await db.select().from(attendance)
      .where(and(
        eq(attendance.childId, childId),
        eq(attendance.date, date.toISOString().split('T')[0])
      ))
      .limit(1);
    return result[0];
  }

  async getDailyReport(childId: string, date: Date): Promise<any> {
    const result = await db.select().from(dailyReports)
      .where(and(
        eq(dailyReports.childId, childId),
        eq(dailyReports.date, date.toISOString().split('T')[0])
      ))
      .limit(1);
    return result[0];
  }

  async updateDailyReport(id: string, data: any): Promise<void> {
    await db.update(dailyReports).set(data).where(eq(dailyReports.id, id));
  }

  async createDailyReport(data: any): Promise<any> {
    const [newReport] = await db.insert(dailyReports).values(data).returning();
    return newReport;
  }

  async getPresentChildrenForDate(date: Date): Promise<any[]> {
    return await db.select().from(attendance)
      .where(and(
        eq(attendance.date, date.toISOString().split('T')[0]),
        sql`${attendance.checkOutTime} IS NULL`
      ));
  }

  // Background job methods
  async getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return await db.select().from(attendance)
      .where(and(
        gte(attendance.date, startDate.toISOString().split('T')[0]),
        lte(attendance.date, endDate.toISOString().split('T')[0])
      ));
  }

  // Parent methods
  async getParentChildren(parentId: string): Promise<any[]> {
    return await db.select().from(children)
      .where(eq(children.parentId, parentId));
  }

  async getTodaysAttendance(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db.select().from(attendance)
      .where(eq(attendance.date, today));
  }

  // Profile methods
  async getUserProfile(userId: string): Promise<any> {
    // This would typically query a user_profiles table
    // For now, return basic user info
    return await this.getStaff(userId);
  }

  async createUserProfile(profile: any): Promise<any> {
    // This would typically insert into a user_profiles table
    // For now, return the profile data
    return profile;
  }

  async updateUserProfile(userId: string, profile: any): Promise<any> {
    // This would typically update a user_profiles table
    // For now, return the updated profile
    return { ...profile, userId };
  }

  async getUserProfileByUsername(username: string): Promise<any> {
    // This would typically query by username
    // For now, return null
    return null;
  }

  // Settings methods
  async getAllSettings(): Promise<any[]> {
    // This would typically query a settings table
    // For now, return empty array
    return [];
  }

  async createOrUpdateSetting(key: string, value: any): Promise<any> {
    // This would typically insert/update a settings table
    // For now, return the setting
    return { key, value };
  }

  async getStateCompliance(): Promise<any> {
    // This would typically query state compliance rules
    // For now, return empty object
    return {};
  }

  async updateStateCompliance(state: string, auditNote: string): Promise<any> {
    // This would typically update state compliance rules
    // For now, return the update
    return { state, auditNote };
  }

  // Teacher Notes methods
  async addTeacherNote(note: any): Promise<any> {
    // This would typically insert into a teacher_notes table
    // For now, return the note
    return note;
  }

  async getTeacherNotes(childId: string, date: Date): Promise<any[]> {
    // This would typically query a teacher_notes table
    // For now, return empty array
    return [];
  }

  // Parent Management methods
  async getAllChildren(options?: any): Promise<any[]> {
    const { page = 1, limit = 10 } = options || {};
    const offset = (page - 1) * limit;
    
    const [data, totalResult] = await Promise.all([
      db.select().from(children).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(children)
    ]);
    
    return data;
  }

  async getParentByEmail(email: string): Promise<any> {
    // This would typically query a parents table by email
    // For now, return null
    return null;
  }

  async createParent(parent: any): Promise<any> {
    // This would typically insert into a parents table
    // For now, return the parent data
    return parent;
  }

  // Alert methods
  async getUnreadAlerts(): Promise<any[]> {
    return await db.select().from(alerts).where(eq(alerts.isRead, 0));
  }

  async getAllAlerts(): Promise<any[]> {
    return await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async markAlertAsRead(id: string): Promise<any> {
    const [updatedAlert] = await db.update(alerts).set({ isRead: 1 }).where(eq(alerts.id, id)).returning();
    return updatedAlert;
  }

  async deleteAlert(id: string): Promise<void> {
    await db.delete(alerts).where(eq(alerts.id, id));
  }

  // Attendance methods
  async getCurrentlyPresentChildren(): Promise<any[]> {
    return await db.select().from(attendance)
      .where(sql`${attendance.checkOutTime} IS NULL`);
  }

  async checkOutChild(id: string, checkOutBy: string, checkOutTime: Date): Promise<any> {
    const [updatedAttendance] = await db.update(attendance)
      .set({ 
        checkOutTime: checkOutTime.toISOString(),
        checkOutBy 
      })
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance;
  }

  // Children methods
  async getActiveChildren(options?: any): Promise<any[]> {
    const { page = 1, limit = 10 } = options || {};
    const offset = (page - 1) * limit;
    
    const [data, totalResult] = await Promise.all([
      db.select().from(children)
        .where(eq(children.isActive, 1))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(children).where(eq(children.isActive, 1))
    ]);
    
    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return data;
  }

  async updateChild(id: string, data: any): Promise<any> {
    const [updatedChild] = await db.update(children).set(data).where(eq(children.id, id)).returning();
    return updatedChild;
  }

  // Auth methods
  async updateParentLastLogin(parentId: string): Promise<void> {
    // This would typically update a parents table
    // For now, do nothing
  }
}

// Export a default storage instance
export const storage = new DatabaseStorage();
