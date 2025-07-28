import { storage } from '../storage';
import bcrypt from 'bcryptjs';

async function createParentAccounts() {
  console.log('🧑‍👨‍👦 Creating parent accounts...');
  
  try {
    // Get some children to assign to parents
    const children = await storage.getAllChildren({ page: 1, limit: 10 });
    
    if (children.data.length === 0) {
      console.log('❌ No children found. Please create children first.');
      return;
    }
    
    // Create parent accounts
    const parents = [
      {
        username: 'parent1',
        email: 'john.doe@email.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '(555) 123-4567',
        password: 'parent123',
        childrenIds: [children.data[0]?.id, children.data[1]?.id].filter(Boolean), // Assign first 2 children
      },
      {
        username: 'parent2', 
        email: 'jane.smith@email.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '(555) 234-5678',
        password: 'parent123',
        childrenIds: [children.data[2]?.id].filter(Boolean), // Assign third child
      },
      {
        username: 'parent3',
        email: 'robert.johnson@email.com',
        firstName: 'Robert',
        lastName: 'Johnson',
        phone: '(555) 345-6789',
        password: 'parent123',
        childrenIds: [children.data[3]?.id, children.data[4]?.id].filter(Boolean), // Assign 4th and 5th children
      },
    ];
    
    for (const parentData of parents) {
      const { password, ...parentInfo } = parentData;
      
      // Check if parent already exists
      const existing = await storage.getParentByEmail(parentInfo.email);
      if (existing) {
        console.log(`⚠️  Parent ${parentInfo.email} already exists`);
        continue;
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create parent
      const parent = await storage.createParent({
        ...parentInfo,
        passwordHash,
        emailVerified: true,
        isActive: true,
        notificationPreferences: JSON.stringify({
          email: {
            attendance: true,
            messages: true,
            reports: true,
            emergencies: true,
          },
          push: {
            attendance: true,
            messages: true,
            emergencies: true,
          }
        })
      });
      
      console.log(`✅ Created parent account:`);
      console.log(`   - Email: ${parent.email}`);
      console.log(`   - Username: ${parent.username}`);
      console.log(`   - Password: ${password}`);
      console.log(`   - Children: ${parentInfo.childrenIds.length} assigned`);
    }
    
    console.log('\n✅ Parent accounts created successfully!');
    console.log('\n📝 Parents can log in at /landing using their email and password');
    console.log('   They will see only their assigned children\'s information');
    
  } catch (error) {
    console.error('❌ Error creating parent accounts:', error);
  }
  
  process.exit(0);
}

// Run the script
createParentAccounts();