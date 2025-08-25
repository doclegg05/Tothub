import { storage } from "../storage";
import type { InsertChild, InsertStaff, InsertAttendance } from "@shared/schema";

interface TestChild {
  firstName: string;
  lastName: string;
  ageMonths: number;
  room: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
}

const TEST_CHILDREN: TestChild[] = [
  // Infants (0-16 months) - Highest ratio requirements
  { firstName: "Emma", lastName: "Johnson", ageMonths: 8, room: "Infant Room A", parentName: "Sarah Johnson", parentEmail: "sarah.j@email.com", parentPhone: "(555) 123-4567" },
  { firstName: "Liam", lastName: "Chen", ageMonths: 12, room: "Infant Room A", parentName: "David Chen", parentEmail: "david.chen@email.com", parentPhone: "(555) 234-5678" },
  { firstName: "Olivia", lastName: "Rodriguez", ageMonths: 15, room: "Infant Room B", parentName: "Maria Rodriguez", parentEmail: "maria.r@email.com", parentPhone: "(555) 345-6789" },
  
  // Young Toddlers (16 months - 2 years)
  { firstName: "Noah", lastName: "Williams", ageMonths: 18, room: "Toddler Room A", parentName: "Jennifer Williams", parentEmail: "jen.w@email.com", parentPhone: "(555) 456-7890" },
  { firstName: "Ava", lastName: "Brown", ageMonths: 22, room: "Toddler Room A", parentName: "Michael Brown", parentEmail: "mike.brown@email.com", parentPhone: "(555) 567-8901" },
  
  // Toddlers (2 years)
  { firstName: "Ethan", lastName: "Davis", ageMonths: 25, room: "Toddler Room B", parentName: "Lisa Davis", parentEmail: "lisa.davis@email.com", parentPhone: "(555) 678-9012" },
  { firstName: "Sophia", lastName: "Miller", ageMonths: 28, room: "Toddler Room B", parentName: "James Miller", parentEmail: "james.m@email.com", parentPhone: "(555) 789-0123" },
  
  // Preschool (3-5 years)
  { firstName: "Mason", lastName: "Wilson", ageMonths: 42, room: "Preschool Room A", parentName: "Amanda Wilson", parentEmail: "amanda.w@email.com", parentPhone: "(555) 890-1234" },
  { firstName: "Isabella", lastName: "Moore", ageMonths: 48, room: "Preschool Room A", parentName: "Robert Moore", parentEmail: "robert.moore@email.com", parentPhone: "(555) 901-2345" },
  
  // School Age (5+ years)
  { firstName: "Lucas", lastName: "Taylor", ageMonths: 72, room: "School Age Room", parentName: "Christina Taylor", parentEmail: "chris.taylor@email.com", parentPhone: "(555) 012-3456" },
];

const TEST_STAFF = [
  { firstName: "Jessica", lastName: "Anderson", position: "Lead Teacher", email: "jessica.a@daycare.com", phone: "(555) 111-2222" },
  { firstName: "Michael", lastName: "Thompson", position: "Assistant Teacher", email: "michael.t@daycare.com", phone: "(555) 333-4444" },
  { firstName: "Sarah", lastName: "Garcia", position: "Infant Specialist", email: "sarah.g@daycare.com", phone: "(555) 555-6666" },
];

function getAgeGroupFromMonths(ageMonths: number): string {
  if (ageMonths <= 16) return "infant";
  if (ageMonths <= 24) return "young_toddler";
  if (ageMonths <= 36) return "toddler";
  if (ageMonths <= 60) return "preschool";
  if (ageMonths <= 96) return "school_age";
  return "older_school_age";
}

function calculateBirthDate(ageMonths: number): Date {
  const now = new Date();
  const birthDate = new Date(now);
  birthDate.setMonth(birthDate.getMonth() - ageMonths);
  return birthDate;
}

export class TestDataService {
  
  static async seedTestData(): Promise<{
    children: any[];
    staff: any[];
    attendanceRecords: any[];
    message: string;
  }> {
    try {
      console.log("🎯 Starting test data generation for ratio testing...");
      
      // Create staff first
      const staffResults = [];
      for (const staffData of TEST_STAFF) {
        const insertStaffData: InsertStaff = {
          firstName: staffData.firstName,
          lastName: staffData.lastName,
          position: staffData.position,
          email: staffData.email,
          phone: staffData.phone,
          isActive: true,
        };
        
        const staff = await storage.createStaff(insertStaffData);
        staffResults.push(staff);
        console.log(`👨‍🏫 Created staff: ${staff.firstName} ${staff.lastName}`);
      }

      // Create children with diverse ages
      const childrenResults = [];
      for (const childData of TEST_CHILDREN) {
        const birthDate = calculateBirthDate(childData.ageMonths);
        const ageGroup = getAgeGroupFromMonths(childData.ageMonths);
        
        const insertChildData: InsertChild = {
          firstName: childData.firstName,
          lastName: childData.lastName,
          dateOfBirth: birthDate,
          ageGroup: ageGroup as any,
          room: childData.room,
          parentName: childData.parentName,
          parentEmail: childData.parentEmail,
          parentPhone: childData.parentPhone,
          emergencyContactName: `Emergency for ${childData.parentName}`,
          emergencyContactPhone: childData.parentPhone,
          allergies: [],
          medicalNotes: "",
          immunizations: [],
          isActive: true,
        };

        const child = await storage.createChild(insertChildData);
        childrenResults.push(child);
        console.log(`👶 Created child: ${child.firstName} ${child.lastName} (${ageGroup}, ${childData.ageMonths}mo) in ${child.room}`);
      }

      // Create check-in records for all children to simulate a busy day
      const attendanceResults = [];
      const checkInTime = new Date();
      checkInTime.setHours(8, 0, 0, 0); // 8:00 AM check-ins

      for (const child of childrenResults) {
        // Stagger check-in times slightly for realism
        const individualCheckIn = new Date(checkInTime);
        individualCheckIn.setMinutes(individualCheckIn.getMinutes() + Math.floor(Math.random() * 60));

        const insertAttendanceData: InsertAttendance = {
          childId: child.id,
          checkInTime: individualCheckIn,
          checkInBy: child.parentName,
          room: child.room,
          date: new Date(),
          notes: `Check-in for ${child.firstName}`,
          moodRating: Math.floor(Math.random() * 5) + 1, // Random mood 1-5
        };

        const attendance = await storage.createAttendance(insertAttendanceData);
        attendanceResults.push(attendance);
        console.log(`✅ Checked in: ${child.firstName} at ${individualCheckIn.toLocaleTimeString()}`);
      }

      console.log("🚀 Test data generation complete!");
      console.log(`📊 Created: ${childrenResults.length} children, ${staffResults.length} staff, ${attendanceResults.length} attendance records`);

      return {
        children: childrenResults,
        staff: staffResults,
        attendanceRecords: attendanceResults,
        message: `Successfully created test scenario with ${childrenResults.length} children across different age groups and ${staffResults.length} staff members. All children are checked in to simulate a full day.`
      };

    } catch (error) {
      console.error("❌ Error seeding test data:", error);
      throw new Error("Failed to seed test data");
    }
  }

  static async clearTestData(): Promise<{ message: string }> {
    try {
      console.log("🧹 Clearing all test data...");
      
      // Clear in reverse order to handle foreign key constraints
      await storage.clearAllAttendance();
      await storage.clearAllChildren();
      await storage.clearAllStaff();
      
      console.log("✅ Test data cleared successfully");
      return { message: "All test data cleared successfully" };
    } catch (error) {
      console.error("❌ Error clearing test data:", error);
      throw new Error("Failed to clear test data");
    }
  }

  static getTestScenarioSummary() {
    return {
      totalChildren: TEST_CHILDREN.length,
      ageGroupBreakdown: {
        infants: TEST_CHILDREN.filter(c => c.ageMonths <= 16).length,
        youngToddlers: TEST_CHILDREN.filter(c => c.ageMonths > 16 && c.ageMonths <= 24).length,
        toddlers: TEST_CHILDREN.filter(c => c.ageMonths > 24 && c.ageMonths <= 36).length,
        preschool: TEST_CHILDREN.filter(c => c.ageMonths > 36 && c.ageMonths <= 60).length,
        schoolAge: TEST_CHILDREN.filter(c => c.ageMonths > 60).length,
      },
      rooms: [...new Set(TEST_CHILDREN.map(c => c.room))],
      expectedRatioChallenges: [
        "Infant rooms will show high ratio requirements (1:4 in most states)",
        "Mixed age groups will trigger complex ratio calculations",
        "Multiple rooms will test room-specific compliance",
      ]
    };
  }
}