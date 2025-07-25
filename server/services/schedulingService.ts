import { db } from "../db";
import { staffSchedules, childSchedules, children, staff } from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export class SchedulingService {
  /**
   * Create staff schedule with recurring pattern support
   */
  static async createStaffSchedule(scheduleData: {
    staffId: string;
    room: string;
    date: string;
    scheduledStart: string;
    scheduledEnd: string;
    scheduleType?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
    recurringUntil?: string;
    notes?: string;
  }) {
    try {
      const startDateTime = new Date(`${scheduleData.date}T${scheduleData.scheduledStart}`);
      const endDateTime = new Date(`${scheduleData.date}T${scheduleData.scheduledEnd}`);
      const dateOnly = new Date(scheduleData.date);

      // Create primary schedule
      const [schedule] = await db
        .insert(staffSchedules)
        .values({
          staffId: scheduleData.staffId,
          room: scheduleData.room,
          date: dateOnly,
          scheduledStart: startDateTime,
          scheduledEnd: endDateTime,
          scheduleType: scheduleData.scheduleType || "regular",
          isRecurring: scheduleData.isRecurring || false,
          recurringPattern: scheduleData.recurringPattern,
          recurringUntil: scheduleData.recurringUntil ? new Date(scheduleData.recurringUntil) : null,
          notes: scheduleData.notes,
          status: "scheduled",
        })
        .returning();

      // If recurring, create additional schedules
      if (scheduleData.isRecurring && scheduleData.recurringPattern && scheduleData.recurringUntil) {
        await this.createRecurringSchedules('staff', schedule.id, scheduleData);
      }

      return schedule;
    } catch (error) {
      console.error('Create staff schedule error:', error);
      throw error;
    }
  }

  /**
   * Create child schedule with meal plans and recurring days
   */
  static async createChildSchedule(scheduleData: {
    childId: string;
    room: string;
    date: string;
    scheduledArrival: string;
    scheduledDeparture: string;
    scheduleType?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
    recurringDays?: string[];
    recurringUntil?: string;
    mealPlan?: string[];
    napTime?: string;
    notes?: string;
  }) {
    try {
      const arrivalDateTime = new Date(`${scheduleData.date}T${scheduleData.scheduledArrival}`);
      const departureDateTime = new Date(`${scheduleData.date}T${scheduleData.scheduledDeparture}`);
      const dateOnly = new Date(scheduleData.date);

      // Create primary schedule
      const [schedule] = await db
        .insert(childSchedules)
        .values({
          childId: scheduleData.childId,
          room: scheduleData.room,
          date: dateOnly,
          scheduledArrival: arrivalDateTime,
          scheduledDeparture: departureDateTime,
          scheduleType: scheduleData.scheduleType || "regular",
          isRecurring: scheduleData.isRecurring || true,
          recurringPattern: scheduleData.recurringPattern || "weekly",
          recurringDays: scheduleData.recurringDays || [],
          recurringUntil: scheduleData.recurringUntil ? new Date(scheduleData.recurringUntil) : null,
          mealPlan: scheduleData.mealPlan || [],
          napTime: scheduleData.napTime,
          notes: scheduleData.notes,
          status: "scheduled",
        })
        .returning();

      // If recurring, create additional schedules based on recurring days
      if (scheduleData.isRecurring && scheduleData.recurringDays && scheduleData.recurringDays.length > 0) {
        await this.createRecurringChildSchedules(schedule.id, scheduleData);
      }

      return schedule;
    } catch (error) {
      console.error('Create child schedule error:', error);
      throw error;
    }
  }

  /**
   * Get staff schedules for a specific date with staff details
   */
  static async getStaffSchedules(date: string) {
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const schedules = await db
        .select({
          schedule: staffSchedules,
          staff: {
            firstName: staff.firstName,
            lastName: staff.lastName,
            position: staff.position,
          },
        })
        .from(staffSchedules)
        .innerJoin(staff, eq(staffSchedules.staffId, staff.id))
        .where(
          and(
            gte(staffSchedules.date, startOfDay),
            lte(staffSchedules.date, endOfDay)
          )
        )
        .orderBy(staffSchedules.scheduledStart);

      return schedules.map(({ schedule, staff: staffInfo }) => ({
        ...schedule,
        staff: staffInfo,
      }));
    } catch (error) {
      console.error('Get staff schedules error:', error);
      throw error;
    }
  }

  /**
   * Get child schedules for a specific date with child details
   */
  static async getChildSchedules(date: string) {
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const schedules = await db
        .select({
          schedule: childSchedules,
          child: {
            firstName: children.firstName,
            lastName: children.lastName,
            ageGroup: children.ageGroup,
          },
        })
        .from(childSchedules)
        .innerJoin(children, eq(childSchedules.childId, children.id))
        .where(
          and(
            gte(childSchedules.date, startOfDay),
            lte(childSchedules.date, endOfDay)
          )
        )
        .orderBy(childSchedules.scheduledArrival);

      return schedules.map(({ schedule, child: childInfo }) => ({
        ...schedule,
        child: childInfo,
      }));
    } catch (error) {
      console.error('Get child schedules error:', error);
      throw error;
    }
  }

  /**
   * Update schedule status (confirmed, cancelled, etc.)
   */
  static async updateScheduleStatus(
    scheduleId: string, 
    type: 'staff' | 'child', 
    status: string,
    updatedBy?: string
  ) {
    try {
      const table = type === 'staff' ? staffSchedules : childSchedules;
      
      const [updated] = await db
        .update(table)
        .set({ 
          status,
          // Add audit fields if needed
        })
        .where(eq(table.id, scheduleId))
        .returning();

      return updated;
    } catch (error) {
      console.error('Update schedule status error:', error);
      throw error;
    }
  }

  /**
   * Check for scheduling conflicts
   */
  static async checkSchedulingConflicts(
    entityId: string,
    type: 'staff' | 'child',
    startTime: Date,
    endTime: Date,
    excludeScheduleId?: string
  ) {
    try {
      const table = type === 'staff' ? staffSchedules : childSchedules;
      const entityField = type === 'staff' ? 'staffId' : 'childId';

      let query = db
        .select()
        .from(table)
        .where(
          and(
            eq(table[entityField], entityId),
            // Check for time overlap
            and(
              lte(table.scheduledStart, endTime),
              gte(table.scheduledEnd, startTime)
            ),
            // Only check active schedules
            eq(table.status, 'scheduled')
          )
        );

      if (excludeScheduleId) {
        query = query.where(and(
          eq(table[entityField], entityId),
          // Add not equal condition for excluding specific schedule
        ));
      }

      const conflicts = await query;
      return conflicts;
    } catch (error) {
      console.error('Check scheduling conflicts error:', error);
      throw error;
    }
  }

  /**
   * Get room capacity and utilization
   */
  static async getRoomUtilization(date: string) {
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      // Get staff counts by room
      const staffByRoom = await db
        .select({
          room: staffSchedules.room,
          count: db.count(),
        })
        .from(staffSchedules)
        .where(
          and(
            gte(staffSchedules.date, startOfDay),
            lte(staffSchedules.date, endOfDay),
            eq(staffSchedules.status, 'scheduled')
          )
        )
        .groupBy(staffSchedules.room);

      // Get children counts by room
      const childrenByRoom = await db
        .select({
          room: childSchedules.room,
          count: db.count(),
        })
        .from(childSchedules)
        .where(
          and(
            gte(childSchedules.date, startOfDay),
            lte(childSchedules.date, endOfDay),
            eq(childSchedules.status, 'scheduled')
          )
        )
        .groupBy(childSchedules.room);

      // Combine results
      const utilization = {};
      
      staffByRoom.forEach(({ room, count }) => {
        utilization[room] = { ...utilization[room], staffCount: count };
      });

      childrenByRoom.forEach(({ room, count }) => {
        utilization[room] = { ...utilization[room], childCount: count };
      });

      return utilization;
    } catch (error) {
      console.error('Get room utilization error:', error);
      throw error;
    }
  }

  /**
   * Private method to create recurring schedules
   */
  private static async createRecurringSchedules(
    type: 'staff' | 'child',
    baseScheduleId: string,
    scheduleData: any
  ) {
    // Implementation for creating recurring schedules
    // This would generate schedules based on the recurring pattern
    // until the recurringUntil date
  }

  /**
   * Private method to create recurring child schedules based on specific days
   */
  private static async createRecurringChildSchedules(
    baseScheduleId: string,
    scheduleData: any
  ) {
    // Implementation for creating child schedules on specific days of the week
    // This would create schedules for the next several weeks based on recurringDays
  }

  /**
   * Get weekly schedule overview
   */
  static async getWeeklyScheduleOverview(startDate: string) {
    try {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // 7 days total

      const staffSchedulesData = await db
        .select({
          schedule: staffSchedules,
          staff: {
            firstName: staff.firstName,
            lastName: staff.lastName,
            position: staff.position,
          },
        })
        .from(staffSchedules)
        .innerJoin(staff, eq(staffSchedules.staffId, staff.id))
        .where(
          and(
            gte(staffSchedules.date, start),
            lte(staffSchedules.date, end)
          )
        )
        .orderBy(staffSchedules.date, staffSchedules.scheduledStart);

      const childSchedulesData = await db
        .select({
          schedule: childSchedules,
          child: {
            firstName: children.firstName,
            lastName: children.lastName,
            ageGroup: children.ageGroup,
          },
        })
        .from(childSchedules)
        .innerJoin(children, eq(childSchedules.childId, children.id))
        .where(
          and(
            gte(childSchedules.date, start),
            lte(childSchedules.date, end)
          )
        )
        .orderBy(childSchedules.date, childSchedules.scheduledArrival);

      return {
        staffSchedules: staffSchedulesData.map(({ schedule, staff: staffInfo }) => ({
          ...schedule,
          staff: staffInfo,
        })),
        childSchedules: childSchedulesData.map(({ schedule, child: childInfo }) => ({
          ...schedule,
          child: childInfo,
        })),
      };
    } catch (error) {
      console.error('Get weekly schedule overview error:', error);
      throw error;
    }
  }
}