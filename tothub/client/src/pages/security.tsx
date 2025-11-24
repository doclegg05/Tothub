import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { HardwareSetupWizard } from "@/components/HardwareSetupWizard";
import { 
  Shield, 
  Plus, 
  Settings, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Eye, 
  Fingerprint, 
  Smartphone, 
  Video, 
  Magnet,
  KeyRound,
  CreditCard,
  Clock,
  MapPin,
  Activity,
  TestTube,
  Power,
  Users,
  Globe
} from "lucide-react";

const DEVICE_TYPES = [
  { value: 'keypad', label: 'Keypad/PIN Entry', icon: KeyRound, description: 'PIN-based access control' },
  { value: 'rfid', label: 'RFID/Key Card', icon: CreditCard, description: 'Card/fob-based access' },
  { value: 'biometric', label: 'Biometric Scanner', icon: Fingerprint, description: 'Fingerprint/facial recognition' },
  { value: 'mobile', label: 'Mobile/NFC', icon: Smartphone, description: 'Smartphone-based access' },
  { value: 'intercom', label: 'Video Intercom', icon: Video, description: 'Video doorbell with remote unlock' },
  { value: 'magnetic', label: 'Magnetic Lock', icon: Magnet, description: 'Electromagnetic lock control' },
];

const CONNECTION_TYPES = [
  { value: 'serial', label: 'Serial Port (COM/USB)' },
  { value: 'network', label: 'Network (TCP/IP)' },
  { value: 'bluetooth', label: 'Bluetooth' },
  { value: 'gpio', label: 'GPIO/Relay' },
];

const COMMON_LOCATIONS = [
  'Main Entrance',
  'Staff Entrance', 
  'Emergency Exit',
  'Infant Room A',
  'Infant Room B',
  'Toddler Room A',
  'Toddler Room B',
  'Preschool Room A',
  'Preschool Room B',
  'School Age Room',
  'Kitchen',
  'Office',
  'Playground Gate',
];

export default function Security() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    connectionType: '',
    connectionConfig: '{}',
    unlockDuration: 5,
    failSafeMode: 'secure',
  });

  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["/api/security/devices"],
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/security/logs"],
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["/api/security/zones"],
  });

  const createDeviceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/security/devices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/devices"] });
      setDeviceModalOpen(false);
      resetForm();
      toast({
        title: "Device Added",
        description: "Security device has been configured successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add security device.",
        variant: "destructive",
      });
    },
  });

  const testDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => apiRequest("POST", `/api/security/devices/${deviceId}/test`, {}),
    onSuccess: (data: any, deviceId) => {
      toast({
        title: "Test Complete",
        description: data.success ? "Device connection successful" : "Device test failed",
        variant: data.success ? "default" : "destructive",
      });
    },
  });

  const unlockDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => apiRequest("POST", `/api/security/devices/${deviceId}/unlock`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/logs"] });
      toast({
        title: "Device Unlocked",
        description: "Door has been unlocked remotely.",
      });
    },
  });

  const lockDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => apiRequest("POST", `/api/security/devices/${deviceId}/lock`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/logs"] });
      toast({
        title: "Device Locked",
        description: "Door has been locked.",
      });
    },
  });

  const emergencyUnlockMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/security/emergency-unlock", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/logs"] });
      toast({
        title: "Emergency Unlock Activated",
        description: "All security devices have been unlocked.",
        variant: "destructive",
      });
    },
  });

  const testSecuritySystemMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/security/test/full-simulation", {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/logs"] });
      toast({
        title: "Security Simulation Complete",
        description: `Created ${data.devicesCreated || 0} devices, ran ${data.summary?.testsExecuted || 0} tests`,
      });
    },
    onError: () => {
      toast({
        title: "Simulation Failed",
        description: "Failed to run security system simulation.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      location: '',
      connectionType: '',
      connectionConfig: '{}',
      unlockDuration: 5,
      failSafeMode: 'secure',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeviceMutation.mutate(formData);
  };

  const getDeviceIcon = (type: string) => {
    const deviceType = DEVICE_TYPES.find(dt => dt.value === type);
    return deviceType ? deviceType.icon : Shield;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800"><Wifi className="w-3 h-3 mr-1" />Online</Badge>;
      case 'offline':
        return <Badge variant="secondary"><WifiOff className="w-3 h-3 mr-1" />Offline</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getActionIcon = (action: string, success: boolean) => {
    const iconClass = success ? "text-green-600" : "text-red-600";
    switch (action) {
      case 'unlock':
        return <Unlock className={`w-4 h-4 ${iconClass}`} />;
      case 'lock':
        return <Lock className={`w-4 h-4 ${iconClass}`} />;
      case 'attempt_failed':
        return <AlertTriangle className={`w-4 h-4 ${iconClass}`} />;
      default:
        return <Activity className={`w-4 h-4 ${iconClass}`} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Physical Security" 
        subtitle="Door access control and security system management"
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Devices</p>
                  <p className="text-2xl font-bold">{(devices as any[]).length}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(devices as any[]).filter(d => d.status === 'online').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offline</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {(devices as any[]).filter(d => d.status === 'offline').length}
                  </p>
                </div>
                <WifiOff className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Zones</p>
                  <p className="text-2xl font-bold">{(zones as any[]).length}</p>
                </div>
                <MapPin className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Controls */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Emergency Unlock All Doors</p>
                <p className="text-sm text-gray-600">
                  Immediately unlock all security devices in case of emergency
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => emergencyUnlockMutation.mutate()}
                disabled={emergencyUnlockMutation.isPending}
              >
                <Power className="w-4 h-4 mr-2" />
                Emergency Unlock
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="devices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="devices">Security Devices</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="zones">Security Zones</TabsTrigger>
            <TabsTrigger value="settings">Integration Settings</TabsTrigger>
          </TabsList>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Security Devices</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setWizardOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Hardware Setup Wizard
                </Button>
                <Dialog open={deviceModalOpen} onOpenChange={setDeviceModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Manual Setup
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Security Device</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Device Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Main Entrance Keypad"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Device Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select device type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEVICE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center">
                                  <type.icon className="w-4 h-4 mr-2" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_LOCATIONS.map((location) => (
                              <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="connectionType">Connection Type</Label>
                        <Select value={formData.connectionType} onValueChange={(value) => setFormData({...formData, connectionType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select connection" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONNECTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="unlockDuration">Unlock Duration (seconds)</Label>
                        <Input
                          id="unlockDuration"
                          type="number"
                          min="1"
                          max="60"
                          value={formData.unlockDuration}
                          onChange={(e) => setFormData({...formData, unlockDuration: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="failSafeMode">Fail-Safe Mode</Label>
                        <Select value={formData.failSafeMode} onValueChange={(value) => setFormData({...formData, failSafeMode: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="secure">Fail Secure (Lock on power loss)</SelectItem>
                            <SelectItem value="unlock">Fail Safe (Unlock on power loss)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="connectionConfig">Connection Configuration (JSON)</Label>
                      <Textarea
                        id="connectionConfig"
                        value={formData.connectionConfig}
                        onChange={(e) => setFormData({...formData, connectionConfig: e.target.value})}
                        placeholder='{"port": "COM3", "baudRate": 9600, "timeout": 5}'
                        rows={3}
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Device-specific settings like ports, IP addresses, API keys, etc.
                      </p>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setDeviceModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createDeviceMutation.isPending}>
                        Add Device
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {devicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(devices as any[]).map((device: any) => {
                  const DeviceIcon = getDeviceIcon(device.type);
                  return (
                    <Card key={device.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <DeviceIcon className="w-5 h-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium">{device.name}</h4>
                              <p className="text-sm text-gray-600">{device.location}</p>
                            </div>
                          </div>
                          {getStatusBadge(device.status)}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Type:</span>
                            <span className="capitalize">{device.type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Connection:</span>
                            <span className="capitalize">{device.connectionType}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Unlock Duration:</span>
                            <span>{device.unlockDuration}s</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testDeviceMutation.mutate(device.id)}
                            disabled={testDeviceMutation.isPending}
                          >
                            <TestTube className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unlockDeviceMutation.mutate(device.id)}
                            disabled={unlockDeviceMutation.isPending}
                          >
                            <Unlock className="w-3 h-3 mr-1" />
                            Unlock
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => lockDeviceMutation.mutate(device.id)}
                            disabled={lockDeviceMutation.isPending}
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            Lock
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            </div>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-3">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(logs as any[]).map((logEntry: any) => (
                      <div key={logEntry.log.id} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-shrink-0">
                          {getActionIcon(logEntry.log.action, logEntry.log.success)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{logEntry.deviceName}</span>
                            <span className="text-sm text-gray-600">({logEntry.deviceLocation})</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {logEntry.log.action.replace('_', ' ')} - {logEntry.log.details || 'No details'}
                            {logEntry.log.method && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                {logEntry.log.method}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(logEntry.log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zones Tab */}
          <TabsContent value="zones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Security Zones</p>
                  <p className="text-sm">Group devices by location and apply unified access rules</p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Security Zone
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-800 mb-2">🧪 Test Physical Security System</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Run comprehensive simulation to test all security device types and functionality
                </p>
                <Button 
                  onClick={() => testSecuritySystemMutation.mutate()}
                  disabled={testSecuritySystemMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testSecuritySystemMutation.isPending ? 'Running...' : 'Run Security Simulation'}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Attendance Integration</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-unlock on Check-in</p>
                      <p className="text-sm text-gray-600">
                        Automatically unlock doors when children check in
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-unlock on Check-out</p>
                      <p className="text-sm text-gray-600">
                        Automatically unlock doors when children check out
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Settings</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Alerts</p>
                      <p className="text-sm text-gray-600">
                        Send email notifications for security events
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Failed Access Alerts</p>
                      <p className="text-sm text-gray-600">
                        Alert on unauthorized access attempts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Capacity Controls</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lock on Over-Capacity</p>
                      <p className="text-sm text-gray-600">
                        Automatically lock doors when room capacity is exceeded
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Hardware Setup Wizard */}
        {wizardOpen && (
          <HardwareSetupWizard onClose={() => setWizardOpen(false)} />
        )}
      </div>
    </div>
  );
}