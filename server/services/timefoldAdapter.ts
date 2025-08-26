import { storage } from '../storage';
import { 
  TimefoldRequest, 
  TimefoldEmployee, 
  TimefoldShift, 
  TimefoldConstraints,
  TimefoldAvailability 
} from './timefoldClient';
import { addDays, startOfWeek, endOfWeek, format } from 'date-fns';

export class TimefoldAdapter {
  /**
   * Convert TotHub data to Timefold request format
   */
  static async convertToTimefoldRequest(
    weekStart: Date,
    centerId?: string
  ): Promise<TimefoldRequest> {
    try {
      // Get active staff
      const staff = await storage.getActiveStaff({ page: 1, limit: 1000 });
      
      // Get rooms and expected child counts
      const rooms = await this.getRoomsWithChildCounts(weekStart, centerId);
      
      // Convert staff to Timefold employees
      const employees = await this.convertStaffToEmployees(staff);
      
      // Generate shifts based on rooms and child counts
      const shifts = this.generateShiftsFromRooms(rooms, weekStart);
      
      // Create constraints
      const constraints = this.createDefaultConstraints();
      
      return {
        employees,
        shifts,
        constraints
      };
      
    } catch (error) {
      throw new Error(`Failed to convert to Timefold request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert TotHub staff to Timefold employees
   */
  private static async convertStaffToEmployees(staff: any[]): Promise<TimefoldEmployee[]> {
    return staff.map(staffMember => {
      // Convert skills from TotHub format
      const skills = this.extractSkillsFromStaff(staffMember);
      
      // Generate availability based on staff preferences and constraints
      const availability = this.generateStaffAvailability(staffMember);
      
      return {
        id: staffMember.id,
        name: `${staffMember.firstName} ${staffMember.lastName}`,
        skills,
        availability,
        maxHoursPerWeek: staffMember.maxHoursPerWeek || 40,
        position: staffMember.position || 'Staff',
        isActive: staffMember.isActive === 1
      };
    });
  }

  /**
   * Extract skills from staff member
   */
  private static extractSkillsFromStaff(staffMember: any): string[] {
    const skills: string[] = [];
    
    // Position-based skills
    if (staffMember.position) {
      if (staffMember.position.toLowerCase().includes('lead')) {
        skills.push('lead-teacher');
      }
      if (staffMember.position.toLowerCase().includes('assistant')) {
        skills.push('assistant-teacher');
      }
    }
    
    // Certification-based skills
    if (staffMember.certifications) {
      try {
        const certs = JSON.parse(staffMember.certifications);
        if (certs.cpr) skills.push('cpr-certified');
        if (certs.firstAid) skills.push('first-aid');
        if (certs.specialNeeds) skills.push('special-needs');
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Default skills for all staff
    skills.push('basic-care');
    
    return skills;
  }

  /**
   * Generate staff availability for the week
   */
  private static generateStaffAvailability(staffMember: any): TimefoldAvailability[] {
    const availability: TimefoldAvailability[] = [];
    
    // For now, generate standard weekday availability
    // In a real implementation, this would come from staff preferences
    const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    
    weekdays.forEach(day => {
      availability.push({
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '17:00',
        isPreferred: true
      });
    });
    
    return availability;
  }

  /**
   * Get rooms with expected child counts
   */
  private static async getRoomsWithChildCounts(weekStart: Date, centerId?: string): Promise<any[]> {
    try {
      // Get children and their room assignments
      const children = await storage.getActiveChildren({ page: 1, limit: 1000 });
      
      // Group children by room
      const roomMap = new Map<string, number>();
      children.forEach(child => {
        if (child.room) {
          const count = roomMap.get(child.room) || 0;
          roomMap.set(child.room, count + 1);
        }
      });
      
      // Convert to array format
      return Array.from(roomMap.entries()).map(([room, childCount]) => ({
        name: room,
        childCount,
        requiredStaff: Math.ceil(childCount / 4), // 4:1 ratio
        minStaff: Math.ceil(childCount / 6), // 6:1 minimum
        maxStaff: Math.ceil(childCount / 3)  // 3:1 maximum
      }));
      
    } catch (error) {
      // Fallback to default rooms if database query fails
      return [
        { name: 'Infant Room', childCount: 8, requiredStaff: 2, minStaff: 2, maxStaff: 3 },
        { name: 'Toddler Room', childCount: 12, requiredStaff: 3, minStaff: 2, maxStaff: 4 },
        { name: 'Preschool Room', childCount: 16, requiredStaff: 4, minStaff: 3, maxStaff: 5 }
      ];
    }
  }

  /**
   * Generate shifts from rooms
   */
  private static generateShiftsFromRooms(rooms: any[], weekStart: Date): TimefoldShift[] {
    const shifts: TimefoldShift[] = [];
    let shiftId = 1;
    
    // Generate shifts for each day of the week
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = addDays(weekStart, dayOffset);
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends for now
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Generate shifts for each room
      rooms.forEach(room => {
        // Morning shift
        shifts.push({
          id: `shift_${shiftId++}`,
          date: format(currentDate, 'yyyy-MM-dd'),
          startTime: '08:00',
          endTime: '17:00',
          requiredSkills: ['lead-teacher'],
          room: room.name,
          requiredStaff: room.requiredStaff,
          minStaff: room.minStaff,
          maxStaff: room.maxStaff,
          shiftType: 'full-day'
        });
      });
    }
    
    return shifts;
  }

  /**
   * Create default scheduling constraints
   */
  private static createDefaultConstraints(): TimefoldConstraints {
    return {
      maxHoursPerWeek: 40,
      minHoursPerWeek: 20,
      maxConsecutiveDays: 5,
      minRestHoursBetweenShifts: 8,
      allowOvertime: false,
      maxOvertimeHoursPerWeek: 0,
      childToStaffRatio: 4.0,
      requireLeadTeacherPerRoom: true,
      allowSplitShifts: false
    };
  }

  /**
   * Convert Timefold assignments back to TotHub schedule format
   */
  static convertFromTimefoldAssignments(assignments: any[]): any[] {
    return assignments.map(assignment => ({
      id: assignment.id,
      staffId: assignment.employeeId,
      staffName: assignment.employeeName,
      room: assignment.room,
      date: assignment.date,
      scheduledStart: assignment.startTime,
      scheduledEnd: assignment.endTime,
      status: 'scheduled',
      source: 'timefold'
    }));
  }
}


