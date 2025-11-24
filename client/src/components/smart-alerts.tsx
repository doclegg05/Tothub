import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Clock, Users, Settings as SettingsIcon, Bell, BellOff, Volume2, VolumeX } from "lucide-react";

interface AlertSettings {
  ratioViolations: {
    enabled: boolean;
    frequency: number; // minutes
    priority: "low" | "medium" | "high";
    soundEnabled: boolean;
  };
  staffingIssues: {
    enabled: boolean;
    frequency: number;
    priority: "low" | "medium" | "high";
    soundEnabled: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  batchNotifications: boolean;
  maxAlertsPerHour: number;
}

export function SmartAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [alertCounts, setAlertCounts] = useState({ hour: 0, lastReset: Date.now() });

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["/api/alerts/unread"],
    refetchInterval: 30000, // Reduced from every 5 seconds to reduce overwhelm
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["/api/settings"],
  });

  const getSetting = (key: string, defaultValue: any) => {
    const setting = (settings as any[]).find((s: any) => s.key === key);
    return setting ? JSON.parse(setting.value) : defaultValue;
  };

  const [alertSettings, setAlertSettings] = useState<AlertSettings>(() => 
    getSetting("alert_settings", {
      ratioViolations: {
        enabled: true,
        frequency: 30, // 30 minutes instead of constant
        priority: "high",
        soundEnabled: false, // Disabled by default to reduce intrusion
      },
      staffingIssues: {
        enabled: true,
        frequency: 15,
        priority: "medium",
        soundEnabled: false,
      },
      quietHours: {
        enabled: true,
        start: "12:00", // Lunch nap time
        end: "14:00",
      },
      batchNotifications: true,
      maxAlertsPerHour: 6, // Limit to prevent overwhelming
    })
  );

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { key: string; value: string }) => 
      apiRequest("POST", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Alert preferences saved successfully.",
      });
    },
  });

  const dismissAlertMutation = useMutation({
    mutationFn: (alertId: string) => 
      apiRequest("PUT", `/api/alerts/${alertId}`, { isRead: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread"] });
    },
  });

  // Reset alert count every hour
  useEffect(() => {
    const now = Date.now();
    if (now - alertCounts.lastReset > 3600000) { // 1 hour
      setAlertCounts({ hour: 0, lastReset: now });
    }
  }, [alertCounts]);

  // Check if we're in quiet hours
  const isQuietTime = () => {
    if (!alertSettings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(alertSettings.quietHours.start.replace(":", ""));
    const endTime = parseInt(alertSettings.quietHours.end.replace(":", ""));
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  // Smart alert filtering to prevent overwhelm
  const getFilteredAlerts = () => {
    if (isQuietTime()) {
      return (alerts as any[]).filter(alert => alert.severity === "high");
    }
    
    if (alertCounts.hour >= alertSettings.maxAlertsPerHour) {
      return (alerts as any[]).filter(alert => alert.severity === "high");
    }
    
    return alerts as any[];
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      key: "alert_settings",
      value: JSON.stringify(alertSettings),
    });
    setShowSettings(false);
  };

  const getPriorityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    if (severity === "high") return <AlertTriangle className="w-4 h-4" />;
    if (type === "staffing") return <Users className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const filteredAlerts = getFilteredAlerts();
  const isQuiet = isQuietTime();

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center text-lg">
          {isQuiet ? <BellOff className="w-5 h-5 mr-2 text-gray-400" /> : <Bell className="w-5 h-5 mr-2" />}
          Smart Alerts
          {isQuiet && <Badge variant="secondary" className="ml-2 text-xs">Quiet Hours</Badge>}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowSettings(!showSettings)}
        >
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {showSettings && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4 mb-4">
            <h4 className="font-medium text-sm">Alert Preferences</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="flex items-center space-x-2">
                  <Switch 
                    checked={alertSettings.ratioViolations.enabled}
                    onCheckedChange={(checked) => 
                      setAlertSettings({
                        ...alertSettings,
                        ratioViolations: { ...alertSettings.ratioViolations, enabled: checked }
                      })
                    }
                  />
                  <span>Ratio Alerts</span>
                </Label>
                <Select 
                  value={alertSettings.ratioViolations.frequency.toString()}
                  onValueChange={(value) => 
                    setAlertSettings({
                      ...alertSettings,
                      ratioViolations: { ...alertSettings.ratioViolations, frequency: parseInt(value) }
                    })
                  }
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Every 15 min</SelectItem>
                    <SelectItem value="30">Every 30 min</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center space-x-2">
                  <Switch 
                    checked={alertSettings.staffingIssues.enabled}
                    onCheckedChange={(checked) => 
                      setAlertSettings({
                        ...alertSettings,
                        staffingIssues: { ...alertSettings.staffingIssues, enabled: checked }
                      })
                    }
                  />
                  <span>Staff Alerts</span>
                </Label>
                <Select 
                  value={alertSettings.staffingIssues.frequency.toString()}
                  onValueChange={(value) => 
                    setAlertSettings({
                      ...alertSettings,
                      staffingIssues: { ...alertSettings.staffingIssues, frequency: parseInt(value) }
                    })
                  }
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Every 15 min</SelectItem>
                    <SelectItem value="30">Every 30 min</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <Label className="flex items-center space-x-2">
                <Switch 
                  checked={alertSettings.quietHours.enabled}
                  onCheckedChange={(checked) => 
                    setAlertSettings({
                      ...alertSettings,
                      quietHours: { ...alertSettings.quietHours, enabled: checked }
                    })
                  }
                />
                <span>Quiet Hours</span>
              </Label>
              <span className="text-xs text-gray-600">
                {alertSettings.quietHours.start} - {alertSettings.quietHours.end}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Label className="flex items-center space-x-2">
                <Switch 
                  checked={alertSettings.batchNotifications}
                  onCheckedChange={(checked) => 
                    setAlertSettings({
                      ...alertSettings,
                      batchNotifications: checked
                    })
                  }
                />
                <span>Batch Similar Alerts</span>
              </Label>
              <span className="text-xs text-gray-600">
                Max {alertSettings.maxAlertsPerHour}/hour
              </span>
            </div>

            <Button onClick={handleSaveSettings} size="sm" className="w-full">
              Save Preferences
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">All clear! No active alerts.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map((alert: any) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border transition-all hover:shadow-sm ${getPriorityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.type, alert.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      {alert.room && (
                        <p className="text-xs opacity-75 mt-1">Room: {alert.room}</p>
                      )}
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlertMutation.mutate(alert.id)}
                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {(alerts as any[]).length > filteredAlerts.length && (
              <div className="text-center py-2">
                <Badge variant="outline" className="text-xs">
                  {(alerts as any[]).length - filteredAlerts.length} alerts filtered
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}