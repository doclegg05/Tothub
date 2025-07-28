import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Mail, Shield, Users, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { WV_RATIO_REQUIREMENTS } from "@/lib/ratioCalculations";
import { AutoRestartStatus } from "@/components/auto-restart-status";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emailTestData, setEmailTestData] = useState({
    to: "",
    subject: "Test Email from DaycarePro",
    message: "This is a test email to verify your email configuration is working correctly.",
  });

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const { data: availableStates = [] } = useQuery({
    queryKey: ["/api/compliance/available-states"],
  });

  const { data: currentStateData, isLoading: isStateLoading } = useQuery({
    queryKey: ["/api/compliance/current-state"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      apiRequest("POST", "/api/settings", { key, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Setting updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update setting.",
        variant: "destructive",
      });
    },
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/send-test-email", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test email sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your email configuration.",
        variant: "destructive",
      });
    },
  });

  const updateStateMutation = useMutation({
    mutationFn: ({ state, auditNote }: { state: string; auditNote?: string }) =>
      apiRequest("POST", "/api/compliance/update-state", { state, auditNote }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/current-state"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "State Updated",
        description: `${data.message} - ratios will automatically apply to calculations.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update state compliance.",
        variant: "destructive",
      });
    },
  });

  const getSetting = (key: string, defaultValue: string = "") => {
    const setting = (settings as any[]).find((s: any) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const updateSetting = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  const handleTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTestData.to) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    sendTestEmailMutation.mutate(emailTestData);
  };

  return (
    <>
      <Header title="Settings" subtitle="Configure system preferences and alerts" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* State Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              State Compliance Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="selectedState">Select Your State</Label>
                <Select
                  value={currentStateData?.state || "West Virginia"}
                  onValueChange={(value) => {
                    updateStateMutation.mutate({
                      state: value,
                      auditNote: `State updated via settings page`
                    });
                  }}
                  disabled={isStateLoading || updateStateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {(availableStates as any[]).map((stateData: any) => (
                      <SelectItem key={stateData.name} value={stateData.name} disabled={!stateData.hasData}>
                        <div className="flex items-center justify-between w-full">
                          <span>{stateData.name}</span>
                          {!stateData.hasData && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              No Data
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Changes are logged for audit compliance and automatically update all ratio calculations
                </p>
              </div>

              <div className="space-y-2">
                <Label>Current Compliance State</Label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2">
                        {currentStateData?.state || "West Virginia"}
                      </Badge>
                      <span className="text-sm text-blue-700">
                        {currentStateData?.isInitialized ? "Active" : "Not Initialized"}
                      </span>
                    </div>
                    {updateStateMutation.isPending && (
                      <div className="text-xs text-orange-600">Updating...</div>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Federal compliance (COPPA, HIPAA, FERPA) always enforced
                  </p>
                  {currentStateData?.compliance?.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Note: {currentStateData.compliance.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* State Ratio Preview */}
            {currentStateData?.state && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Current State Ratios - {currentStateData.state}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="font-medium text-gray-700">Infants (0-12 mo)</div>
                    <div className="text-blue-600">Loading...</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Toddlers (13-24 mo)</div>
                    <div className="text-blue-600">Loading...</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">2-3 years</div>
                    <div className="text-blue-600">Loading...</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">3-4 years</div>
                    <div className="text-blue-600">Loading...</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">4-5 years</div>
                    <div className="text-blue-600">Loading...</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">School-age (6+)</div>
                    <div className="text-blue-600">Loading...</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Alert Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="alertFrequency">Staffing Alert Frequency</Label>
                <Select
                  value={getSetting("alert_frequency", "30")}
                  onValueChange={(value) => updateSetting("alert_frequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                    <SelectItem value="120">Every 2 hours</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  How often to check and send staffing ratio alerts
                </p>
              </div>

              <div>
                <Label htmlFor="alertRecipients">Alert Recipients</Label>
                <Input
                  id="alertRecipients"
                  value={getSetting("alert_recipients", "")}
                  onChange={(e) => updateSetting("alert_recipients", e.target.value)}
                  placeholder="admin@daycare.com, director@daycare.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Comma-separated email addresses for receiving alerts
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Alert Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Staffing Ratio Alerts</Label>
                    <p className="text-sm text-gray-500">Alert when rooms exceed required ratios</p>
                  </div>
                  <Switch
                    checked={getSetting("staffing_alerts_enabled", "true") === "true"}
                    onCheckedChange={(checked) => updateSetting("staffing_alerts_enabled", checked.toString())}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Late Staff Alerts</Label>
                    <p className="text-sm text-gray-500">Alert when staff members are late</p>
                  </div>
                  <Switch
                    checked={getSetting("late_staff_alerts_enabled", "true") === "true"}
                    onCheckedChange={(checked) => updateSetting("late_staff_alerts_enabled", checked.toString())}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Summary Reports</Label>
                    <p className="text-sm text-gray-500">Send daily attendance and compliance summaries</p>
                  </div>
                  <Switch
                    checked={getSetting("daily_summary_enabled", "true") === "true"}
                    onCheckedChange={(checked) => updateSetting("daily_summary_enabled", checked.toString())}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ratio Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              West Virginia Ratio Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                These ratios are based on West Virginia state regulations and cannot be modified.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WV_RATIO_REQUIREMENTS.map((requirement) => (
                  <div key={requirement.ageGroup} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="font-medium text-gray-800">{requirement.displayName}</h4>
                    <p className="text-2xl font-bold text-primary">1:{requirement.maxChildrenPerStaff}</p>
                    <Badge variant="secondary" className="mt-2">WV Required</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="emailHost">SMTP Host</Label>
                <Input
                  id="emailHost"
                  value={getSetting("email_host", "smtp.gmail.com")}
                  onChange={(e) => updateSetting("email_host", e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <Label htmlFor="emailPort">SMTP Port</Label>
                <Input
                  id="emailPort"
                  value={getSetting("email_port", "587")}
                  onChange={(e) => updateSetting("email_port", e.target.value)}
                  placeholder="587"
                />
              </div>

              <div>
                <Label htmlFor="emailUser">Email Username</Label>
                <Input
                  id="emailUser"
                  value={getSetting("email_user", "")}
                  onChange={(e) => updateSetting("email_user", e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <Label htmlFor="emailFrom">From Address</Label>
                <Input
                  id="emailFrom"
                  value={getSetting("email_from", "")}
                  onChange={(e) => updateSetting("email_from", e.target.value)}
                  placeholder="Little Steps Academy <noreply@daycare.com>"
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Test Email Configuration</h3>
              <form onSubmit={handleTestEmail} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testEmailTo">Send to</Label>
                    <Input
                      id="testEmailTo"
                      type="email"
                      value={emailTestData.to}
                      onChange={(e) => setEmailTestData(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="test@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="testEmailSubject">Subject</Label>
                    <Input
                      id="testEmailSubject"
                      value={emailTestData.subject}
                      onChange={(e) => setEmailTestData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="testEmailMessage">Message</Label>
                  <Input
                    id="testEmailMessage"
                    value={emailTestData.message}
                    onChange={(e) => setEmailTestData(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={sendTestEmailMutation.isPending}
                  className="flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {sendTestEmailMutation.isPending ? "Sending..." : "Send Test Email"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Restart System */}
        <AutoRestartStatus />

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Facility Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Facility Name:</span>
                    <span className="font-medium">Little Steps Academy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">License State:</span>
                    <span className="font-medium">West Virginia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compliance:</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Integration Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email System:</span>
                    <Badge className="bg-green-600">Connected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">QuickBooks:</span>
                    <Badge variant="secondary">Not Connected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Food Service:</span>
                    <Badge variant="secondary">Not Connected</Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Data & Backup</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <Badge className="bg-green-600">Connected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Backup:</span>
                    <span className="font-medium">Today 3:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Storage Used:</span>
                    <span className="font-medium">2.3 GB</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Need Help?</h4>
                <p className="text-sm text-gray-600">
                  Contact support for assistance with setup or configuration
                </p>
              </div>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="openTime">Opening Time</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={getSetting("opening_time", "06:30")}
                  onChange={(e) => updateSetting("opening_time", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={getSetting("closing_time", "18:00")}
                  onChange={(e) => updateSetting("closing_time", e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              These hours are used for attendance validation and reporting
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
