import { storage } from "../storage";

async function addSampleStaff() {
  try {
    console.log("Adding sample staff members...");

    const sampleStaff = [
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@tothub.com",
        phone: "(555) 123-4567",
        position: "Lead Teacher",
        isActive: true
      },
      {
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@tothub.com",
        phone: "(555) 234-5678",
        position: "Assistant Teacher",
        isActive: true
      },
      {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@tothub.com",
        phone: "(555) 345-6789",
        position: "Teacher",
        isActive: true
      },
      {
        firstName: "James",
        lastName: "Wilson",
        email: "james.wilson@tothub.com",
        phone: "(555) 456-7890",
        position: "Floater",
        isActive: true
      },
      {
        firstName: "Lisa",
        lastName: "Martinez",
        email: "lisa.martinez@tothub.com",
        phone: "(555) 567-8901",
        position: "Assistant Teacher",
        isActive: true
      }
    ];

    for (const staffData of sampleStaff) {
      try {
        const staff = await storage.createStaff(staffData);
        console.log(`✓ Added staff: ${staff.firstName} ${staff.lastName} (${staff.position})`);
      } catch (error) {
        console.log(`⚠ Staff ${staffData.firstName} ${staffData.lastName} may already exist`);
      }
    }

    console.log("Sample staff data added successfully!");
  } catch (error) {
    console.error("Error adding sample staff:", error);
  }
}

// Run the script
addSampleStaff().then(() => {
  console.log("Script completed");
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});