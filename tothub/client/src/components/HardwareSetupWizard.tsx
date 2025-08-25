import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, 
  Wifi, 
  Usb, 
  Bluetooth, 
  Lock, 
  Camera, 
  Fingerprint,
  Shield,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Settings,
  Zap,
  CheckCircle
} from 'lucide-react';

interface DeviceConnection {
  type: 'network' | 'serial' | 'bluetooth' | 'gpio';
  port?: string;
  ipAddress?: string;
  baudRate?: number;
  deviceId?: string;
  pinConfiguration?: string;
}

interface HardwareDevice {
  id: string;
  name: string;
  type: 'door_lock' | 'camera' | 'fingerprint' | 'keypad' | 'rfid' | 'intercom';
  connection: DeviceConnection;
  isConnected: boolean;
  lastTest?: Date;
  firmwareVersion?: string;
}

const DEVICE_TYPES = [
  { value: 'door_lock', label: 'Magnetic Door Lock', icon: Lock, description: 'Electronic door lock with fail-safe/fail-secure modes' },
  { value: 'keypad', label: 'Keypad Entry', icon: Settings, description: 'PIN-based entry system' },
  { value: 'rfid', label: 'RFID Card Reader', icon: Shield, description: 'Key card or proximity card reader' },
  { value: 'fingerprint', label: 'Fingerprint Scanner', icon: Fingerprint, description: 'Biometric fingerprint authentication' },
  { value: 'camera', label: 'Security Camera', icon: Camera, description: 'Video monitoring and face recognition' },
  { value: 'intercom', label: 'Video Intercom', icon: Zap, description: 'Two-way communication system' },
];

const CONNECTION_TYPES = [
  { value: 'network', label: 'Network (TCP/IP)', icon: Wifi, description: 'Ethernet or WiFi connection' },
  { value: 'serial', label: 'Serial (RS-232/485)', icon: Usb, description: 'Direct serial cable connection' },
  { value: 'bluetooth', label: 'Bluetooth', icon: Bluetooth, description: 'Wireless Bluetooth connection' },
  { value: 'gpio', label: 'GPIO Pins', icon: Settings, description: 'Direct hardware pin connection' },
];

export function HardwareSetupWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [selectedConnectionType, setSelectedConnectionType] = useState<string>('');
  const [deviceConfig, setDeviceConfig] = useState<Partial<HardwareDevice>>({});
  const [testResults, setTestResults] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleDeviceTypeSelect = (type: string) => {
    setSelectedDeviceType(type);
    const deviceInfo = DEVICE_TYPES.find(d => d.value === type);
    setDeviceConfig({
      ...deviceConfig,
      type: type as any,
      name: deviceInfo?.label || '',
    });
  };

  const handleConnectionTypeSelect = (type: string) => {
    setSelectedConnectionType(type);
    setDeviceConfig({
      ...deviceConfig,
      connection: { type: type as any },
    });
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hardware/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceConfig),
      });
      
      const result = await response.json();
      setTestResults(result);
    } catch (error) {
      setTestResults({
        success: false,
        message: 'Failed to connect to device. Please check your configuration and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hardware/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...deviceConfig,
          isConnected: testResults?.success || false,
        }),
      });
      
      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save device configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Choose Your Device Type
              </h2>
              <p className="text-gray-600 mt-2">
                Select the type of hardware device you want to connect to TotHub
              </p>
            </div>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEVICE_TYPES.map((device) => {
                  const Icon = device.icon;
                  return (
                    <div
                      key={device.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedDeviceType === device.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleDeviceTypeSelect(device.value)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-medium">{device.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{device.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Connection Method
              </h2>
              <p className="text-gray-600 mt-2">
                How will your {DEVICE_TYPES.find(d => d.value === selectedDeviceType)?.label} connect to TotHub?
              </p>
            </div>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONNECTION_TYPES.map((connection) => {
                  const Icon = connection.icon;
                  return (
                    <div
                      key={connection.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedConnectionType === connection.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleConnectionTypeSelect(connection.value)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-medium">{connection.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{connection.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Connection Details</h2>
              <p className="text-gray-600 mt-2">
                Enter the specific connection information for your device
              </p>
            </div>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  value={deviceConfig.name || ''}
                  onChange={(e) => setDeviceConfig({ ...deviceConfig, name: e.target.value })}
                  placeholder="e.g., Main Entrance Door Lock"
                />
              </div>

              {selectedConnectionType === 'network' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input
                      id="ipAddress"
                      value={deviceConfig.connection?.ipAddress || ''}
                      onChange={(e) => setDeviceConfig({
                        ...deviceConfig,
                        connection: { ...deviceConfig.connection!, ipAddress: e.target.value }
                      })}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      value={deviceConfig.connection?.port || ''}
                      onChange={(e) => setDeviceConfig({
                        ...deviceConfig,
                        connection: { ...deviceConfig.connection!, port: e.target.value }
                      })}
                      placeholder="80"
                    />
                  </div>
                </div>
              )}

              {selectedConnectionType === 'serial' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialPort">Serial Port</Label>
                    <Select
                      value={deviceConfig.connection?.port || ''}
                      onValueChange={(value) => setDeviceConfig({
                        ...deviceConfig,
                        connection: { ...deviceConfig.connection!, port: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select serial port" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COM1">COM1</SelectItem>
                        <SelectItem value="COM2">COM2</SelectItem>
                        <SelectItem value="COM3">COM3</SelectItem>
                        <SelectItem value="/dev/ttyUSB0">/dev/ttyUSB0</SelectItem>
                        <SelectItem value="/dev/ttyUSB1">/dev/ttyUSB1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baudRate">Baud Rate</Label>
                    <Select
                      value={deviceConfig.connection?.baudRate?.toString() || ''}
                      onValueChange={(value) => setDeviceConfig({
                        ...deviceConfig,
                        connection: { ...deviceConfig.connection!, baudRate: parseInt(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select baud rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9600">9600</SelectItem>
                        <SelectItem value="19200">19200</SelectItem>
                        <SelectItem value="38400">38400</SelectItem>
                        <SelectItem value="57600">57600</SelectItem>
                        <SelectItem value="115200">115200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedConnectionType === 'bluetooth' && (
                <div className="space-y-2">
                  <Label htmlFor="deviceId">Bluetooth Device ID</Label>
                  <Input
                    id="deviceId"
                    value={deviceConfig.connection?.deviceId || ''}
                    onChange={(e) => setDeviceConfig({
                      ...deviceConfig,
                      connection: { ...deviceConfig.connection!, deviceId: e.target.value }
                    })}
                    placeholder="AA:BB:CC:DD:EE:FF"
                  />
                </div>
              )}

              {selectedConnectionType === 'gpio' && (
                <div className="space-y-2">
                  <Label htmlFor="pinConfig">GPIO Pin Configuration</Label>
                  <Textarea
                    id="pinConfig"
                    value={deviceConfig.connection?.pinConfiguration || ''}
                    onChange={(e) => setDeviceConfig({
                      ...deviceConfig,
                      connection: { ...deviceConfig.connection!, pinConfiguration: e.target.value }
                    })}
                    placeholder="lock_pin=18, status_pin=19, power_pin=20"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Safety Configuration</h2>
              <p className="text-gray-600 mt-2">
                Configure safety and security settings for your device
              </p>
            </div>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Door locks require safety configuration to meet childcare regulations. 
                  Emergency unlock must be available at all times.
                </AlertDescription>
              </Alert>

              {selectedDeviceType === 'door_lock' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Lock Mode</Label>
                    <Select defaultValue="fail_safe">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fail_safe">Fail-Safe (Unlocks on power loss)</SelectItem>
                        <SelectItem value="fail_secure">Fail-Secure (Remains locked on power loss)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Emergency Unlock Method</Label>
                    <Select defaultValue="manual_override">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual_override">Manual Override Switch</SelectItem>
                        <SelectItem value="software_emergency">Software Emergency Button</SelectItem>
                        <SelectItem value="both">Both Methods Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Activity Logging</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="activity-logging" defaultChecked />
                  <Label htmlFor="activity-logging">Enable detailed activity logging for compliance</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Test Connection
              </h2>
              <p className="text-gray-600 mt-2">
                Let's test the connection to make sure everything works properly
              </p>
            </div>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Configuration Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Device: {deviceConfig.name}</div>
                  <div>Type: {DEVICE_TYPES.find(d => d.value === selectedDeviceType)?.label}</div>
                  <div>Connection: {CONNECTION_TYPES.find(c => c.value === selectedConnectionType)?.label}</div>
                  <div>
                    Details: {
                      selectedConnectionType === 'network' ? 
                        `${deviceConfig.connection?.ipAddress}:${deviceConfig.connection?.port}` :
                      selectedConnectionType === 'serial' ?
                        `${deviceConfig.connection?.port} @ ${deviceConfig.connection?.baudRate}` :
                      selectedConnectionType === 'bluetooth' ?
                        deviceConfig.connection?.deviceId :
                        'GPIO Configuration'
                    }
                  </div>
                </div>
              </div>

              <Button 
                onClick={testConnection} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {testResults && (
                <Alert className={testResults.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {testResults.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResults.success ? 'text-green-800' : 'text-red-800'}>
                    {testResults.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Setup Complete
              </h2>
              <p className="text-gray-600 mt-2">
                Your device is ready to use with TotHub
              </p>
            </div>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Device Successfully Connected!</h3>
                <p className="text-gray-600 mb-4">
                  Your {deviceConfig.name} is now integrated with TotHub and ready for use.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Next Steps:</h4>
                  <ul className="text-sm text-left space-y-1">
                    <li>• Test the device operation from the Physical Security page</li>
                    <li>• Configure user access permissions</li>
                    <li>• Set up activity monitoring alerts</li>
                    <li>• Schedule regular connectivity checks</li>
                  </ul>
                </div>
              </div>

              <Button 
                onClick={saveConfiguration} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Saving Configuration...' : 'Complete Setup'}
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Hardware Setup Wizard</h2>
            <Badge variant="outline">Step {step} of {totalSteps}</Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <div className="p-6">
          {renderStepContent()}
        </div>

        <div className="p-6 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step > 1 ? 'Previous' : 'Cancel'}
          </Button>

          <Button
            onClick={() => step < totalSteps ? setStep(step + 1) : saveConfiguration()}
            disabled={
              isLoading ||
              (step === 1 && !selectedDeviceType) ||
              (step === 2 && !selectedConnectionType) ||
              (step === 3 && !deviceConfig.name) ||
              (step === 5 && !testResults?.success)
            }
          >
            {step < totalSteps ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}