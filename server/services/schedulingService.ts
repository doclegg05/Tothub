import { db } from '../db';
import { staff, staffSchedules, children, attendance } from '@shared/schema';
import { sql, eq, and, gte, lte, ne, or } from 'drizzle-orm';
import { addDays, startOfWeek, endOfWeek, format, differenceInMinutes } from 'date-fns';

export interface ShiftRecommendation {
  staffId: string;
  staffName: string;
  recommendedStart: Date;
  recommendedEnd: Date;
  reason: string;
  score: number;
}

export interface ScheduleConflict {
  staffId: string;
  date: Date;
  type: 'overlap' | 'understaffed' | 'overstaffed';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface StaffAvailability {
  staffId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  preferredStartTime: string; // HH:MM
  preferredEndTime: string; // HH:MM
  maxHoursPerWeek: number;
  unavailableDates: Date[];
}

export class SchedulingService {
  // Generate AI-powered schedule recommendations
  static async generateScheduleRecommendations(weekStart: Date): Promise<ShiftRecommendation[]> {
    const weekEnd = endOfWeek(weekStart);
    const recommendations: ShiftRecommendation[] = [];

    // Get historical attendance patterns
    const attendancePatterns = await this.getAttendancePatterns();
    
    // Get staff availability and preferences
    const staffList = await db.select().from(staff).where(eq(staff.isActive, 1));
    
    // Get current schedules for the week
    const existingSchedules = await db
      .select()
      .from(staffSchedules)
      .where(
        and(
          gte(staffSchedules.date, weekStart.toISOString().split('T')[0]),
          lte(staffSchedules.date, weekEnd.toISOString().split('T')[0])
        )
      );

    // For each day of the week
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = addDays(weekStart, dayOffset);
      const dayOfWeek = currentDate.getDay();
      
      // Get expected child count for this day
      const expectedChildren = attendancePatterns[dayOfWeek] || { peak: 30, average: 25 };
      
      // Calculate required staff based on ratios
      const requiredStaff = Math.ceil(expectedChildren.peak / 4); // Simplified ratio
      
      // Check existing coverage
      const existingCoverage = existingSchedules.filter(
        s => format(s.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      );
      
      const staffNeeded = requiredStaff - existingCoverage.length;
      
      if (staffNeeded > 0) {
        // Find available staff for this day
        const availableStaff = staffList.filter(s => {
          // Check if staff already scheduled
          const alreadyScheduled = existingCoverage.some(es => es.staffId === s.id);
          return !alreadyScheduled;
        });
        
        // Score and rank staff
        for (const staffMember of availableStaff) {
          const score = await this.calculateStaffScore(staffMember, currentDate, expectedChildren);
          
          if (score > 0) {
            recommendations.push({
              staffId: staffMember.id,
              staffName: `${staffMember.firstName} ${staffMember.lastName}`,
              recommendedStart: new Date(currentDate.setHours(8, 0, 0, 0)),
              recommendedEnd: new Date(currentDate.setHours(17, 0, 0, 0)),
              reason: this.getRecommendationReason(score, dayOfWeek),
              score
            });
          }
        }
      }
    }
    
    // Sort by score and limit recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

  // Detect scheduling conflicts
  static async detectConflicts(weekStart: Date): Promise<ScheduleConflict[]> {
    const weekEnd = endOfWeek(weekStart);
    const conflicts: ScheduleConflict[] = [];
    
    // Get all schedules for the week
    const schedules = await db
      .select()
      .from(staffSchedules)
      .where(
        and(
          gte(staffSchedules.date, weekStart.toISOString().split('T')[0]),
          lte(staffSchedules.date, weekEnd.toISOString().split('T')[0])
        )
      );
    
    // Group by staff to check for overlaps
    const staffScheduleMap = new Map<string, typeof schedules>();
    schedules.forEach(schedule => {
      const staffSchedules = staffScheduleMap.get(schedule.staffId) || [];
      staffSchedules.push(schedule);
      staffScheduleMap.set(schedule.staffId, staffSchedules);
    });
    
    // Check for time overlaps
    staffScheduleMap.forEach((staffSchedules, staffId) => {
      staffSchedules.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      for (let i = 0; i < staffSchedules.length - 1; i++) {
        const current = staffSchedules[i];
        const next = staffSchedules[i + 1];
        
        if (current.date.getTime() === next.date.getTime()) {
          // Same day schedules - check for time overlap
          if (current.scheduledEnd > next.scheduledStart) {
            conflicts.push({
              staffId,
              date: current.date,
              type: 'overlap',
              description: `Schedule overlap detected between ${format(current.scheduledStart, 'HH:mm')} - ${format(current.scheduledEnd, 'HH:mm')} and ${format(next.scheduledStart, 'HH:mm')} - ${format(next.scheduledEnd, 'HH:mm')}`,
              severity: 'high'
            });
          }
        }
      }
    });
    
    // Check for understaffing
    const attendancePatterns = await this.getAttendancePatterns();
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = addDays(weekStart, dayOffset);
      const dayOfWeek = currentDate.getDay();
      const expectedChildren = attendancePatterns[dayOfWeek] || { peak: 30, average: 25 };
      
      const scheduledStaff = schedules.filter(
        s => format(s.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      );
      
      const requiredStaff = Math.ceil(expectedChildren.peak / 4);
      
      if (scheduledStaff.length < requiredStaff) {
        conflicts.push({
          staffId: '',
          date: currentDate,
          type: 'understaffed',
          description: `Only ${scheduledStaff.length} staff scheduled, but ${requiredStaff} needed for expected ${expectedChildren.peak} children`,
          severity: scheduledStaff.length < requiredStaff * 0.75 ? 'high' : 'medium'
        });
      } else if (scheduledStaff.length > requiredStaff * 1.5) {
        conflicts.push({
          staffId: '',
          date: currentDate,
          type: 'overstaffed',
          description: `${scheduledStaff.length} staff scheduled, but only ${requiredStaff} needed`,
          severity: 'low'
        });
      }
    }
    
    return conflicts;
  }

  // Get historical attendance patterns
  private static async getAttendancePatterns(): Promise<Record<number, { peak: number; average: number }>> {
    const thirtyDaysAgo = addDays(new Date(), -30);
    
    const patterns = await db
      .select({
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${attendance.date})`,
        avgCount: sql<number>`AVG(count)`,
        maxCount: sql<number>`MAX(count)`
      })
      .from(
        db
          .select({
            date: attendance.date,
            count: sql<number>`COUNT(*)::int`
          })
          .from(attendance)
          .where(gte(attendance.date, thirtyDaysAgo.toISOString().split('T')[0]))
          .groupBy(attendance.date)
          .as('daily_counts')
      )
      .groupBy(sql`EXTRACT(DOW FROM date)`);
    
    const result: Record<number, { peak: number; average: number }> = {};
    
    patterns.forEach(p => {
      result[p.dayOfWeek] = {
        peak: p.maxCount || 30,
        average: p.avgCount || 25
      };
    });
    
    // Fill in missing days with defaults
    for (let i = 0; i < 7; i++) {
      if (!result[i]) {
        result[i] = { peak: 30, average: 25 };
      }
    }
    
    return result;
  }

  // Calculate staff scoring for recommendations
  private static async calculateStaffScore(
    staffMember: any,
    date: Date,
    expectedChildren: { peak: number; average: number }
  ): Promise<number> {
    let score = 100;
    
    // Check staff position compatibility
    if (staffMember.position === 'Lead Teacher') {
      score += 20;
    } else if (staffMember.position === 'Assistant Teacher') {
      score += 10;
    }
    
    // Check recent hours worked (avoid overtime)
    const weekStart = startOfWeek(date);
    const recentSchedules = await db
      .select()
      .from(staffSchedules)
      .where(
        and(
          eq(staffSchedules.staffId, staffMember.id),
          gte(staffSchedules.date, weekStart.toISOString().split('T')[0]),
          lte(staffSchedules.date, date.toISOString().split('T')[0])
        )
      );
    
    const hoursWorked = recentSchedules.reduce((total, schedule) => {
      return total + differenceInMinutes(schedule.scheduledEnd, schedule.scheduledStart) / 60;
    }, 0);
    
    if (hoursWorked > 35) {
      score -= (hoursWorked - 35) * 5; // Penalty for approaching overtime
    }
    
    // Day of week preferences (mock data - would come from staff preferences)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      score -= 10; // Weekend penalty
    }
    
    return Math.max(0, score);
  }

  // Generate recommendation reason
  private static getRecommendationReason(score: number, dayOfWeek: number): string {
    if (score >= 100) {
      return 'Highly recommended - good availability and qualifications';
    } else if (score >= 80) {
      return 'Recommended - suitable for this shift';
    } else if (score >= 60) {
      return 'Available but approaching overtime limits';
    } else {
      return 'Available as backup option';
    }
  }

  // Auto-generate optimal schedule
  static async autoGenerateSchedule(weekStart: Date): Promise<void> {
    const recommendations = await this.generateScheduleRecommendations(weekStart);
    const conflicts = await this.detectConflicts(weekStart);
    
    // Only auto-schedule if no high-severity conflicts
    const highSeverityConflicts = conflicts.filter(c => c.severity === 'high');
    if (highSeverityConflicts.length > 0) {
      throw new Error('Cannot auto-generate schedule due to existing conflicts');
    }
    
    // Group recommendations by date
    const recommendationsByDate = new Map<string, typeof recommendations>();
    recommendations.forEach(rec => {
      const dateKey = format(rec.recommendedStart, 'yyyy-MM-dd');
      const dateRecs = recommendationsByDate.get(dateKey) || [];
      dateRecs.push(rec);
      recommendationsByDate.set(dateKey, dateRecs);
    });
    
    // Create schedules from top recommendations
    for (const [dateKey, recs] of Array.from(recommendationsByDate.entries())) {
      const topRecs = recs.slice(0, 3); // Take top 3 recommendations per day
      
      for (const rec of topRecs) {
        await db.insert(staffSchedules).values({
          staffId: rec.staffId,
          date: rec.recommendedStart,
          scheduledStart: rec.recommendedStart,
          scheduledEnd: rec.recommendedEnd,
          room: 'Main Room', // Default room assignment
        });
      }
    }
  }
}


