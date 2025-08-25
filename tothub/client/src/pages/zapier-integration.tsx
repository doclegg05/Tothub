import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Zap, 
  Plus, 
  Edit3, 
  Trash2, 
  TestTube, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Settings,
  Webhook
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ZapierWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
}

interface ZapierEvent {
  name: string;
  description: string;
  data: Record<string, string>;
}

export default function ZapierIntegration() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedWebhook, setSelectedWebhook] = useState<ZapierWebhook | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    active: true
  });

  // Fetch webhooks
  const { data: webhooksData } = useQuery({
    queryKey: ["/api/zapier/webhooks"],
    queryFn: async () => {
      const response = await fetch("/api/zapier/webhooks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch webhooks");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch available events
  const { data: eventsData } = useQuery({
    queryKey: ["/api/zapier/events"],
    queryFn: async () => {
      const response = await fetch("/api/zapier/events", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (webhookData: typeof newWebhook) => {
      return await apiRequest("POST", "/api/zapier/webhooks", webhookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/webhooks"] });
      setIsCreateModalOpen(false);
      setNewWebhook({ name: '', url: '', events: [], active: true });
      toast({
        title: "Success",
        description: "Webhook created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create webhook",
        variant: "destructive",
      });
    },
  });

  // Update webhook mutation
  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ZapierWebhook> }) => {
      return await apiRequest("PUT", `/api/zapier/webhooks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update webhook",
        variant: "destructive",
      });
    },
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/zapier/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete webhook",
        variant: "destructive",
      });
    },
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/zapier/webhooks/${id}/test`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test webhook sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test webhook",
        variant: "destructive",
      });
    },
  });

  const webhooks: ZapierWebhook[] = webhooksData?.webhooks || [];
  const events: ZapierEvent[] = eventsData?.events || [];

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createWebhookMutation.mutate(newWebhook);
  };

  const handleToggleWebhook = (webhook: ZapierWebhook) => {
    updateWebhookMutation.mutate({
      id: webhook.id,
      data: { active: !webhook.active }
    });
  };

  const handleEventToggle = (eventName: string, checked: boolean) => {
    setNewWebhook(prev => ({
      ...prev,
      events: checked 
        ? [...prev.events, eventName]
        : prev.events.filter(e => e !== eventName)
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  if (!isAuthenticated) {
    return <div>Please log in to access Zapier integration.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold">Zapier Integration</h1>
            <p className="text-muted-foreground">Automate your daycare workflows with Zapier</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="events">Available Events</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="grid gap-4">
            {webhooks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No webhooks configured yet</p>
                    <p className="text-sm">Create your first webhook to start automating processes</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <Badge variant={webhook.active ? "default" : "secondary"}>
                          {webhook.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testWebhookMutation.mutate(webhook.id)}
                          disabled={!webhook.active}
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Switch
                          checked={webhook.active}
                          onCheckedChange={() => handleToggleWebhook(webhook)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium">URL:</Label>
                        <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                          {webhook.url}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(webhook.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Events:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-sm font-medium">Data Structure:</Label>
                    <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Setting up Zapier Integration</span>
              </CardTitle>
              <CardDescription>
                Follow these steps to connect TotHub with Zapier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Create a Zap in Zapier</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to Zapier.com and create a new Zap using "Webhooks by Zapier" as the trigger
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Get Webhook URL</h4>
                    <p className="text-sm text-muted-foreground">
                      Copy the webhook URL provided by Zapier in the trigger setup
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Create Webhook in TotHub</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the "Create Webhook" button above to register the webhook URL and select events
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Test the Connection</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the "Test" button to send a test event and verify Zapier receives it
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium">Configure Actions</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up actions in Zapier like sending emails, creating tasks, or updating spreadsheets
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Popular Automation Ideas</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                      <li>• Send email notifications when children check in/out</li>
                      <li>• Create calendar events for staff schedules</li>
                      <li>• Update Google Sheets with daily attendance</li>
                      <li>• Send SMS alerts for ratio violations</li>
                      <li>• Create invoices in QuickBooks for payments</li>
                      <li>• Post daily reports to Slack channels</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Webhook Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Webhook</DialogTitle>
            <DialogDescription>
              Set up a new webhook to send events to Zapier
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Webhook Name</Label>
              <Input
                id="name"
                placeholder="e.g., Parent Notifications"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="url">Zapier Webhook URL</Label>
              <Input
                id="url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={newWebhook.url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Events to Send</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {events.map((event) => (
                  <div key={event.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={event.name}
                      checked={newWebhook.events.includes(event.name)}
                      onCheckedChange={(checked) => handleEventToggle(event.name, checked as boolean)}
                    />
                    <label htmlFor={event.name} className="text-sm">
                      {event.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWebhook}
              disabled={createWebhookMutation.isPending}
            >
              {createWebhookMutation.isPending ? "Creating..." : "Create Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}