import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Info,
  CheckCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Clock,
  Zap
} from "lucide-react";

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  channels: string[];
  autoRemediate: boolean;
  remediationAction?: string;
  cooldownMinutes: number;
  enabled: boolean;
}

export default function AlertRules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState<Partial<AlertRule>>({
    name: '',
    condition: '',
    severity: 'info',
    channels: ['in-app'],
    autoRemediate: false,
    remediationAction: '',
    cooldownMinutes: 15,
    enabled: true,
  });

  // Fetch alert rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/alerts/rules');
      return response.json();
    },
  });

  // Fetch alert history
  const { data: history } = useQuery({
    queryKey: ['alert-history'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/alerts/history?hours=24');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Create/Update rule mutation
  const saveRuleMutation = useMutation({
    mutationFn: async (data: Partial<AlertRule>) => {
      const endpoint = editingRule 
        ? `/api/alerts/rules/${editingRule.id}`
        : '/api/alerts/rules';
      const method = editingRule ? 'PATCH' : 'POST';
      
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingRule ? "Alert rule updated" : "Alert rule created",
      });
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save alert rule",
        variant: "destructive",
      });
    },
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/alerts/rules/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Alert rule deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete alert rule",
        variant: "destructive",
      });
    },
  });

  // Toggle rule enabled/disabled
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiRequest('PATCH', `/api/alerts/rules/${id}`, { enabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  // Test alert mutation
  const testAlertMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/alerts/manual', {
        message,
        severity: 'info',
        channels: ['in-app'],
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Alert Sent",
        description: "Check your alerts panel",
      });
    },
  });

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      condition: '',
      severity: 'info',
      channels: ['in-app'],
      autoRemediate: false,
      remediationAction: '',
      cooldownMinutes: 15,
      enabled: true,
    });
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormData(rule);
    setDialogOpen(true);
  };

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels?.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...(prev.channels || []), channel],
    }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-3 h-3" />;
      case 'sms':
        return <Smartphone className="w-3 h-3" />;
      case 'in-app':
        return <Bell className="w-3 h-3" />;
      case 'webhook':
        return <Webhook className="w-3 h-3" />;
      default:
        return <MessageSquare className="w-3 h-3" />;
    }
  };

  const predefinedConditions = [
    { value: 'memory > 85', label: 'Memory Usage > 85%' },
    { value: 'ratio-violation', label: 'Staff-Child Ratio Violation' },
    { value: 'staff-coverage < 80', label: 'Staff Coverage < 80%' },
    { value: 'child-not-picked-up', label: 'Child Not Picked Up' },
    { value: 'db-response-time > 1000', label: 'Database Slow (>1s)' },
  ];

  const remediationActions = [
    { value: 'restart-service', label: 'Restart Service' },
    { value: 'clear-cache', label: 'Clear Cache' },
    { value: 'scale-up', label: 'Scale Up Resources' },
  ];

  return (
    <>
      <Header title="Alert Rules" subtitle="Configure and manage system alerts" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Test and manage the alert system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button 
                variant="outline"
                onClick={() => testAlertMutation.mutate('This is a test alert from the Alert Rules page')}
                disabled={testAlertMutation.isPending}
              >
                <Bell className="w-4 h-4 mr-2" />
                Send Test Alert
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Alert Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}</DialogTitle>
                    <DialogDescription>Configure when and how alerts are triggered</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingRule) {
                      saveRuleMutation.mutate({ ...formData, id: editingRule.id });
                    } else {
                      saveRuleMutation.mutate({
                        ...formData,
                        id: `rule_${Date.now()}`,
                      });
                    }
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Rule Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., High Memory Alert"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {predefinedConditions.map(cond => (
                            <SelectItem key={cond.value} value={cond.value}>
                              {cond.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="severity">Severity</Label>
                      <Select
                        value={formData.severity}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Notification Channels</Label>
                      <div className="space-y-2 mt-2">
                        {['in-app', 'email', 'sms', 'webhook'].map(channel => (
                          <div key={channel} className="flex items-center space-x-2">
                            <Checkbox
                              id={channel}
                              checked={formData.channels?.includes(channel)}
                              onCheckedChange={() => handleChannelToggle(channel)}
                            />
                            <Label htmlFor={channel} className="flex items-center cursor-pointer">
                              {getChannelIcon(channel)}
                              <span className="ml-2 capitalize">{channel.replace('-', ' ')}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cooldown">Cooldown Period (minutes)</Label>
                      <Input
                        id="cooldown"
                        type="number"
                        value={formData.cooldownMinutes}
                        onChange={(e) => setFormData(prev => ({ ...prev, cooldownMinutes: parseInt(e.target.value) }))}
                        min={1}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoRemediate"
                        checked={formData.autoRemediate}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRemediate: checked }))}
                      />
                      <Label htmlFor="autoRemediate">Enable Auto-Remediation</Label>
                    </div>

                    {formData.autoRemediate && (
                      <div>
                        <Label htmlFor="remediationAction">Remediation Action</Label>
                        <Select
                          value={formData.remediationAction}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, remediationAction: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                          <SelectContent>
                            {remediationActions.map(action => (
                              <SelectItem key={action.value} value={action.value}>
                                {action.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saveRuleMutation.isPending}>
                        {editingRule ? 'Update' : 'Create'} Rule
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Alert Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alert Rules</CardTitle>
            <CardDescription>Manage your configured alert rules</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading rules...</div>
            ) : rules?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No alert rules configured</div>
            ) : (
              <div className="space-y-4">
                {rules?.map((rule: AlertRule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(rule.severity)}
                          <h3 className="font-medium">{rule.name}</h3>
                          {!rule.enabled && (
                            <Badge variant="outline" className="text-gray-500">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Condition: <code className="bg-gray-100 px-1 py-0.5 rounded">{rule.condition}</code>
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{rule.cooldownMinutes}m cooldown</span>
                          </div>
                          {rule.autoRemediate && (
                            <div className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-yellow-600" />
                              <span>Auto-remediate: {rule.remediationAction}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {rule.channels.map(channel => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {getChannelIcon(channel)}
                              <span className="ml-1">{channel}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => toggleRuleMutation.mutate({ id: rule.id, enabled: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this rule?')) {
                              deleteRuleMutation.mutate(rule.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alert History</CardTitle>
            <CardDescription>Alerts sent in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            {history?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No recent alerts</div>
            ) : (
              <div className="space-y-2">
                {history?.map((notification: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getChannelIcon(notification.channel)}
                      <div>
                        <p className="text-sm font-medium">Alert ID: {notification.alertId}</p>
                        <p className="text-xs text-muted-foreground">
                          Sent: {new Date(notification.sentAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={notification.status === 'sent' ? 'default' : 'destructive'}>
                      {notification.status === 'sent' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sent
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Failed
                        </>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}