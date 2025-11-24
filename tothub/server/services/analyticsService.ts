import { db } from '../db';
import { children, attendance, staff, staffSchedules } from '@shared/schema';
import { sql, eq, and, gte, lte, count, sum } from 'drizzle-orm';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';

export interface AttendanceStats {
  date: string;
  totalCheckIns: number;
  averageHours: number;
  peakHour: number;
  utilizationRate: number;
}

export interface StaffStats {
  totalStaff: number;
  averageUtilization: number;
  overtimeHours: number;
  scheduledVsActual: number;
}

export interface RevenueStats {
  month: string;
  actual: number;
  projected: number;
  collectionRate: number;
}

export interface ParentEngagement {
  totalFamilies: number;
  activeUsers: number;
  messagesPerWeek: number;
  portalUsageRate: number;
}

export class AnalyticsService {
  static async getAttendanceTrends(days: number = 30): Promise<AttendanceStats[]> {
    const startDate = subDays(new Date(), days);
    
    const attendanceData = await db
      .select({
        date: attendance.date,
        checkIns: count(attendance.id),
        totalHours: sql<number>`SUM(EXTRACT(EPOCH FROM (${attendance.checkOutTime} - ${attendance.checkInTime})) / 3600)`,
      })
      .from(attendance)
      .where(gte(attendance.date, startDate.toISOString().split('T')[0]))
      .groupBy(attendance.date)
      .orderBy(attendance.date);

    const activeChildren = await db
      .select({ count: count(children.id) })
      .from(children)
      .where(eq(children.isActive, 1));

    const totalCapacity = activeChildren[0]?.count || 1;

    return attendanceData.map((day: any) => ({
      date: day.date.toISOString(),
      totalCheckIns: Number(day.checkIns),
      averageHours: Number(day.totalHours) / Number(day.checkIns) || 0,
      peakHour: 9, // TODO: Calculate actual peak hour
      utilizationRate: (Number(day.checkIns) / totalCapacity) * 100,
    }));
  }

  static async getStaffUtilization(): Promise<StaffStats> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    // Get total active staff
    const activeStaff = await db
      .select({ count: count(staff.id) })
      .from(staff)
      .where(eq(staff.isActive, 1));

    // Get scheduled vs actual hours
    const scheduleData = await db
      .select({
        scheduledHours: sql`SUM(EXTRACT(EPOCH FROM (${staffSchedules.scheduledEnd} - ${staffSchedules.scheduledStart})) / 3600)`,
        actualHours: sql`SUM(EXTRACT(EPOCH FROM (${staffSchedules.actualEnd} - ${staffSchedules.actualStart})) / 3600)`,
      })
      .from(staffSchedules)
      .where(gte(staffSchedules.date, thirtyDaysAgo.toISOString().split('T')[0]));

    const totalStaff = activeStaff[0]?.count || 0;
    const scheduledHours = Number(scheduleData[0]?.scheduledHours || 0);
    const actualHours = Number(scheduleData[0]?.actualHours || 0);
    const overtimeHours = Math.max(0, actualHours - scheduledHours);

    return {
      totalStaff,
      averageUtilization: scheduledHours > 0 ? (actualHours / scheduledHours) * 100 : 0,
      overtimeHours,
      scheduledVsActual: scheduledHours > 0 ? actualHours / scheduledHours : 1,
    };
  }

  static async getRevenueForecast(months: number = 6): Promise<RevenueStats[]> {
    const stats: RevenueStats[] = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(monthStart);
      
      // Mock revenue data for now - will be replaced with actual billing data
      const revenue = [{ total: null, paid: null }];

      const activeChildren = await db
        .select({ count: count(children.id) })
        .from(children)
        .where(eq(children.isActive, 1));

      const childCount = activeChildren[0]?.count || 0;
      const avgTuition = 1200; // Average monthly tuition
      const projected = childCount * avgTuition;
      const actual = Number(revenue[0]?.total || 0);

      stats.push({
        month: format(monthStart, 'MMM yyyy'),
        actual,
        projected,
        collectionRate: projected > 0 ? (actual / projected) * 100 : 0,
      });
    }

    return stats;
  }

  static async getParentEngagement(): Promise<ParentEngagement> {
    const activeChildren = await db
      .select({ 
        count: count(children.id),
        families: sql`COUNT(DISTINCT ${children.parentEmail})`,
      })
      .from(children)
      .where(eq(children.isActive, 1));

    // Mock data for now - will be replaced with actual parent portal usage
    const totalFamilies = Number(activeChildren[0]?.families || 0);
    const activeUsers = Math.floor(totalFamilies * 0.75); // 75% engagement rate
    const messagesPerWeek = Math.floor(totalFamilies * 2.5); // Avg 2.5 messages per family
    const portalUsageRate = 75;

    return {
      totalFamilies,
      activeUsers,
      messagesPerWeek,
      portalUsageRate,
    };
  }

  static async getAgeGroupDistribution() {
    const distribution = await db
      .select({
        ageGroup: children.ageGroup,
        count: count(children.id),
      })
      .from(children)
      .where(eq(children.isActive, 1))
      .groupBy(children.ageGroup);

    return distribution;
  }

  static async getRoomUtilization() {
    const roomData = await db
      .select({
        room: children.room,
        count: count(children.id),
      })
      .from(children)
      .where(eq(children.isActive, 1))
      .groupBy(children.room);

    return roomData;
  }
}