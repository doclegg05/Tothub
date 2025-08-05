import { children, staff, attendance, staffSchedules, settings, alerts, stateRatios, stateCompliance, parents, userProfiles, type Child, type InsertChild, type Staff, type InsertStaff, type Attendance, type InsertAttendance, type StaffSchedule, type InsertStaffSchedule, type Setting, type InsertSetting, type Alert, type InsertAlert, type StateRatio, type InsertStateRatio, type StateCompliance, type InsertStateCompliance, type Parent, type InsertParent, type UserProfile, type InsertUserProfile } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, isNull, sql } from "drizzle-orm";
import { memoryCache } from "./services/simpleMemoryCache";

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
  // Children
  getChild(id: string): Promise<Child | undefined>;
  getAllChildren(options?: PaginationOptions): Promise<PaginatedResult<Child>>;
  getActiveChildren(options?: PaginationOptions): Promise<PaginatedResult<Child>>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: string, child: Partial<InsertChild>): Promise<Child>;
  
  // Staff
  getStaff(id: string): Promise<Staff | undefined>;
  getAllStaff(options?: PaginationOptions): Promise<PaginatedResult<Staff>>;
  getActiveStaff(options?: PaginationOptions): Promise<PaginatedResult<Staff>>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff>;
  
  // Attendance
  getAttendance(id: string): Promise<Attendance | undefined>;
  getTodaysAttendance(): Promise<Attendance[]>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  getAttendanceByChild(childId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]>;
  getCurrentlyPresentChildren(): Promise<(Attendance & { child: Child })[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance>;
  checkOutChild(attendanceId: string, checkOutBy: string, checkOutTime: Date): Promise<Attendance>;
  
  // Staff Schedules
  getStaffSchedule(id: string): Promise<StaffSchedule | undefined>;
  getTodaysStaffSchedules(): Promise<(StaffSchedule & { staff: Staff })[]>;
  getStaffSchedulesByDate(date: Date): Promise<(StaffSchedule & { staff: Staff })[]>;
  createStaffSchedule(schedule: InsertStaffSchedule): Promise<StaffSchedule>;
  updateStaffSchedule(id: string, schedule: Partial<InsertStaffSchedule>): Promise<StaffSchedule>;
  markStaffPresent(scheduleId: string, actualStart: Date): Promise<StaffSchedule>;
  markStaffEnd(scheduleId: string, actualEnd: Date): Promise<StaffSchedule>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  createOrUpdateSetting(key: string, value: string): Promise<Setting>;
  
  // Alerts
  getAlert(id: string): Promise<Alert | undefined>;
  getUnreadAlerts(): Promise<Alert[]>;
  getAllAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: string): Promise<Alert>;
  deleteAlert(id: string): Promise<void>;
  
  // State Ratios
  getStateRatio(state: string): Promise<StateRatio | undefined>;
  getAllStateRatios(): Promise<StateRatio[]>;
  createOrUpdateStateRatio(ratio: InsertStateRatio): Promise<StateRatio>;
  seedStateRatios(): Promise<void>;
  
  // State Compliance
  getStateCompliance(): Promise<StateCompliance | undefined>;
  getCurrentState(): Promise<string>;
  updateStateCompliance(state: string, auditNote?: string): Promise<StateCompliance>;
  initializeDefaultState(): Promise<StateCompliance>;
  
  // Parents
  getParent(id: string): Promise<Parent | undefined>;
  getParentByEmail(email: string): Promise<Parent | undefined>;
  getParentByUsername(username: string): Promise<Parent | undefined>;
  createParent(parent: InsertParent): Promise<Parent>;
  updateParent(id: string, parent: Partial<InsertParent>): Promise<Parent>;
  updateParentLastLogin(id: string): Promise<Parent>;
  getParentChildren(parentId: string): Promise<Child[]>;
  
  // Daily Reports
  getDailyReport(childId: string, date: Date): Promise<any | undefined>;
  createDailyReport(report: any): Promise<any>;
  updateDailyReport(id: string, updates: any): Promise<any>;
  getChildDayData(childId: string, date: Date): Promise<any>;
  getPresentChildrenForDate(date: Date): Promise<Attendance[]>;
  
  // Teacher Notes
  addTeacherNote(note: any): Promise<any>;
  getTeacherNotes(childId: string, date: Date): Promise<any[]>;
  
  // User Profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  getUserProfileByUsername(username: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
}

export class DatabaseStorage implements IStorage {
  // Children
  async getChild(id: string): Promise<Child | undefined> {
    // Check cache first
    const cached = memoryCache.getChild(id);
    if (cached) return cached;

    const [child] = await db.select().from(children).where(eq(children.id, id));
    if (child) {
      memoryCache.setChild(id, child);
    }
    return child || undefined;
  }

  async getAllChildren(options: PaginationOptions = {}): Promise<PaginatedResult<Child>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 50); // Max 100 items per page
    const offset = (page - 1) * limit;

    // Get total count
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(children);
    
    // Get paginated data
    const data = await db.select()
      .from(children)
      .orderBy(asc(children.firstName), asc(children.lastName))
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit)
    };
  }

  async getActiveChildren(options: PaginationOptions = {}): Promise<PaginatedResult<Child>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 50);
    const offset = (page - 1) * limit;

    // Cache key for paginated results
    const cacheKey = `active-children-${page}-${limit}`;
    const cached = memoryCache.getAttendance(cacheKey);
    if (cached) return cached;

    // Get total count
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(children)
      .where(eq(children.isActive, true));
    
    // Get paginated data
    const data = await db.select()
      .from(children)
      .where(eq(children.isActive, true))
      .orderBy(asc(children.firstName), asc(children.lastName))
      .limit(limit)
      .offset(offset);

    const result = {
      data,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit)
    };

    // Cache the result
    memoryCache.setAttendance(cacheKey, result);
    
    return result;
  }

  async createChild(child: InsertChild): Promise<Child> {
    const [newChild] = await db.insert(children).values(child).returning();
    // Clear cache when new child is added
    memoryCache.clearChildrenCache();
    // Also clear attendance cache which holds paginated results
    memoryCache.clearAttendanceCache();
    return newChild;
  }

  async updateChild(id: string, child: Partial<InsertChild>): Promise<Child> {
    const [updatedChild] = await db.update(children).set(child).where(eq(children.id, id)).returning();
    // Clear specific child from cache
    memoryCache.deleteChild(id);
    // Clear children list cache
    memoryCache.clearAttendanceCache(); // Using attendance cache for paginated results
    return updatedChild;
  }

  // Staff
  async getStaff(id: string): Promise<Staff | undefined> {
    // Check cache first
    const cached = memoryCache.getStaff(id);
    if (cached) return cached;

    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    if (staffMember) {
      memoryCache.setStaff(id, staffMember);
    }
    return staffMember || undefined;
  }

  async getAllStaff(options: PaginationOptions = {}): Promise<PaginatedResult<Staff>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 50);
    const offset = (page - 1) * limit;

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(staff);
    
    const data = await db.select()
      .from(staff)
      .orderBy(asc(staff.firstName), asc(staff.lastName))
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit)
    };
  }

  async getActiveStaff(options: PaginationOptions = {}): Promise<PaginatedResult<Staff>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 50);
    const offset = (page - 1) * limit;

    // Don't use cache for now - it's causing issues
    // const cacheKey = `active-staff-${page}-${limit}`;
    // const cached = memoryCache.getAttendance(cacheKey);
    // if (cached) return cached;

    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(staff)
      .where(eq(staff.isActive, true));
    
    const data = await db.select()
      .from(staff)
      .where(eq(staff.isActive, true))
      .orderBy(asc(staff.firstName), asc(staff.lastName))
      .limit(limit)
      .offset(offset);

    const result = {
      data,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit)
    };

    // Don't cache for now
    // memoryCache.setAttendance(cacheKey, result);
    
    return result;
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(staffData).returning();
    // Clear cache when new staff is added
    memoryCache.clearStaffCache();
    // Also clear attendance cache which holds paginated results
    memoryCache.clearAttendanceCache();
    return newStaff;
  }

  async updateStaff(id: string, staffData: Partial<InsertStaff>): Promise<Staff> {
    const [updatedStaff] = await db.update(staff).set(staffData).where(eq(staff.id, id)).returning();
    // Clear specific staff from cache
    memoryCache.deleteStaff(id);
    // Clear staff list cache
    memoryCache.clearAttendanceCache();
    return updatedStaff;
  }

  // Attendance
  async getAttendance(id: string): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db.select().from(attendance).where(eq(attendance.id, id));
    return attendanceRecord || undefined;
  }

  async getTodaysAttendance(): Promise<Attendance[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db.select().from(attendance)
      .where(and(gte(attendance.date, today), lte(attendance.date, tomorrow)))
      .orderBy(desc(attendance.checkInTime));
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(attendance)
      .where(and(gte(attendance.date, startOfDay), lte(attendance.date, endOfDay)))
      .orderBy(desc(attendance.checkInTime));
  }

  async getAttendanceByChild(childId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    if (startDate && endDate) {
      return await db.select().from(attendance)
        .where(and(
          eq(attendance.childId, childId),
          gte(attendance.date, startDate),
          lte(attendance.date, endDate)
        ))
        .orderBy(desc(attendance.checkInTime));
    }
    
    return await db.select().from(attendance)
      .where(eq(attendance.childId, childId))
      .orderBy(desc(attendance.checkInTime));
  }

  async getCurrentlyPresentChildren(): Promise<(Attendance & { child: Child })[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db.select()
      .from(attendance)
      .innerJoin(children, eq(attendance.childId, children.id))
      .where(and(
        gte(attendance.date, today),
        lte(attendance.date, tomorrow),
        isNull(attendance.checkOutTime)
      ))
      .orderBy(asc(children.firstName));

    return result.map(row => ({
      ...row.attendance,
      child: row.children
    }));
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return newAttendance;
  }

  async updateAttendance(id: string, attendanceData: Partial<InsertAttendance>): Promise<Attendance> {
    const [updatedAttendance] = await db.update(attendance).set(attendanceData).where(eq(attendance.id, id)).returning();
    return updatedAttendance;
  }

  async checkOutChild(attendanceId: string, checkOutBy: string, checkOutTime: Date): Promise<Attendance> {
    const [updatedAttendance] = await db.update(attendance)
      .set({ checkOutTime: checkOutTime, checkOutBy: checkOutBy })
      .where(eq(attendance.id, attendanceId))
      .returning();
    return updatedAttendance;
  }

  // Staff Schedules
  async getStaffSchedule(id: string): Promise<StaffSchedule | undefined> {
    const [schedule] = await db.select().from(staffSchedules).where(eq(staffSchedules.id, id));
    return schedule || undefined;
  }

  async getTodaysStaffSchedules(): Promise<(StaffSchedule & { staff: Staff })[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db.select()
      .from(staffSchedules)
      .innerJoin(staff, eq(staffSchedules.staffId, staff.id))
      .where(and(gte(staffSchedules.date, today), lte(staffSchedules.date, tomorrow)))
      .orderBy(asc(staffSchedules.scheduledStart));

    return result.map(row => ({
      ...row.staff_schedules,
      staff: row.staff
    }));
  }

  async getAllStaffSchedules(): Promise<StaffSchedule[]> {
    const result = await db.select()
      .from(staffSchedules)
      .orderBy(desc(staffSchedules.scheduledStart));
    
    return result;
  }

  async getStaffSchedulesByDate(date: Date): Promise<(StaffSchedule & { staff: Staff })[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.select()
      .from(staffSchedules)
      .innerJoin(staff, eq(staffSchedules.staffId, staff.id))
      .where(and(gte(staffSchedules.date, startOfDay), lte(staffSchedules.date, endOfDay)))
      .orderBy(asc(staffSchedules.scheduledStart));

    return result.map(row => ({
      ...row.staff_schedules,
      staff: row.staff
    }));
  }

  async createStaffSchedule(scheduleData: InsertStaffSchedule): Promise<StaffSchedule> {
    const [newSchedule] = await db.insert(staffSchedules).values(scheduleData).returning();
    return newSchedule;
  }

  async updateStaffSchedule(id: string, scheduleData: Partial<InsertStaffSchedule>): Promise<StaffSchedule> {
    const [updatedSchedule] = await db.update(staffSchedules).set(scheduleData).where(eq(staffSchedules.id, id)).returning();
    return updatedSchedule;
  }

  async markStaffPresent(scheduleId: string, actualStart: Date): Promise<StaffSchedule> {
    const [updatedSchedule] = await db.update(staffSchedules)
      .set({ actualStart: actualStart, isPresent: true })
      .where(eq(staffSchedules.id, scheduleId))
      .returning();
    return updatedSchedule;
  }

  async markStaffEnd(scheduleId: string, actualEnd: Date): Promise<StaffSchedule> {
    const [updatedSchedule] = await db.update(staffSchedules)
      .set({ actualEnd: actualEnd })
      .where(eq(staffSchedules.id, scheduleId))
      .returning();
    return updatedSchedule;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(asc(settings.key));
  }

  async createOrUpdateSetting(key: string, value: string): Promise<Setting> {
    const existing = await this.getSetting(key);
    
    if (existing) {
      const [updated] = await db.update(settings)
        .set({ value: value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(settings)
        .values({ key, value })
        .returning();
      return created;
    }
  }

  // Alerts
  async getAlert(id: string): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert || undefined;
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts)
      .where(eq(alerts.isRead, false))
      .orderBy(desc(alerts.createdAt));
  }

  async getAllAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async createAlert(alertData: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alertData).returning();
    return newAlert;
  }

  async markAlertAsRead(id: string): Promise<Alert> {
    const [updatedAlert] = await db.update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  async deleteAlert(id: string): Promise<void> {
    await db.delete(alerts).where(eq(alerts.id, id));
  }

  // State Ratios
  async getStateRatio(state: string): Promise<StateRatio | undefined> {
    const [ratio] = await db.select().from(stateRatios).where(eq(stateRatios.state, state));
    return ratio || undefined;
  }

  async getAllStateRatios(): Promise<StateRatio[]> {
    return await db.select().from(stateRatios).orderBy(asc(stateRatios.state));
  }

  async createOrUpdateStateRatio(ratioData: InsertStateRatio): Promise<StateRatio> {
    const existing = await this.getStateRatio(ratioData.state);
    
    if (existing) {
      const [updated] = await db.update(stateRatios)
        .set(ratioData)
        .where(eq(stateRatios.state, ratioData.state))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(stateRatios)
        .values(ratioData)
        .returning();
      return created;
    }
  }

  async seedStateRatios(): Promise<void> {
    const { STATE_RATIOS_DATA } = await import("@shared/stateRatios");
    
    for (const ratioData of STATE_RATIOS_DATA) {
      await this.createOrUpdateStateRatio(ratioData);
    }
  }

  // State Compliance Methods
  async getStateCompliance(): Promise<StateCompliance | undefined> {
    const [compliance] = await db.select().from(stateCompliance).where(eq(stateCompliance.isActive, true));
    return compliance || undefined;
  }

  async getCurrentState(): Promise<string> {
    const compliance = await this.getStateCompliance();
    return compliance?.state || "West Virginia";
  }

  async updateStateCompliance(state: string, auditNote?: string): Promise<StateCompliance> {
    const { STATE_COMPLIANCE_RATIOS } = await import("@shared/stateComplianceData");
    const ratiosData = JSON.stringify(STATE_COMPLIANCE_RATIOS[state]);
    
    // Deactivate existing compliance records
    await db.update(stateCompliance).set({ isActive: false }).where(eq(stateCompliance.isActive, true));
    
    // Create new compliance record
    const auditLogEntry = `State changed to ${state}${auditNote ? ` - ${auditNote}` : ''} at ${new Date().toISOString()}`;
    const existing = await this.getStateCompliance();
    const existingAuditLog = existing?.auditLog || [];
    
    const [newCompliance] = await db.insert(stateCompliance).values({
      state,
      ratiosData,
      auditLog: [...existingAuditLog, auditLogEntry],
      isActive: true,
    }).returning();
    
    return newCompliance;
  }

  async initializeDefaultState(): Promise<StateCompliance> {
    const existing = await this.getStateCompliance();
    if (existing) {
      return existing;
    }
    
    return await this.updateStateCompliance("West Virginia", "Initial setup");
  }

  // Security System Methods
  async createSecurityDevice(deviceData: any): Promise<any> {
    const { securityDevices } = await import("@shared/schema");
    const [device] = await db.insert(securityDevices).values(deviceData).returning();
    return device;
  }

  async getSecurityDevice(id: string): Promise<any> {
    const { securityDevices } = await import("@shared/schema");
    const [device] = await db.select().from(securityDevices).where(eq(securityDevices.id, id));
    return device || undefined;
  }

  async getAllSecurityDevices(): Promise<any[]> {
    const { securityDevices } = await import("@shared/schema");
    return await db.select().from(securityDevices).orderBy(asc(securityDevices.location));
  }

  async getSecurityDevicesForLocation(location: string): Promise<any[]> {
    const { securityDevices } = await import("@shared/schema");
    return await db.select().from(securityDevices).where(eq(securityDevices.location, location));
  }

  async updateSecurityDevice(id: string, updates: any): Promise<any> {
    const { securityDevices } = await import("@shared/schema");
    const [device] = await db.update(securityDevices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(securityDevices.id, id))
      .returning();
    return device;
  }

  async updateSecurityDeviceStatus(id: string, status: string): Promise<void> {
    const { securityDevices } = await import("@shared/schema");
    await db.update(securityDevices)
      .set({ status, lastPing: new Date(), updatedAt: new Date() })
      .where(eq(securityDevices.id, id));
  }

  async deleteSecurityDevice(id: string): Promise<void> {
    const { securityDevices } = await import("@shared/schema");
    await db.delete(securityDevices).where(eq(securityDevices.id, id));
  }

  // Security Credentials
  async createSecurityCredential(credentialData: any): Promise<any> {
    const { securityCredentials } = await import("@shared/schema");
    const [credential] = await db.insert(securityCredentials).values(credentialData).returning();
    return credential;
  }

  async getSecurityCredentialsForDevice(deviceId: string, type?: string): Promise<any[]> {
    const { securityCredentials } = await import("@shared/schema");
    
    if (type) {
      return await db.select().from(securityCredentials)
        .where(and(
          eq(securityCredentials.deviceId, deviceId),
          eq(securityCredentials.credentialType, type)
        ));
    } else {
      return await db.select().from(securityCredentials)
        .where(eq(securityCredentials.deviceId, deviceId));
    }
  }

  async updateSecurityCredential(id: string, updates: any): Promise<any> {
    const { securityCredentials } = await import("@shared/schema");
    const [credential] = await db.update(securityCredentials)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(securityCredentials.id, id))
      .returning();
    return credential;
  }

  async deleteSecurityCredential(id: string): Promise<void> {
    const { securityCredentials } = await import("@shared/schema");
    await db.delete(securityCredentials).where(eq(securityCredentials.id, id));
  }

  // Security Logs
  async createSecurityLog(logData: any): Promise<any> {
    const { securityLogs } = await import("@shared/schema");
    const [log] = await db.insert(securityLogs).values(logData).returning();
    return log;
  }

  async getSecurityLogs(limit = 100): Promise<any[]> {
    const { securityLogs, securityDevices } = await import("@shared/schema");
    return await db.select({
      log: securityLogs,
      deviceName: securityDevices.name,
      deviceLocation: securityDevices.location,
    })
    .from(securityLogs)
    .leftJoin(securityDevices, eq(securityLogs.deviceId, securityDevices.id))
    .orderBy(desc(securityLogs.timestamp))
    .limit(limit);
  }

  async getSecurityLogsForDevice(deviceId: string, limit = 50): Promise<any[]> {
    const { securityLogs } = await import("@shared/schema");
    return await db.select().from(securityLogs)
      .where(eq(securityLogs.deviceId, deviceId))
      .orderBy(desc(securityLogs.timestamp))
      .limit(limit);
  }

  // Security Zones
  async createSecurityZone(zoneData: any): Promise<any> {
    const { securityZones } = await import("@shared/schema");
    const [zone] = await db.insert(securityZones).values(zoneData).returning();
    return zone;
  }

  async getAllSecurityZones(): Promise<any[]> {
    const { securityZones } = await import("@shared/schema");
    return await db.select().from(securityZones).orderBy(asc(securityZones.name));
  }

  async updateSecurityZone(id: string, updates: any): Promise<any> {
    const { securityZones } = await import("@shared/schema");
    const [zone] = await db.update(securityZones)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(securityZones.id, id))
      .returning();
    return zone;
  }

  async deleteSecurityZone(id: string): Promise<void> {
    const { securityZones } = await import("@shared/schema");
    await db.delete(securityZones).where(eq(securityZones.id, id));
  }

  // Parent operations
  async getParent(id: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    return parent || undefined;
  }

  async getParentByEmail(email: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.email, email));
    return parent || undefined;
  }

  async getParentByUsername(username: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.username, username.toLowerCase()));
    return parent || undefined;
  }

  async createParent(parent: InsertParent): Promise<Parent> {
    const [newParent] = await db.insert(parents).values(parent).returning();
    return newParent;
  }

  async updateParent(id: string, parent: Partial<InsertParent>): Promise<Parent> {
    const [updated] = await db.update(parents)
      .set({ ...parent, updatedAt: new Date() })
      .where(eq(parents.id, id))
      .returning();
    return updated;
  }

  async updateParentLastLogin(id: string): Promise<Parent> {
    const [updated] = await db.update(parents)
      .set({ lastLogin: new Date() })
      .where(eq(parents.id, id))
      .returning();
    return updated;
  }

  async getParentChildren(parentId: string): Promise<Child[]> {
    const parent = await this.getParent(parentId);
    if (!parent || !parent.childrenIds || parent.childrenIds.length === 0) {
      return [];
    }
    
    const childrenData = await db.select()
      .from(children)
      .where(sql`${children.id} = ANY(${parent.childrenIds})`)
      .orderBy(asc(children.firstName));
    
    return childrenData;
  }

  // Daily Reports
  async getDailyReport(childId: string, date: Date): Promise<any | undefined> {
    const { dailyReports } = await import("@shared/schema");
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const [report] = await db.select()
      .from(dailyReports)
      .where(and(
        eq(dailyReports.childId, childId),
        gte(dailyReports.date, startOfDay),
        lte(dailyReports.date, endOfDay)
      ));
    
    return report || undefined;
  }

  async createDailyReport(report: any): Promise<any> {
    const { dailyReports } = await import("@shared/schema");
    const [newReport] = await db.insert(dailyReports).values(report).returning();
    return newReport;
  }

  async updateDailyReport(id: string, updates: any): Promise<any> {
    const { dailyReports } = await import("@shared/schema");
    const [updated] = await db.update(dailyReports)
      .set(updates)
      .where(eq(dailyReports.id, id))
      .returning();
    return updated;
  }

  async getChildDayData(childId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get attendance data
    const attendanceData = await db.select()
      .from(attendance)
      .where(and(
        eq(attendance.childId, childId),
        gte(attendance.date, startOfDay),
        lte(attendance.date, endOfDay)
      ));
    
    // Get any existing daily report
    const dailyReport = await this.getDailyReport(childId, date);
    
    // Get teacher notes
    const teacherNotes = await this.getTeacherNotes(childId, date);
    
    return {
      attendance: attendanceData[0] || null,
      dailyReport,
      teacherNotes,
      // Placeholder for additional data types to be added later
      meals: dailyReport?.meals || [],
      activities: dailyReport?.activities || [],
      photos: dailyReport?.photoUrls || [],
      naps: dailyReport?.naps || null,
      behaviorNotes: dailyReport?.behaviorNotes || null
    };
  }

  async getPresentChildrenForDate(date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.select()
      .from(attendance)
      .where(and(
        gte(attendance.date, startOfDay),
        lte(attendance.date, endOfDay),
        isNull(attendance.checkOutTime)
      ));
  }

  // Teacher Notes
  async addTeacherNote(note: any): Promise<any> {
    const { teacherNotes } = await import("@shared/schema");
    const [newNote] = await db.insert(teacherNotes).values(note).returning();
    return newNote;
  }

  async getTeacherNotes(childId: string, date: Date): Promise<any[]> {
    const { teacherNotes } = await import("@shared/schema");
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const dateString = targetDate.toISOString().split('T')[0];
    return await db.select()
      .from(teacherNotes)
      .where(and(
        eq(teacherNotes.childId, childId),
        eq(sql`DATE(${teacherNotes.date})`, sql`DATE(${dateString})`)
      ))
      .orderBy(desc(teacherNotes.createdAt));
  }

  // User Profiles
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async getUserProfileByUsername(username: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.username, username));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updatedProfile] = await db.update(userProfiles)
      .set({
        ...profile,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Test data management methods
  async clearAllChildren(): Promise<void> {
    await db.delete(children);
  }

  async clearAllStaff(): Promise<void> {
    await db.delete(staff);
  }

  async clearAllAttendance(): Promise<void> {
    await db.delete(attendance);
  }
}

export const storage = new DatabaseStorage();
