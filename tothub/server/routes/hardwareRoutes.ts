import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Device configuration schema
const deviceConfigSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['door_lock', 'camera', 'fingerprint', 'keypad', 'rfid', 'intercom']),
  connection: z.object({
    type: z.enum(['network', 'serial', 'bluetooth', 'gpio']),
    ipAddress: z.string().optional(),
    port: z.string().optional(),
    baudRate: z.number().optional(),
    deviceId: z.string().optional(),
    pinConfiguration: z.string().optional(),
  }),
});

// Test connection endpoint
router.post('/test-connection', async (req: Request, res: Response) => {
  try {
    const config = deviceConfigSchema.parse(req.body);
    
    // Simulate connection testing based on device type and connection method
    const testResult = await simulateConnectionTest(config);
    
    res.json(testResult);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration',
        errors: error.errors,
      });
    }
    
    console.error('Hardware test error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during connection test',
    });
  }
});

// Save device configuration
router.post('/devices', async (req: Request, res: Response) => {
  try {
    const config = deviceConfigSchema.extend({
      isConnected: z.boolean(),
    }).parse(req.body);
    
    // In a real implementation, this would save to the database
    // For now, we'll simulate saving the configuration
    const deviceId = generateDeviceId();
    
    console.log(`📱 Hardware device saved: ${config.name} (${config.type})`);
    console.log(`🔗 Connection: ${config.connection.type}`);
    
    res.json({
      success: true,
      deviceId,
      message: 'Device configuration saved successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration',
        errors: error.errors,
      });
    }
    
    console.error('Device save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save device configuration',
    });
  }
});

// Get all configured devices
router.get('/devices', async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would fetch from the database
    const devices = getConfiguredDevices();
    res.json(devices);
  } catch (error) {
    console.error('Device fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices',
    });
  }
});

// Test specific device
router.post('/devices/:deviceId/test', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    
    // Simulate device testing
    const testResult = await testExistingDevice(deviceId);
    
    res.json(testResult);
  } catch (error) {
    console.error('Device test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test device',
    });
  }
});

// Simulate connection testing based on device configuration
async function simulateConnectionTest(config: any): Promise<{ success: boolean; message: string; details?: any }> {
  // Add realistic delay to simulate actual hardware testing
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  const { type, connection } = config;
  
  // Validate configuration completeness
  if (connection.type === 'network' && (!connection.ipAddress || !connection.port)) {
    return {
      success: false,
      message: 'Network connection requires IP address and port',
    };
  }
  
  if (connection.type === 'serial' && (!connection.port || !connection.baudRate)) {
    return {
      success: false,
      message: 'Serial connection requires port and baud rate',
    };
  }
  
  if (connection.type === 'bluetooth' && !connection.deviceId) {
    return {
      success: false,
      message: 'Bluetooth connection requires device ID',
    };
  }
  
  if (connection.type === 'gpio' && !connection.pinConfiguration) {
    return {
      success: false,
      message: 'GPIO connection requires pin configuration',
    };
  }
  
  // Simulate different test scenarios
  const scenarios = getTestScenarios(type, connection.type);
  const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  return selectedScenario;
}

function getTestScenarios(deviceType: string, connectionType: string): Array<{ success: boolean; message: string; details?: Record<string, any> }> {
  const successScenarios = [
    {
      success: true,
      message: `✅ Connection successful! ${deviceType} is responding correctly.`,
      details: {
        responseTime: Math.floor(Math.random() * 100 + 50) + 'ms',
        firmwareVersion: '2.1.4',
        signalStrength: connectionType === 'bluetooth' ? Math.floor(Math.random() * 30 + 70) + '%' : undefined,
      }
    },
    {
      success: true,
      message: `✅ Device connected and operational. All safety checks passed.`,
      details: {
        responseTime: Math.floor(Math.random() * 150 + 30) + 'ms',
        firmwareVersion: '2.0.8',
        batteryLevel: connectionType === 'bluetooth' ? Math.floor(Math.random() * 40 + 60) + '%' : undefined,
      }
    }
  ];
  
  const errorScenarios = [
    {
      success: false,
      message: `❌ Connection timeout. Please check your ${connectionType} settings and try again.`,
    },
    {
      success: false,
      message: `❌ Device not responding. Verify power and ${connectionType} configuration.`,
    },
    {
      success: false,
      message: `❌ Authentication failed. Check device credentials and security settings.`,
    }
  ];
  
  // 80% success rate for realistic testing
  if (Math.random() < 0.8) {
    return successScenarios;
  } else {
    return errorScenarios;
  }
}

function generateDeviceId(): string {
  return `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getConfiguredDevices() {
  // Mock data for demonstration
  return [
    {
      id: 'hw_1234567890_main_door',
      name: 'Main Entrance Door Lock',
      type: 'door_lock',
      connection: { type: 'network', ipAddress: '192.168.1.100', port: '80' },
      isConnected: true,
      lastTest: new Date(),
      firmwareVersion: '2.1.4',
    },
    {
      id: 'hw_1234567891_keypad_01',
      name: 'Front Door Keypad',
      type: 'keypad',
      connection: { type: 'serial', port: 'COM1', baudRate: 9600 },
      isConnected: true,
      lastTest: new Date(Date.now() - 3600000), // 1 hour ago
      firmwareVersion: '1.8.2',
    }
  ];
}

async function testExistingDevice(deviceId: string): Promise<{ success: boolean; message: string; details?: Record<string, any> }> {
  // Simulate testing existing device
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const isOnline = Math.random() < 0.9; // 90% success rate for existing devices
  
  if (isOnline) {
    return {
      success: true,
      message: '✅ Device is online and responding normally',
      details: {
        responseTime: Math.floor(Math.random() * 100 + 30) + 'ms',
        lastActivity: new Date(),
        status: 'operational'
      }
    };
  } else {
    return {
      success: false,
      message: '❌ Device is not responding. Check power and connection.',
    };
  }
}

export default router;