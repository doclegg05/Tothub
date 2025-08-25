import { db } from "../db";
import { users, children, schedules } from "../../shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { TimefoldRequest, TimefoldEmployee, TimefoldShift, TimefoldConstraints } from "./timefoldClient";
import { format, parseISO } from "date-fns";

export class TimefoldAdapter {
    async convertToTimefoldRequest(weekStart: Date, centerId: string): Promise<TimefoldRequest> {
        try {
            // Fetch staff members
            const staffMembers = await db.select().from(users).where(eq(users.role, "staff"));
            
            // Fetch children for the week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const childrenData = await db.select().from(children)
                .where(and(
                    gte(children.enrollmentDate, weekStart),
                    lte(children.enrollmentDate, weekEnd)
                ));
            
            // Convert staff to Timefold format
            const employees: TimefoldEmployee[] = staffMembers.map(staff => ({
                id: staff.id,
                name: `${staff.firstName} ${staff.lastName}`,
                skills: this.extractSkills(staff),
                availability: this.generateAvailability(staff),
                maxHoursPerWeek: 40,
                position: staff.position || "Teacher",
                active: staff.active || true
            }));
            
            // Generate shifts based on children and requirements
            const shifts: TimefoldShift[] = this.generateShifts(weekStart, childrenData);
            
            // Create constraints
            const constraints: TimefoldConstraints = {
                minStaffPerShift: 2,
                maxStaffPerShift: 4,
                requireLeadTeacher: true,
                maxHoursPerWeek: 40,
                minRestBetweenShifts: 8,
                preferredShifts: ["morning", "afternoon"]
            };
            
            return {
                employees,
                shifts,
                constraints
            };
            
        } catch (error) {
            console.error("Error converting to Timefold request:", error);
            throw new Error("Failed to convert data for Timefold");
        }
    }
    
    private extractSkills(staffMember: any): string[] {
        const skills: string[] = [];
        
        if (staffMember.certifications) {
            skills.push(...staffMember.certifications.split(',').map((s: string) => s.trim()));
        }
        
        if (staffMember.qualifications) {
            skills.push(...staffMember.qualifications.split(',').map((s: string) => s.trim()));
        }
        
        // Add position-based skills
        if (staffMember.position) {
            skills.push(staffMember.position);
        }
        
        return skills.filter(skill => skill.length > 0);
    }
    
    private generateAvailability(staffMember: any): Array<{
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        preferred: boolean;
    }> {
        // Generate default availability for all weekdays
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        return weekdays.map(day => ({
            dayOfWeek: day,
            startTime: "08:00",
            endTime: "17:00",
            preferred: true
        }));
    }
    
    private generateShifts(weekStart: Date, childrenData: any[]): TimefoldShift[] {
        const shifts: TimefoldShift[] = [];
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        weekdays.forEach((day, index) => {
            const shiftDate = new Date(weekStart);
            shiftDate.setDate(shiftDate.getDate() + index);
            
            // Morning shift
            shifts.push({
                id: `shift_${day}_morning`,
                date: format(shiftDate, 'yyyy-MM-dd'),
                startTime: "08:00",
                endTime: "12:00",
                requiredSkills: ["Teacher"],
                room: "Main Room",
                requiredStaff: 2,
                minStaff: 2,
                maxStaff: 3,
                shiftType: "morning"
            });
            
            // Afternoon shift
            shifts.push({
                id: `shift_${day}_afternoon`,
                date: format(shiftDate, 'yyyy-MM-dd'),
                startTime: "12:00",
                endTime: "17:00",
                requiredSkills: ["Teacher"],
                room: "Main Room",
                requiredStaff: 2,
                minStaff: 2,
                maxStaff: 3,
                shiftType: "afternoon"
            });
        });
        
        return shifts;
    }
    
    convertFromTimefoldAssignments(assignments: any[]): any[] {
        // Convert Timefold assignments back to TotHub format
        return assignments.map(assignment => ({
            id: assignment.id,
            employeeId: assignment.employeeId,
            employeeName: assignment.employeeName,
            shiftId: assignment.shiftId,
            room: assignment.room,
            date: assignment.date,
            startTime: assignment.startTime,
            endTime: assignment.endTime,
            status: assignment.status,
            score: assignment.score
        }));
    }
}




