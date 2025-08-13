import { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface StaffEvent {
  id?: string;
  title?: string;
  start: Date;
  end: Date;
  staffId: string;
  staffName: string;
  room: string;
  type: string;
  notes?: string;
}

export default function StaffScheduling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<StaffEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  
  const [formData, setFormData] = useState({
    staffId: '',
    room: 'Infant Room',
    type: 'regular',
    notes: ''
  });

  // Fetch staff for dropdown
  const { data: staffResponse } = useQuery({
    queryKey: ["staff", 1],
    queryFn: async () => {
      const res = await fetch(`/api/staff?page=1&limit=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
  });

  const staff = staffResponse?.data || [];

  // Fetch schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["staff-schedules"],
    queryFn: async () => {
      const res = await fetch("/api/schedules", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
  });

  // Transform schedules to calendar events
  const events: StaffEvent[] = schedules.map((schedule: any) => ({
    id: schedule.id,
    title: `${schedule.staffName || 'Staff'} - ${schedule.room}`,
    start: new Date(schedule.scheduledStart),
    end: new Date(schedule.scheduledEnd),
    staffId: schedule.staffId,
    staffName: schedule.staffName || 'Unknown Staff',
    room: schedule.room,
    type: schedule.type || 'regular',
    notes: schedule.notes
  }));

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-schedules"] });
      toast({
        title: "Success",
        description: "Schedule created successfully.",
      });
      setShowEventModal(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create schedule.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/schedules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-schedules"] });
      toast({
        title: "Success",
        description: "Schedule updated successfully.",
      });
      setShowEventModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update schedule.",
        variant: "destructive",
      });
    },
  });

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-schedules"] });
      toast({
        title: "Success",
        description: "Schedule deleted successfully.",
      });
      setShowEventModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete schedule.",
        variant: "destructive",
      });
    },
  });

  const handleSelectEvent = useCallback((event: StaffEvent) => {
    setSelectedEvent(event);
    setFormData({
      staffId: event.staffId,
      room: event.room,
      type: event.type,
      notes: event.notes || ''
    });
    setSelectedSlot(null);
    setShowEventModal(true);
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    resetForm();
    setShowEventModal(true);
  }, []);

  const resetForm = () => {
    setFormData({
      staffId: '',
      room: 'Infant Room',
      type: 'regular',
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.staffId) {
      toast({
        title: "Error",
        description: "Please select a staff member.",
        variant: "destructive",
      });
      return;
    }

    if (selectedEvent) {
      // Update existing event
      updateScheduleMutation.mutate({
        id: selectedEvent.id!,
        data: {
          ...formData,
          scheduledStart: selectedEvent.start,
          scheduledEnd: selectedEvent.end,
          date: selectedEvent.start
        }
      });
    } else if (selectedSlot) {
      // Create new event with validation
      const now = new Date();
      
      // Validate that scheduled start time is not in the past
      if (selectedSlot.start < now) {
        toast({
          title: "Error",
          description: "Cannot schedule staff for a time in the past. Please select a start time after the current time.",
          variant: "destructive",
        });
        return;
      }

      // Validate that end time is after start time
      if (selectedSlot.end <= selectedSlot.start) {
        toast({
          title: "Error",
          description: "End time must be after start time.",
          variant: "destructive",
        });
        return;
      }

      createScheduleMutation.mutate({
        ...formData,
        scheduledStart: selectedSlot.start,
        scheduledEnd: selectedSlot.end,
        date: selectedSlot.start
      });
    }
  };

  const handleDelete = () => {
    if (selectedEvent?.id) {
      deleteScheduleMutation.mutate(selectedEvent.id);
    }
  };

  // Event style based on shift type
  const eventStyleGetter = (event: StaffEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.type) {
      case 'regular':
        backgroundColor = '#28a745';
        break;
      case 'float':
        backgroundColor = '#ffc107';
        break;
      case 'overtime':
        backgroundColor = '#dc3545';
        break;
      case 'training':
        backgroundColor = '#6c757d';
        break;
      default:
        backgroundColor = '#3174ad';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const rooms = [
    'Infant Room',
    'Toddler Room',
    'Preschool Room',
    'School Age Room',
    'Float/Relief',
    'Kitchen',
    'Administration'
  ];

  const shiftTypes = [
    { value: 'regular', label: 'Regular Shift' },
    { value: 'float', label: 'Float/Relief' },
    { value: 'overtime', label: 'Overtime' },
    { value: 'training', label: 'Training' }
  ];

  if (isLoading) {
    return (
      <>
        <Header title="Staff Scheduling" subtitle="Manage staff schedules and shifts" />
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <p>Loading schedules...</p>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Staff Scheduling" subtitle="Manage staff schedules and shifts" />
      <main className="flex-1 p-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Staff Schedule Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                defaultView="week"
                step={30}
                timeslots={2}
                min={new Date(2025, 0, 1, 6, 0)} // 6:00 AM
                max={new Date(2025, 0, 1, 20, 0)} // 8:00 PM
              />
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                <span>Regular Shift</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span>Float/Relief</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                <span>Overtime</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-600 rounded mr-2"></div>
                <span>Training</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Modal */}
        <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent ? 'Edit Shift' : 'Schedule New Shift'}
              </DialogTitle>
              <DialogDescription>
                {selectedSlot && (
                  <span>
                    {moment(selectedSlot.start).format('MMMM D, YYYY')} • {' '}
                    {moment(selectedSlot.start).format('h:mm A')} - {' '}
                    {moment(selectedSlot.end).format('h:mm A')}
                  </span>
                )}
                {selectedEvent && (
                  <span>
                    {moment(selectedEvent.start).format('MMMM D, YYYY')} • {' '}
                    {moment(selectedEvent.start).format('h:mm A')} - {' '}
                    {moment(selectedEvent.end).format('h:mm A')}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="staff">Staff Member</Label>
                <Select
                  value={formData.staffId}
                  onValueChange={(value) => setFormData({ ...formData, staffId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member: any) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="room">Room/Area</Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) => setFormData({ ...formData, room: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Shift Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <div>
                  {selectedEvent && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete Shift
                    </Button>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEventModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedEvent ? 'Update Shift' : 'Schedule Shift'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}