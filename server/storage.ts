import { children, staff, attendance, staffSchedules, settings, alerts, type Child, type InsertChild, type Staff, type InsertStaff, type Attendance, type InsertAttendance, type StaffSchedule, type InsertStaffSchedule, type Setting, type InsertSetting, type Alert, type InsertAlert } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Children
  getChild(id: string): Promise<Child | undefined>;
  getAllChildren(): Promise<Child[]>;
  getActiveChildren(): Promise<Child[]>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: string, child: Partial<InsertChild>): Promise<Child>;
  
  // Staff
  getStaff(id: string): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  getActiveStaff(): Promise<Staff[]>;
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
}

export class DatabaseStorage implements IStorage {
  // Children
  async getChild(id: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child || undefined;
  }

  async getAllChildren(): Promise<Child[]> {
    return await db.select().from(children).orderBy(asc(children.firstName), asc(children.lastName));
  }

  async getActiveChildren(): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.isActive, true)).orderBy(asc(children.firstName), asc(children.lastName));
  }

  async createChild(child: InsertChild): Promise<Child> {
    const [newChild] = await db.insert(children).values(child).returning();
    return newChild;
  }

  async updateChild(id: string, child: Partial<InsertChild>): Promise<Child> {
    const [updatedChild] = await db.update(children).set(child).where(eq(children.id, id)).returning();
    return updatedChild;
  }

  // Staff
  async getStaff(id: string): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff).orderBy(asc(staff.firstName), asc(staff.lastName));
  }

  async getActiveStaff(): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.isActive, true)).orderBy(asc(staff.firstName), asc(staff.lastName));
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(staffData).returning();
    return newStaff;
  }

  async updateStaff(id: string, staffData: Partial<InsertStaff>): Promise<Staff> {
    const [updatedStaff] = await db.update(staff).set(staffData).where(eq(staff.id, id)).returning();
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
    let query = db.select().from(attendance).where(eq(attendance.childId, childId));
    
    if (startDate && endDate) {
      query = query.where(and(
        eq(attendance.childId, childId),
        gte(attendance.date, startDate),
        lte(attendance.date, endDate)
      ));
    }
    
    return await query.orderBy(desc(attendance.checkInTime));
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
        eq(attendance.checkOutTime, null)
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
}

export const storage = new DatabaseStorage();
