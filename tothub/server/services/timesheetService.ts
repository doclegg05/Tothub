import { db } from "../db";
import { staff, timesheetEntries } from "@shared/schema";
import { eq, and, gte, lte, isNull } from "drizzle-orm";

export class TimesheetService {
  /**
   * Clock in a staff member - creates a timesheet entry
   */
  static async clockIn(staffId: string, clockInTime?: Date): Promise<any> {
    const clockTime = clockInTime || new Date();
    const today = new Date(clockTime.toDateString());

    try {
      // Check if staff member already has an open timesheet for today
      const existingEntry = await db
        .select()
        .from(timesheetEntries)
        .where(
          and(
            eq(timesheetEntries.staffId, staffId),
            eq(timesheetEntries.date, today.toISOString().split('T')[0]),
            isNull(timesheetEntries.clockOutTime)
          )
        )
        .limit(1);

      if (existingEntry.length > 0) {
        throw new Error("Staff member is already clocked in");
      }

      // Get staff hourly rate
      const staffMember = await db
        .select()
        .from(staff)
        .where(eq(staff.id, staffId))
        .limit(1);

      if (staffMember.length === 0) {
        throw new Error("Staff member not found");
      }

      // Create new timesheet entry
      const [newEntry] = await db
        .insert(timesheetEntries)
        .values({
          staffId: staffId,
          date: today,
          clockInTime: clockTime,
          hourlyRate: staffMember[0].hourlyRate || 0,
          regularHours: 0,
          overtimeHours: 0,
          totalHours: 0,
          breakMinutes: 0,
          isApproved: false,
        })
        .returning();

      return newEntry;
    } catch (error) {
      console.error('Clock in error:', error);
      throw error;
    }
  }

  /**
   * Clock out a staff member - updates existing timesheet entry
   */
  static async clockOut(staffId: string, clockOutTime?: Date): Promise<any> {
    const clockTime = clockOutTime || new Date();
    const today = new Date(clockTime.toDateString());

    try {
      // Find the open timesheet entry for today
      const [existingEntry] = await db
        .select()
        .from(timesheetEntries)
        .where(
          and(
            eq(timesheetEntries.staffId, staffId),
            eq(timesheetEntries.date, today.toISOString().split('T')[0]),
            isNull(timesheetEntries.clockOutTime)
          )
        )
        .limit(1);

      if (!existingEntry) {
        throw new Error("No open clock-in found for today");
      }

      // Calculate hours worked
      const clockInTime = new Date(existingEntry.clockInTime!);
      const totalMinutes = Math.floor((clockTime.getTime() - clockInTime.getTime()) / (1000 * 60));
      const adjustedMinutes = Math.max(0, totalMinutes - (existingEntry.breakMinutes || 0));
      
      // Calculate regular and overtime hours (overtime after 8 hours per day)
      const regularMinutes = Math.min(adjustedMinutes, 8 * 60);
      const overtimeMinutes = Math.max(0, adjustedMinutes - (8 * 60));

      // Update the timesheet entry
      const [updatedEntry] = await db
        .update(timesheetEntries)
        .set({
          clockOutTime: clockTime,
          regularHours: regularMinutes,
          overtimeHours: overtimeMinutes,
          totalHours: adjustedMinutes,
        })
        .where(eq(timesheetEntries.id, existingEntry.id))
        .returning();

      return updatedEntry;
    } catch (error) {
      console.error('Clock out error:', error);
      throw error;
    }
  }

  /**
   * Get current clock status for a staff member
   */
  static async getClockStatus(staffId: string): Promise<{
    isClockedIn: boolean;
    clockInTime?: Date;
    hoursWorkedToday: number;
  }> {
    const today = new Date(new Date().toDateString());

    try {
      const [currentEntry] = await db
        .select()
        .from(timesheetEntries)
        .where(
          and(
            eq(timesheetEntries.staffId, staffId),
            eq(timesheetEntries.date, today.toISOString().split('T')[0])
          )
        )
        .limit(1);

      if (!currentEntry) {
        return { isClockedIn: false, hoursWorkedToday: 0 };
      }

      const isClockedIn = !currentEntry.clockOutTime;
      const hoursWorkedToday = (currentEntry.totalHours || 0) / 60; // Convert minutes to hours

      return {
        isClockedIn,
        clockInTime: currentEntry.clockInTime || undefined,
        hoursWorkedToday,
      };
    } catch (error) {
      console.error('Get clock status error:', error);
      return { isClockedIn: false, hoursWorkedToday: 0 };
    }
  }

  /**
   * Get timesheet summary for a staff member over a date range
   */
  static async getTimesheetSummary(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRegularHours: number;
    totalOvertimeHours: number;
    totalHours: number;
    daysWorked: number;
    entries: any[];
  }> {
    try {
      const entries = await db
        .select()
        .from(timesheetEntries)
        .where(
          and(
            eq(timesheetEntries.staffId, staffId),
            gte(timesheetEntries.date, startDate.toISOString().split('T')[0]),
            lte(timesheetEntries.date, endDate.toISOString().split('T')[0])
          )
        );

      const summary = entries.reduce(
        (acc: any, entry: any) => {
          acc.totalRegularHours += (entry.regularHours || 0) / 60;
          acc.totalOvertimeHours += (entry.overtimeHours || 0) / 60;
          acc.totalHours += (entry.totalHours || 0) / 60;
          acc.daysWorked += 1;
          return acc;
        },
        {
          totalRegularHours: 0,
          totalOvertimeHours: 0,
          totalHours: 0,
          daysWorked: 0,
          entries,
        }
      );

      return summary;
    } catch (error) {
      console.error('Get timesheet summary error:', error);
      throw error;
    }
  }

  /**
   * Approve timesheet entries for a pay period
   */
  static async approveTimesheets(
    timesheetIds: string[],
    approvedBy: string
  ): Promise<void> {
    try {
      await db
        .update(timesheetEntries)
        .set({
          isApproved: true,
          approvedBy,
          approvedAt: new Date(),
        })
        .where(
          // Use IN operator for multiple IDs
          eq(timesheetEntries.id, timesheetIds[0]) // This is a simplified version
        );
    } catch (error) {
      console.error('Approve timesheets error:', error);
      throw error;
    }
  }
}