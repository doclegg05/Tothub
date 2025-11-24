import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Pause, 
  Play, 
  Trash2, 
  Edit, 
  FileText,
  Users,
  Shield,
  Settings,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SafetyReminder {
  id: string;
  title: string;
  description?: string;
  category: 'fire_safety' | 'equipment' | 'drills' | 'maintenance' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  customInterval?: number;
  nextDueDate: string;
  lastCompletedDate?: string;
  isActive: boolean;
  isPaused: boolean;
  createdBy: string;
  assignedTo?: string;
  alertDaysBefore: number;
}

interface SafetyTemplate {
  title: string;
  description: string;
  category: string;
  frequency: string;
  priority: string;
  alertDaysBefore: number;
}

export function SafetyReminderManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<SafetyReminder | null>(null);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    category: 'fire_safety',
    priority: 'medium',
    frequency: 'monthly',
    customInterval: '',
    alertDaysBefore: '3',
    assignedTo: '',
  });

  const queryClient = useQueryClient();

  // Fetch safety reminders
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['/api/safety/reminders'],
  }) as { data: SafetyReminder[]; isLoading: boolean };

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/safety/reminders/templates'],
  }) as { data: SafetyTemplate[] };

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/safety/reminders/statistics'],
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/safety/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdBy: 'admin', // This would come from auth context
          nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          alertDaysBefore: parseInt(data.alertDaysBefore),
          customInterval: data.customInterval ? parseInt(data.customInterval) : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to create reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety/reminders'] });
      setIsDialogOpen(false);
      setNewReminder({
        title: '',
        description: '',
        category: 'fire_safety',
        priority: 'medium',
        frequency: 'monthly',
        customInterval: '',
        alertDaysBefore: '3',
        assignedTo: '',
      });
      toast({ title: 'Reminder created successfully!' });
    },
  });

  // Toggle pause mutation
  const togglePauseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/safety/reminders/${id}/toggle-pause`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to toggle pause');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety/reminders'] });
      toast({ title: 'Reminder status updated!' });
    },
  });

  // Complete reminder mutation
  const completeReminderMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const response = await fetch(`/api/safety/reminders/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedBy: 'admin', // This would come from auth context
          notes,
        }),
      });
      if (!response.ok) throw new Error('Failed to complete reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety/reminders'] });
      toast({ title: 'Reminder marked as completed!' });
    },
  });

  const filteredReminders = selectedCategory === 'all' 
    ? reminders 
    : reminders.filter(r => r.category === selectedCategory);

  const overdue = reminders.filter(r => 
    r.isActive && !r.isPaused && new Date(r.nextDueDate) < new Date()
  );

  const upcoming = reminders.filter(r => 
    r.isActive && !r.isPaused && 
    new Date(r.nextDueDate) > new Date() &&
    new Date(r.nextDueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fire_safety': return <Shield className="h-4 w-4" />;
      case 'equipment': return <Settings className="h-4 w-4" />;
      case 'drills': return <Users className="h-4 w-4" />;
      case 'maintenance': return <RotateCcw className="h-4 w-4" />;
      case 'inspection': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const useTemplate = (template: SafetyTemplate) => {
    setNewReminder({
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      frequency: template.frequency,
      customInterval: '',
      alertDaysBefore: template.alertDaysBefore.toString(),
      assignedTo: '',
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-orange-600">{upcoming.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paused</p>
                <p className="text-2xl font-bold">{stats?.paused || 0}</p>
              </div>
              <Pause className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts for Overdue Items */}
      {overdue.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{overdue.length} overdue reminder{overdue.length > 1 ? 's' : ''}</strong> require immediate attention:
            <ul className="mt-2 list-disc pl-5">
              {overdue.slice(0, 3).map(reminder => (
                <li key={reminder.id}>{reminder.title}</li>
              ))}
              {overdue.length > 3 && <li>...and {overdue.length - 3} more</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="fire_safety">Fire Safety</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="drills">Emergency Drills</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inspection">Inspections</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Safety Reminder</DialogTitle>
              <DialogDescription>
                Set up automated reminders for safety tasks and compliance checks
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="custom" className="w-full">
              <TabsList>
                <TabsTrigger value="custom">Custom Reminder</TabsTrigger>
                <TabsTrigger value="templates">Use Template</TabsTrigger>
              </TabsList>
              <TabsContent value="custom" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                      placeholder="e.g., Fire Extinguisher Check"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newReminder.category} onValueChange={(value) => setNewReminder({...newReminder, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fire_safety">Fire Safety</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="drills">Emergency Drills</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inspection">Inspections</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newReminder.priority} onValueChange={(value) => setNewReminder({...newReminder, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={newReminder.frequency} onValueChange={(value) => setNewReminder({...newReminder, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newReminder.frequency === 'custom' && (
                    <div>
                      <Label htmlFor="customInterval">Interval (days)</Label>
                      <Input
                        id="customInterval"
                        type="number"
                        value={newReminder.customInterval}
                        onChange={(e) => setNewReminder({...newReminder, customInterval: e.target.value})}
                        placeholder="e.g., 30"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="alertDays">Alert Days Before</Label>
                    <Input
                      id="alertDays"
                      type="number"
                      value={newReminder.alertDaysBefore}
                      onChange={(e) => setNewReminder({...newReminder, alertDaysBefore: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                    placeholder="Detailed instructions for completing this task..."
                  />
                </div>
              </TabsContent>
              <TabsContent value="templates" className="space-y-4">
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {templates.map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => useTemplate(template)}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{template.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{template.category.replace('_', ' ')}</Badge>
                              <Badge variant="outline">{template.frequency}</Badge>
                              <Badge variant="outline">{template.priority}</Badge>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => createReminderMutation.mutate(newReminder)} disabled={createReminderMutation.isPending}>
                Create Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading reminders...</div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reminders found. Create your first safety reminder to get started.
          </div>
        ) : (
          filteredReminders.map((reminder) => (
            <Card key={reminder.id} className={`${reminder.isPaused ? 'opacity-60' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(reminder.category)}
                      <h3 className="font-semibold">{reminder.title}</h3>
                      <Badge className={`${getPriorityColor(reminder.priority)} text-white`}>
                        {reminder.priority}
                      </Badge>
                      {reminder.isPaused && <Badge variant="outline">Paused</Badge>}
                      {new Date(reminder.nextDueDate) < new Date() && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground mb-3">{reminder.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Next due: {new Date(reminder.nextDueDate).toLocaleDateString()}</span>
                      <span>Frequency: {reminder.frequency}</span>
                      {reminder.lastCompletedDate && (
                        <span>Last completed: {new Date(reminder.lastCompletedDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => completeReminderMutation.mutate({ id: reminder.id, notes: '' })}
                      disabled={completeReminderMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePauseMutation.mutate(reminder.id)}
                      disabled={togglePauseMutation.isPending}
                    >
                      {reminder.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}