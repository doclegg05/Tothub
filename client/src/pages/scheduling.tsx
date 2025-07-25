import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Users, Plus, Edit, Trash2, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StaffSchedule {
  id: string;
  staffId: string;
  room: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  isPresent: boolean;
  scheduleType: string;
  isRecurring: boolean;
  recurringPattern?: string;
  status: string;
  staff?: {
    firstName: string;
    lastName: string;
    position: string;
  };
}

interface ChildSchedule {
  id: string;
  childId: string;
  room: string;
  date: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  actualArrival?: string;
  actualDeparture?: string;
  isPresent: boolean;
  scheduleType: string;
  isRecurring: boolean;
  recurringDays: string[];
  mealPlan: string[];
  napTime?: string;
  parentApproved: boolean;
  status: string;
  child?: {
    firstName: string;
    lastName: string;
    ageGroup: string;
  };
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  ageGroup: string;
  room: string;
}

const ROOMS = [
  "Infant Room A", "Infant Room B", "Toddler Room A", "Toddler Room B", 
  "Preschool Room A", "Preschool Room B", "School Age Room", "Multipurpose Room"
];

const DAYS_OF_WEEK = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
];

const MEAL_OPTIONS = ["breakfast", "lunch", "afternoon_snack", "dinner"];

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export default function Scheduling() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week

  // Fetch data
  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const { data: staffSchedules = [] } = useQuery<StaffSchedule[]>({
    queryKey: ["/api/staff-schedules", selectedDate],
  });

  const { data: childSchedules = [] } = useQuery<ChildSchedule[]>({
    queryKey: ["/api/child-schedules", selectedDate],
  });

  // Form states
  const [staffScheduleForm, setStaffScheduleForm] = useState({
    staffId: "",
    room: "",
    date: selectedDate,
    scheduledStart: "",
    scheduledEnd: "",
    scheduleType: "regular",
    isRecurring: false,
    recurringPattern: "weekly",
    recurringUntil: "",
    notes: "",
  });

  const [childScheduleForm, setChildScheduleForm] = useState({
    childId: "",
    room: "",
    date: selectedDate,
    scheduledArrival: "",
    scheduledDeparture: "",
    scheduleType: "regular",
    isRecurring: true,
    recurringPattern: "weekly",
    recurringDays: [] as string[],
    mealPlan: [] as string[],
    napTime: "regular",
    notes: "",
  });

  // Mutations
  const createStaffScheduleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/staff-schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-schedules"] });
      toast({ title: "Success", description: "Staff schedule created successfully." });
      setStaffModalOpen(false);
      resetStaffForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create staff schedule.", variant: "destructive" });
    },
  });

  const createChildScheduleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/child-schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-schedules"] });
      toast({ title: "Success", description: "Child schedule created successfully." });
      setChildModalOpen(false);
      resetChildForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create child schedule.", variant: "destructive" });
    },
  });

  const updateScheduleStatusMutation = useMutation({
    mutationFn: ({ id, type, status }: { id: string; type: 'staff' | 'child'; status: string }) => 
      apiRequest("PATCH", `/api/${type}-schedules/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/child-schedules"] });
      toast({ title: "Success", description: "Schedule status updated." });
    },
  });

  const resetStaffForm = () => {
    setStaffScheduleForm({
      staffId: "",
      room: "",
      date: selectedDate,
      scheduledStart: "",
      scheduledEnd: "",
      scheduleType: "regular",
      isRecurring: false,
      recurringPattern: "weekly",
      recurringUntil: "",
      notes: "",
    });
  };

  const resetChildForm = () => {
    setChildScheduleForm({
      childId: "",
      room: "",
      date: selectedDate,
      scheduledArrival: "",
      scheduledDeparture: "",
      scheduleType: "regular",
      isRecurring: true,
      recurringPattern: "weekly",
      recurringDays: [],
      mealPlan: [],
      napTime: "regular",
      notes: "",
    });
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStaffScheduleMutation.mutate(staffScheduleForm);
  };

  const handleChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChildScheduleMutation.mutate(childScheduleForm);
  };

  const toggleRecurringDay = (day: string) => {
    setChildScheduleForm(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  const toggleMealPlan = (meal: string) => {
    setChildScheduleForm(prev => ({
      ...prev,
      mealPlan: prev.mealPlan.includes(meal)
        ? prev.mealPlan.filter(m => m !== meal)
        : [...prev.mealPlan, meal]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-gray-500">Manage staff and student schedules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <Tabs defaultValue="staff" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staff">Staff Schedules</TabsTrigger>
          <TabsTrigger value="children">Student Schedules</TabsTrigger>
          <TabsTrigger value="rooms">Room Capacity</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Staff Schedules */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Schedules - {formatDate(selectedDate)}</CardTitle>
                  <CardDescription>
                    Manage staff work schedules and assignments
                  </CardDescription>
                </div>
                <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Staff Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Staff Schedule</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleStaffSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="staff-select">Staff Member</Label>
                        <Select 
                          value={staffScheduleForm.staffId}
                          onValueChange={(value) => setStaffScheduleForm(prev => ({ ...prev, staffId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((member: Staff) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.firstName} {member.lastName} - {member.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="room-select">Room</Label>
                        <Select 
                          value={staffScheduleForm.room}
                          onValueChange={(value) => setStaffScheduleForm(prev => ({ ...prev, room: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROOMS.map((room) => (
                              <SelectItem key={room} value={room}>
                                {room}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={staffScheduleForm.scheduledStart}
                            onChange={(e) => setStaffScheduleForm(prev => ({ ...prev, scheduledStart: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">End Time</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={staffScheduleForm.scheduledEnd}
                            onChange={(e) => setStaffScheduleForm(prev => ({ ...prev, scheduledEnd: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="schedule-type">Schedule Type</Label>
                        <Select 
                          value={staffScheduleForm.scheduleType}
                          onValueChange={(value) => setStaffScheduleForm(prev => ({ ...prev, scheduleType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="substitute">Substitute</SelectItem>
                            <SelectItem value="overtime">Overtime</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recurring"
                          checked={staffScheduleForm.isRecurring}
                          onCheckedChange={(checked) => 
                            setStaffScheduleForm(prev => ({ ...prev, isRecurring: checked as boolean }))
                          }
                        />
                        <Label htmlFor="recurring">Recurring Schedule</Label>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setStaffModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createStaffScheduleMutation.isPending}>
                          {createStaffScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffSchedules.map((schedule: StaffSchedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        {schedule.staff ? 
                          `${schedule.staff.firstName} ${schedule.staff.lastName}` : 
                          'Unknown Staff'
                        }
                        <div className="text-sm text-gray-500">
                          {schedule.staff?.position}
                        </div>
                      </TableCell>
                      <TableCell>{schedule.room}</TableCell>
                      <TableCell>
                        {formatTime(schedule.scheduledStart)} - {formatTime(schedule.scheduledEnd)}
                        {schedule.isRecurring && (
                          <Badge variant="outline" className="ml-2">Recurring</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.scheduleType === 'regular' ? 'default' : 'secondary'}>
                          {schedule.scheduleType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            schedule.status === 'confirmed' ? 'default' :
                            schedule.status === 'cancelled' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateScheduleStatusMutation.mutate({
                              id: schedule.id,
                              type: 'staff',
                              status: schedule.status === 'scheduled' ? 'confirmed' : 'scheduled'
                            })}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Schedules */}
        <TabsContent value="children" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Schedules - {formatDate(selectedDate)}</CardTitle>
                  <CardDescription>
                    Manage student attendance schedules and meal plans
                  </CardDescription>
                </div>
                <Dialog open={childModalOpen} onOpenChange={setChildModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Student Schedule</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChildSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="child-select">Student</Label>
                        <Select 
                          value={childScheduleForm.childId}
                          onValueChange={(value) => setChildScheduleForm(prev => ({ ...prev, childId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {children.map((child: Child) => (
                              <SelectItem key={child.id} value={child.id}>
                                {child.firstName} {child.lastName} - {child.ageGroup}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="child-room">Room</Label>
                        <Select 
                          value={childScheduleForm.room}
                          onValueChange={(value) => setChildScheduleForm(prev => ({ ...prev, room: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROOMS.map((room) => (
                              <SelectItem key={room} value={room}>
                                {room}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="arrival-time">Arrival Time</Label>
                          <Input
                            id="arrival-time"
                            type="time"
                            value={childScheduleForm.scheduledArrival}
                            onChange={(e) => setChildScheduleForm(prev => ({ ...prev, scheduledArrival: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="departure-time">Departure Time</Label>
                          <Input
                            id="departure-time"
                            type="time"
                            value={childScheduleForm.scheduledDeparture}
                            onChange={(e) => setChildScheduleForm(prev => ({ ...prev, scheduledDeparture: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Recurring Days</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={day}
                                checked={childScheduleForm.recurringDays.includes(day)}
                                onCheckedChange={() => toggleRecurringDay(day)}
                              />
                              <Label htmlFor={day} className="text-sm capitalize">
                                {day.slice(0, 3)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Meal Plan</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {MEAL_OPTIONS.map((meal) => (
                            <div key={meal} className="flex items-center space-x-2">
                              <Checkbox
                                id={meal}
                                checked={childScheduleForm.mealPlan.includes(meal)}
                                onCheckedChange={() => toggleMealPlan(meal)}
                              />
                              <Label htmlFor={meal} className="text-sm capitalize">
                                {meal.replace('_', ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="nap-time">Nap Time</Label>
                        <Select 
                          value={childScheduleForm.napTime}
                          onValueChange={(value) => setChildScheduleForm(prev => ({ ...prev, napTime: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="early">Early (12:00 PM)</SelectItem>
                            <SelectItem value="regular">Regular (1:00 PM)</SelectItem>
                            <SelectItem value="late">Late (2:00 PM)</SelectItem>
                            <SelectItem value="none">No Nap</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setChildModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createChildScheduleMutation.isPending}>
                          {createChildScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Meal Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childSchedules.map((schedule: ChildSchedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        {schedule.child ? 
                          `${schedule.child.firstName} ${schedule.child.lastName}` : 
                          'Unknown Student'
                        }
                        <div className="text-sm text-gray-500">
                          {schedule.child?.ageGroup}
                        </div>
                      </TableCell>
                      <TableCell>{schedule.room}</TableCell>
                      <TableCell>
                        {formatTime(schedule.scheduledArrival)} - {formatTime(schedule.scheduledDeparture)}
                        <div className="text-sm text-gray-500">
                          {schedule.recurringDays.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {schedule.mealPlan.map((meal) => (
                            <Badge key={meal} variant="outline" className="text-xs">
                              {meal.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                        {schedule.napTime && (
                          <div className="text-sm text-gray-500 mt-1">
                            Nap: {schedule.napTime}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge 
                            variant={
                              schedule.status === 'confirmed' ? 'default' :
                              schedule.status === 'cancelled' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {schedule.status}
                          </Badge>
                          {schedule.parentApproved && (
                            <Badge variant="outline" className="text-xs">
                              Parent Approved
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateScheduleStatusMutation.mutate({
                              id: schedule.id,
                              type: 'child',
                              status: schedule.status === 'scheduled' ? 'confirmed' : 'scheduled'
                            })}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Room Capacity */}
        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Capacity & Utilization</CardTitle>
              <CardDescription>
                Monitor room capacity and staff-to-child ratios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ROOMS.map((room) => {
                  const staffInRoom = staffSchedules.filter(s => s.room === room && s.status !== 'cancelled').length;
                  const childrenInRoom = childSchedules.filter(c => c.room === room && c.status !== 'cancelled').length;
                  const ratio = staffInRoom > 0 ? childrenInRoom / staffInRoom : 0;
                  
                  return (
                    <Card key={room}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">{room}</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Staff Scheduled:</span>
                              <span className="font-medium">{staffInRoom}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Students Scheduled:</span>
                              <span className="font-medium">{childrenInRoom}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ratio:</span>
                              <span className={`font-medium ${ratio > 8 ? 'text-red-600' : ratio > 6 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {staffInRoom > 0 ? `1:${ratio.toFixed(1)}` : 'No Staff'}
                              </span>
                            </div>
                          </div>
                          {ratio > 8 && (
                            <Badge variant="destructive" className="text-xs">
                              Over Capacity
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Templates</CardTitle>
              <CardDescription>
                Create and manage reusable schedule templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Templates</h3>
                <p className="text-gray-500 mb-4">Coming soon - create templates for recurring schedules</p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}