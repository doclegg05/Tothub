import { storage } from "../storage";
import { nanoid } from "nanoid";

async function addSampleData() {
  console.log("🌱 Adding sample data to database...");

  try {
    // Check if data already exists
    const existingChildren = await storage.getActiveChildren();
    const existingStaff = await storage.getActiveStaff();
    
    if (existingChildren.length > 0 || existingStaff.length > 0) {
      console.log("⚠️  Data already exists in the database!");
      console.log(`   Found ${existingChildren.length} children and ${existingStaff.length} staff members`);
      console.log("   Skipping sample data insertion to avoid duplicates.");
      return;
    }
    // Add sample children
    const children = [
      {
        firstName: "Emma",
        lastName: "Johnson",
        dateOfBirth: new Date("2021-03-15"),
        parentName: "Sarah Johnson",
        parentPhone: "(304) 555-0101",
        parentEmail: "sarah.johnson@email.com",
        emergencyContactName: "Mike Johnson",
        emergencyContactPhone: "(304) 555-0102",
        medicalNotes: "No known allergies",
        ageGroup: "preschool" as const,
        room: "Sunshine Room",
        allergies: ["None"],
        immunizations: ["DTaP", "IPV", "MMR", "Varicella"],
        isActive: true,
      },
      {
        firstName: "Liam",
        lastName: "Smith",
        dateOfBirth: new Date("2020-07-22"),
        parentName: "Jennifer Smith",
        parentPhone: "(304) 555-0201",
        parentEmail: "jen.smith@email.com",
        emergencyContactName: "Robert Smith",
        emergencyContactPhone: "(304) 555-0202",
        medicalNotes: "Mild peanut allergy - EpiPen in nurse's office",
        ageGroup: "preschool" as const,
        room: "Rainbow Room",
        allergies: ["Peanuts"],
        foodAllergies: ["Peanuts"],
        epiPenRequired: true,
        immunizations: ["DTaP", "IPV", "MMR", "Varicella", "Hepatitis B"],
        isActive: true,
      },
      {
        firstName: "Olivia",
        lastName: "Brown",
        dateOfBirth: new Date("2022-11-08"),
        parentName: "Michael Brown",
        parentPhone: "(304) 555-0301",
        parentEmail: "michael.brown@email.com",
        emergencyContactName: "Lisa Brown",
        emergencyContactPhone: "(304) 555-0302",
        medicalNotes: "Lactose intolerant",
        specialCareInstructions: "Naps from 12:30-2:30pm",
        ageGroup: "toddler" as const,
        room: "Butterfly Room",
        dietaryRestrictions: ["Lactose-free"],
        foodAllergies: ["Dairy"],
        immunizations: ["DTaP", "IPV", "Hepatitis B", "Hib"],
        isActive: true,
      },
      {
        firstName: "Noah",
        lastName: "Davis",
        dateOfBirth: new Date("2023-05-30"),
        parentName: "Amanda Davis",
        parentPhone: "(304) 555-0401",
        parentEmail: "amanda.davis@email.com",
        emergencyContactName: "James Davis",
        emergencyContactPhone: "(304) 555-0402",
        medicalNotes: "No medical concerns",
        specialCareInstructions: "New to the center, still adjusting",
        ageGroup: "infant" as const,
        room: "Nursery",
        allergies: ["None"],
        immunizations: ["DTaP", "IPV", "Hepatitis B"],
        isActive: true,
      },
      {
        firstName: "Sophia",
        lastName: "Wilson",
        dateOfBirth: new Date("2019-09-12"),
        parentName: "David Wilson",
        parentPhone: "(304) 555-0501",
        parentEmail: "david.wilson@email.com",
        emergencyContactName: "Emma Wilson",
        emergencyContactPhone: "(304) 555-0502",
        medicalNotes: "Asthma - inhaler in backpack",
        medicalConditions: ["Asthma"],
        inhalerRequired: true,
        specialCareInstructions: "Advanced reader, enjoys challenging activities",
        ageGroup: "school_age" as const,
        room: "Discovery Room",
        allergies: ["Dust", "Pollen"],
        immunizations: ["DTaP", "IPV", "MMR", "Varicella", "Hepatitis B", "Flu"],
        isActive: true,
      }
    ];

    console.log("Adding children...");
    const createdChildren = [];
    for (const child of children) {
      const created = await storage.createChild(child);
      createdChildren.push(created);
      console.log(`✓ Added child: ${child.firstName} ${child.lastName}`);
    }

    // Add sample staff
    const staff = [
      {
        firstName: "Jessica",
        lastName: "Anderson",
        position: "Lead Teacher",
        phone: "(304) 555-1001",
        email: "jessica.anderson@tothub.com",
        hireDate: "2020-08-15",
        certifications: ["CDA", "CPR", "First Aid"],
        notes: "Preschool room lead, excellent with behavior management",
        isActive: true,
        hourlyRate: 1850, // $18.50 stored as cents
        employmentType: "Full-time" as const,
      },
      {
        firstName: "Michael",
        lastName: "Thompson",
        position: "Assistant Teacher",
        phone: "(304) 555-1002",
        email: "michael.thompson@tothub.com",
        hireDate: "2022-01-10",
        certifications: ["CPR", "First Aid"],
        notes: "Floats between toddler and preschool rooms",
        isActive: true,
        hourlyRate: 1500, // $15.00 stored as cents
        employmentType: "Full-time" as const,
      },
      {
        firstName: "Emily",
        lastName: "Martinez",
        position: "Infant Care Specialist",
        phone: "(304) 555-1003",
        email: "emily.martinez@tothub.com",
        hireDate: "2021-06-20",
        certifications: ["Infant Care Certification", "CPR", "First Aid"],
        notes: "Specializes in infant care, bilingual (English/Spanish)",
        isActive: true,
        hourlyRate: 1700, // $17.00 stored as cents
        employmentType: "Full-time" as const,
      },
      {
        firstName: "Robert",
        lastName: "Chen",
        position: "Part-time Assistant",
        phone: "(304) 555-1004",
        email: "robert.chen@tothub.com",
        hireDate: "2023-03-01",
        certifications: ["CPR"],
        notes: "Works afternoons, studying early childhood education",
        isActive: true,
        hourlyRate: 1350, // $13.50 stored as cents
        employmentType: "Part-time" as const,
      }
    ];

    console.log("\nAdding staff...");
    const createdStaff = [];
    for (const member of staff) {
      const created = await storage.createStaff(member);
      createdStaff.push(created);
      console.log(`✓ Added staff: ${member.firstName} ${member.lastName} - ${member.position}`);
    }

    // Add sample attendance records for today
    console.log("\nAdding attendance records for today...");
    const today = new Date().toISOString().split('T')[0];
    
    // Check in some children
    const checkIns = [
      { childId: createdChildren[0].id, time: "08:00", mood: "happy" as const },
      { childId: createdChildren[1].id, time: "08:15", mood: "neutral" as const },
      { childId: createdChildren[2].id, time: "07:45", mood: "happy" as const },
      { childId: createdChildren[4].id, time: "08:30", mood: "tired" as const },
    ];

    for (const checkIn of checkIns) {
      await storage.createAttendance({
        childId: checkIn.childId,
        date: today,
        checkIn: new Date(`${today}T${checkIn.time}:00.000Z`),
        authorizedBy: "Parent",
        mood: checkIn.mood,
      });
      const child = createdChildren.find(c => c.id === checkIn.childId);
      console.log(`✓ Checked in: ${child?.firstName} ${child?.lastName} at ${checkIn.time}`);
    }

    // Add staff schedules for today
    console.log("\nAdding staff schedules for today...");
    const schedules = [
      { 
        staffId: createdStaff[0].id, 
        room: "Preschool Room",
        startTime: "07:00",
        endTime: "15:30",
      },
      { 
        staffId: createdStaff[1].id, 
        room: "Toddler Room",
        startTime: "08:00",
        endTime: "16:30",
      },
      { 
        staffId: createdStaff[2].id, 
        room: "Infant Room",
        startTime: "07:30",
        endTime: "16:00",
      },
      { 
        staffId: createdStaff[3].id, 
        room: "Float",
        startTime: "14:00",
        endTime: "18:00",
      },
    ];

    for (const schedule of schedules) {
      await storage.createStaffSchedule({
        staffId: schedule.staffId,
        date: today,
        startTime: new Date(`${today}T${schedule.startTime}:00.000Z`),
        endTime: new Date(`${today}T${schedule.endTime}:00.000Z`),
        room: schedule.room,
      });
      const staffMember = createdStaff.find(s => s.id === schedule.staffId);
      console.log(`✓ Scheduled: ${staffMember?.firstName} ${staffMember?.lastName} in ${schedule.room}`);
    }

    // Check in staff
    console.log("\nChecking in staff...");
    await storage.updateStaffSchedule(createdStaff[0].id, today, {
      actualStart: new Date(`${today}T07:05:00.000Z`),
    });
    console.log(`✓ ${createdStaff[0].firstName} ${createdStaff[0].lastName} checked in at 07:05`);

    await storage.updateStaffSchedule(createdStaff[1].id, today, {
      actualStart: new Date(`${today}T08:00:00.000Z`),
    });
    console.log(`✓ ${createdStaff[1].firstName} ${createdStaff[1].lastName} checked in at 08:00`);

    await storage.updateStaffSchedule(createdStaff[2].id, today, {
      actualStart: new Date(`${today}T07:35:00.000Z`),
    });
    console.log(`✓ ${createdStaff[2].firstName} ${createdStaff[2].lastName} checked in at 07:35`);

    console.log("\n✅ Sample data added successfully!");
    console.log(`   - ${children.length} children`);
    console.log(`   - ${staff.length} staff members`);
    console.log(`   - ${checkIns.length} attendance records`);
    console.log(`   - ${schedules.length} staff schedules`);

  } catch (error) {
    console.error("❌ Error adding sample data:", error);
    throw error;
  }
}

// Run the script
addSampleData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });