import http from 'http';

const API_BASE = 'http://localhost:5000/api';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `${API_BASE}${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testStaffScheduling() {
  console.log('🧪 Testing Staff Scheduling Validation...\n');

  try {
    // Step 1: Create a staff member
    console.log('1. Creating staff member...');
    const staffResponse = await makeRequest('POST', '/api/staff', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      position: 'Teacher',
      isActive: 1
    });
    
    if (staffResponse.status !== 201) {
      console.log('❌ Failed to create staff:', staffResponse.data);
      return;
    }
    
    const staffId = staffResponse.data.id;
    console.log('✅ Staff created with ID:', staffId);

    // Step 2: Test scheduling for past time (should fail)
    console.log('\n2. Testing scheduling for past time...');
    const pastTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const pastScheduleResponse = await makeRequest('POST', '/api/schedules', {
      staffId: staffId,
      room: 'Infant Room',
      scheduledStart: pastTime.toISOString(),
      scheduledEnd: new Date(pastTime.getTime() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours later
      date: pastTime.toISOString().split('T')[0],
      scheduleType: 'regular'
    });

    if (pastScheduleResponse.status === 400 && pastScheduleResponse.data.message.includes('past')) {
      console.log('✅ Correctly rejected past time scheduling:', pastScheduleResponse.data.message);
    } else {
      console.log('❌ Should have rejected past time scheduling:', pastScheduleResponse);
    }

    // Step 3: Test scheduling with end time before start time (should fail)
    console.log('\n3. Testing scheduling with end time before start time...');
    const futureTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const invalidScheduleResponse = await makeRequest('POST', '/api/schedules', {
      staffId: staffId,
      room: 'Infant Room',
      scheduledStart: futureTime.toISOString(),
      scheduledEnd: new Date(futureTime.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour before start
      date: futureTime.toISOString().split('T')[0],
      scheduleType: 'regular'
    });

    if (invalidScheduleResponse.status === 400 && invalidScheduleResponse.data.message.includes('End time must be after start time')) {
      console.log('✅ Correctly rejected invalid time range:', invalidScheduleResponse.data.message);
    } else {
      console.log('❌ Should have rejected invalid time range:', invalidScheduleResponse);
    }

    // Step 4: Test valid scheduling (should succeed)
    console.log('\n4. Testing valid scheduling...');
    const validStart = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now
    const validEnd = new Date(validStart.getTime() + 8 * 60 * 60 * 1000); // 8 hours later
    const validScheduleResponse = await makeRequest('POST', '/api/schedules', {
      staffId: staffId,
      room: 'Infant Room',
      scheduledStart: validStart.toISOString(),
      scheduledEnd: validEnd.toISOString(),
      date: validStart.toISOString().split('T')[0],
      scheduleType: 'regular'
    });

    if (validScheduleResponse.status === 201) {
      console.log('✅ Successfully created valid schedule:', validScheduleResponse.data.id);
    } else {
      console.log('❌ Failed to create valid schedule:', validScheduleResponse);
    }

    // Step 5: Test getting schedules
    console.log('\n5. Testing get schedules...');
    const schedulesResponse = await makeRequest('GET', '/api/schedules');
    if (schedulesResponse.status === 200) {
      console.log('✅ Successfully retrieved schedules:', schedulesResponse.data.length, 'schedules found');
    } else {
      console.log('❌ Failed to retrieve schedules:', schedulesResponse);
    }

    console.log('\n🎉 Staff scheduling validation test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testStaffScheduling();
